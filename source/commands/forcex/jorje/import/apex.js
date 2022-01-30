const command = require("@salesforce/command");
const fs      = require("fs");

module.exports = class extends command.SfdxCommand {
	static requiresUsername = true;
	static requiresProject = true;
	static description = "imports global classes from managed packages to jorje";

	async run() {
		this.connection  = this.org.getConnection();
		this.projectJson = await this.project.resolveProjectConfig();

		const storageLocation = `${this.project.getPath()}/.sfdx/tools/installed-packages`
		this.initializeDirectory(storageLocation);
		
		const recordIds = await this.fetchApexManifest();
		await this.createFauxClasses(storageLocation, recordIds);

		this.ux.log("You may need to restart jorje for changes to take effect");
	}

	initializeDirectory(directory) {
		fs.rmdirSync(directory, { recursive: true });
		fs.mkdirSync(directory, { recursive: true });
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
			.filter(x => x.type == "CLASS" && x.namespace !== this.projectJson)
			.map(x => x.id);

		this.ux.stopSpinner("Apex manifest retrieved successfully");

		return result;
	}

	async createFauxClasses(directory, recordIds) {
		this.ux.startSpinner(`Creating ${recordIds.length} faux classes`);

		for(const record of await this.connection.retrieve("ApexClass", recordIds)) {
			const packageDirectory = `${directory}/${record.NamespacePrefix}`;

			if(!fs.existsSync(packageDirectory))
				this.initializePackageDirectory(packageDirectory, record.NamespacePrefix);

			// Strip the body of any annotations since they cause issues with 
			// the VSCode extensions and don't provide any insights to the 
			// language server
			const data = record.Body.replace(/@\w+(?:\(.*?\))?\s*/g, '');
			fs.writeFileSync(`${packageDirectory}/${record.Name}.cls`, data);
		}

		this.ux.stopSpinner("Faux classes created successfully");
	}
}