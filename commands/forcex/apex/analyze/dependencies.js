const command = require("@salesforce/command");

module.exports = class extends command.SfdxCommand {
	static requiresUsername = true;
	static requiresProject = true;
	static description = "retrieves and aggregates Apex class dependencies";

	async run() {
		this.connection  = this.org.getConnection();
		this.projectJson = await this.project.resolveProjectConfig();

		const dependencies = await this.fetchDependencies(this.projectJson.namespace);
		const data = this.aggregateDependencies(dependencies);

		this.ux.logJson(data);
	}

	async fetchDependencies(namespace) {
		this.ux.startSpinner("Retrieving metadata component dependencies");

		const query = `
			SELECT Id, 
				MetadataComponentNamespace, 
				MetadataComponentName, 
				RefMetadataComponentNamespace, 
				RefMetadataComponentName
			FROM MetadataComponentDependency 
			WHERE MetadataComponentNamespace = '${namespace}'
				AND RefMetadataComponentType = 'ApexClass'
		`;
		const data = await this.connection.tooling.autoFetchQuery(query);
		const result = data.records;

		this.ux.stopSpinner("Metadata component dependencies retrieved successfully");

		this.ux.logJson(
			await this.connection.tooling.autoFetchQuery(
				`
					SELECT Id, SymbolTable 
					FROM ApexClass 
					WHERE Name = 'ApplySubmittedEventListener'
				`
			)
		);

		return result;
	}

	aggregateDependencies(dependencies) {
		const result = { };

		for(const dependency of dependencies) {
			const className = `${dependency.MetadataComponentNamespace}.${dependency.MetadataComponentName}`;
			const refClassName = `${dependency.RefMetadataComponentNamespace}.${dependency.RefMetadataComponentName}`;

			if(result[className] == undefined) 
				result[className] = [ ];
			result[className].push(refClassName);
		}

		return result;
	}
}