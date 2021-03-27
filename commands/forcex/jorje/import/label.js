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
		const body = externalStrings
			.map(x => `\tglobal static String ${x.name} = '${x.value.replace("'", "\\'")}';`)
			.join("\n")
		const data = `global class ${name} {\n${body}\n}`;
		fs.writeFileSync(`${directory}/${name}.cls`, data);
	}
}