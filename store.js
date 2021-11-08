const {
    app
} = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')

class Store {

    constructor(option) {
        const userDataPath = app.getPath('userData')
        this.path = path.join(userDataPath, option.configName +'.json')
        this.data = parseDataFile(this.path, option.defaults)

    }

    get(key) {
        return this.data[key]
    }

    set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }

}

function parseDataFile(filePath, defaults){
    try{
        return JSON.parse(fs.readFileSync(filePath))
    }catch{
        return defaults
    }
}

module.exports = Store