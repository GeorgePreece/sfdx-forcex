const command = require("@salesforce/command");

module.exports = class extends command.SfdxCommand {
	static name = "forcex:apex:graph:create";
	static requiresUsername = true;
	static requiresProject = true;
	static description = "builds a dependency graph of Apex classes";

	async run() {
		var result = new Object();

		this.connection  = this.org.getConnection();

		result.nodes = await this.fetchNodes();
		result.edges = await this.fetchEdges();

		return result;
	}

	async fetchNodes() {
		const result = [ ];

		this.ux.startSpinner("Retrieving Apex manifest");

		const manifest = await this.connection.request("/tooling/apexManifest");
		for(const item of manifest) {
			const node = { };
			node.id = item.id;
			node.name = `${item.namespace || "c"}.${item.name}`;
			node.type = item.type;
			result.push(node);
		}

		this.ux.stopSpinner("Apex manifest retrieved successfully!");

		return result;
	}

	async fetchEdges() {
		const result = [ ];

		this.ux.startSpinner("Retrieving component dependencies");

		const query = `
			SELECT Id, 
				MetadataComponentId, 
				RefMetadataComponentId
			FROM MetadataComponentDependency 
			WHERE MetadataComponentType = 'ApexClass'
				AND RefMetadataComponentType = 'ApexClass'
		`;
		const data = await this.connection.tooling.autoFetchQuery(query);
		for(const record of data.records) {
			const item = { };
			item.from = record.MetadataComponentId;
			item.to = record.RefMetadataComponentId;
			result.push(item);
		}

		this.ux.stopSpinner("Component dependencies retrieved successfully!");

		return result;
	}
}