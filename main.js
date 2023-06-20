const ConfigManager = require('./ConfigManager')

function loadConfig() {
    global.configManager = new ConfigManager()
    global.config = global.configManager.load()
}

function initServer() {
    global.server = require('./HTTP-Server')
    global.server.listen(global.config.port)
}

function start() {
    loadConfig()
    initServer()
    console.log('Server was started.')
}

start()