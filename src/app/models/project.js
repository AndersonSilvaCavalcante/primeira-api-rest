const mongoose = require('../../database')
const bcrypt = require('bcrypt')

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        requerire: true
    },
    description: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const Project = mongoose.model('Project', ProjectSchema)

module.exports = Project