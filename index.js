let x = require('./build/server/main')
require('dotenv').config()

x.default().then(x => {
	console.log("done")
	process.exit()
})
