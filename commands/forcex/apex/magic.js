const command = require("@salesforce/command");
const fs      = require("fs");

module.exports = class extends command.SfdxCommand {
	static requiresUsername = true;
	static requiresProject = true;
	static description = "imports managed global classes to the Apex language server";
	static flagsConfig = { 
		batchsize: command.flags.integer({ char: "b", description: "retrieval batch size" })
	};

	async run() {
		this.ux.startSpinner("Retrieving Apex manifest");
		this.connection  = this.org.getConnection();
		this.projectJson = await this.project.resolveProjectConfig();

		const toolsPath = `${this.project.getPath()}/.sfdx/tools/installed-packages`;
		if(!fs.existsSync(toolsPath)) fs.mkdirSync(toolsPath);

		const recordIds = [ ];
		for(let item of await this.connection.request("/tooling/apexManifest")) {
			const packagePath = `${toolsPath}/${item.namespace}`;
			if(!fs.existsSync(packagePath)) {
				fs.mkdirSync(packagePath);
				fs.writeFileSync(
					`${packagePath}/installed-package.json`,
					JSON.stringify({ namespace: item.namespace }, null, "\t")
				);
			}

			if(item.type == "CLASS" && item.namespace != this.projectJson.namespace) {
				recordIds.push(item.id);
			}
		}

		this.ux.startSpinner("Retrieving Apex managed classes");
		this.ux.setSpinnerStatus(`0/${ recordIds.length }`);

		const batchSize = this.flags.batchsize || 200;
		for(let i = 0; i < Math.ceil(recordIds.length / batchSize); ++i) {
			const startIndex = batchSize * i;
			const endIndex   = startIndex + batchSize;

			const qs = this.buildQueryString({
				ids: recordIds.slice(startIndex, endIndex).join(','),
				fields: [ "Id", "NamespacePrefix", "Name", "Body" ]
			});
			for(let record of await this.connection.request(`/composite/sobjects/ApexClass?${ qs }`))
				fs.writeFileSync(`${ toolsPath }/${ record.NamespacePrefix }/${ record.Name }.cls`, record.Body);

			this.ux.setSpinnerStatus(`${ Math.min(recordIds.length, endIndex) }/${ recordIds.length }`);
		}
		this.ux.stopSpinner(`${ recordIds.length } retrieved!`);
	}

	buildQueryString(parameters) {
		const pairs = [ ];
		for(const key in parameters)
			pairs.push(`${ key }=${ parameters[key] }`);
		return pairs.join('&');
	}
}