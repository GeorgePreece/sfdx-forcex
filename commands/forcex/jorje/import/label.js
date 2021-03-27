const command = require("@salesforce/command");
const fs      = require("fs");

module.exports = class extends command.SfdxCommand {
	static requiresUsername = true;
	static requiresProject = true;
	static description = "imports custom labels to jorje";

	async run() {
		this.connection  = this.org.getConnection();
		this.projectJson = await this.project.resolveProjectConfig();

		const storageLocation = `${this.project.getPath()}/.sfdx/tools/sobjects/standardObjects`
		this.initializeDirectory(storageLocation);
		
		const externalStrings = await this.fetchExternalStrings();
		this.createFauxClass(storageLocation, "Label", externalStrings);

		this.ux.log("You may need to restart jorje for changes to take effect");
	}

	initializeDirectory(directory) {
		fs.rmdirSync(directory, { recursive: true });
		fs.mkdirSync(directory, { recursive: true });
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

	createFauxClass(directory, name, externalStrings) {
		var data = `global class ${name} {\n`;
		for(let item of externalStrings) {
			const value = item.value.replace("*/", "*\\/");
			data += `\t/**\n\t * ${value}\n\t */\n`
				+ `\tglobal static String ${ item.name };\n`;
		}
		data += `}`;
		fs.writeFileSync(`${directory}/${name}.cls`, data);
	}
}