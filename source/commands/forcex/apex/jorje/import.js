const command = require("@salesforce/command");
const fs      = require("fs");

module.exports = class extends command.SfdxCommand {
	static name = "forcex:apex:import";
	static requiresUsername = true;
	static requiresProject = true;
	static description = "imports global classes and labels from managed packages to jorje";

	async run() {
		this.connection  = this.org.getConnection();
		this.projectJson = await this.project.resolveProjectConfig();

		const toolsPath = `${this.project.getPath()}/.sfdx/tools`;
		await this.importApexClasses(toolsPath);
		await this.importExternalStrings(toolsPath);
		fs.rmSync(`${toolsPath}/apex.db`);

		this.ux.log("You may need to restart jorje for changes to take effect");
	}

	async importApexClasses(directory) {
		const storageLocation = `${directory}/installed-packages`;
		this.initializeDirectory(storageLocation);
		
		const recordIds = await this.fetchApexManifest();
		await this.createFauxApexClasses(storageLocation, recordIds);
	}

	async importExternalStrings(directory) {
		const storageLocation = `${directory}/sobjects/standardObjects`
		this.initializeDirectory(storageLocation);

		const externalStrings = await this.fetchExternalStrings();
		await this.createFauxLabelClass(storageLocation, externalStrings);
	}

	initializeDirectory(path) {
		if(fs.existsSync(path)) {
			fs.rmSync(path, { recursive: true });
		}
		fs.mkdirSync(path, { recursive: true });
	}

	initializePackageDirectory(directory, namespace) {
		this.initializeDirectory(directory);

		const data = JSON.stringify({ namespace }, null, "\t")
		fs.writeFileSync(`${directory}/installed-package.json`, data);
	}

	async fetchApexManifest() {
		this.ux.startSpinner("Retrieving Apex manifest");

		const namespace = this.projectJson.namespace;
		const result = (await this.connection.request("/tooling/apexManifest"))
			.filter(x => x.type == "CLASS" && x.namespace !== namespace)
			.map(x => x.id);

		this.ux.stopSpinner("Apex manifest retrieved successfully");

		return result;
	}

	async fetchExternalStrings() {
		this.ux.startSpinner("Retrieving external strings");
		
		const query = "SELECT Id, NamespacePrefix, Name, Value FROM ExternalString";
		const data = await this.connection.tooling.autoFetchQuery(query);
		const result = data.records
			.filter(x => x.NamespacePrefix === this.projectJson.namespace)
			.map(x => ({ name: x.Name, value: x.Value }));

		this.ux.stopSpinner("External strings retrieved successfully");

		return result;
	}

	async createFauxApexClasses(directory, recordIds) {
		this.ux.startSpinner(`Creating ${recordIds.length} faux classes`);

		for(const chunk of this.chunkArray(recordIds, 2000)) {
			for(const record of await this.connection.retrieve("ApexClass", chunk)) {
				const packageDirectory = `${directory}/${record.NamespacePrefix}`;
	
				if(!fs.existsSync(packageDirectory))
					this.initializePackageDirectory(packageDirectory, record.NamespacePrefix);
	
				// Strip the body of any annotations since they cause issues with 
				// the VSCode extensions and don't provide any insights to the 
				// language server
				const data = record.Body.replace(/@\w+(?:\(.*?\))?\s*/g, '');
				fs.writeFileSync(`${packageDirectory}/${record.Name}.cls`, data);
			}	
		}

		this.ux.stopSpinner("Faux classes created successfully");
	}

	async createFauxLabelClass(directory, externalStrings) {
		var data = `global class Label {\n`;
		for(let item of externalStrings) {
			const value = item.value.replace("*/", "*\\/");
			data += `\t/**\n\t * ${value}\n\t */\n`
				+ `\tglobal static String ${ item.name };\n`;
		}
		data += `}`;
		fs.writeFileSync(`${directory}/Label.cls`, data);
	}

	chunkArray(data, chunkSize) {
		const result = [ ];
		for(let i = 0; i < data.length; i += chunkSize)
			result.push(data.slice(i, i + chunkSize));
		return result;
	}
}