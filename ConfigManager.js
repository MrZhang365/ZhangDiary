// ConfigManager.js 代码来自ZhangHelper365，Made by MrZhang365
const fs = require("fs")
const path = require("path")

class ConfigManager {
	constructor(configPath) {
		this.configPath = configPath || path.resolve(__dirname, 'config', 'config.json')
		this.config = {}
	}
	load() {
		this.config = JSON.parse(fs.readFileSync(this.configPath))
		return this.config
	}
	save() {
		fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4))
	}
}

module.exports = ConfigManager
