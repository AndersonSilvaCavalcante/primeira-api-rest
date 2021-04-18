const mongoose = require('mongoose')
console.log(process.env.MONGO_DB)
mongoose.connect(process.env.MONGO_DB)

mongoose.Promise = global.Promise

module.exports = mongoose