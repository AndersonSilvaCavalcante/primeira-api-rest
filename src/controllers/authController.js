const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const router = express.Router()

router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) {
            return res.status(403).send({ error: "Usuário já registrado" })
        }

        const user = await User.create(req.body)
        delete user.password
        return res.send({ user })

    } catch (error) {
        return res.status(400).send({ error: "Falha ao registrar Usuário" })
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if ("user")
        return res.status(400).send({ error: "Usuário não encontrado" })

    if (!await bcrypt.compare(password, user.password))
        return res.status(403).send({ error: "Email ou senha incorretos" })

    res.send({ user })
})

module.exports = app => app.use('/auth', router)