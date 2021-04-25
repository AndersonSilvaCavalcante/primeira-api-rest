const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')
const router = express.Router()

router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) {
            return res.status(403).send({ error: "Usuário já registrado" })
        }

        const user = await User.create(req.body)
        user.password = undefined
        return res.send({ user })

    } catch (error) {
        return res.status(400).send({ error: "Falha ao registrar Usuário" })
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if (!user)
        return res.status(400).send({ error: "Usuário não encontrado" })

    if (!await bcrypt.compare(password, user.password))
        return res.status(403).send({ error: "Email ou senha incorretos" })

    user.password = undefined
    const token = jwt.sign({ id: user.id }, process.env.JWTSECRET, { expiresIn: 30000})

    res.send({ user, token })
})

router.post('/esqueci_a_senha', async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(404).send({ error: "Usuário não encontrado" })

        name = user.name
        const token = crypto.randomBytes(20).toString('hex')
        const now = new Date()
        now.setMinutes(now.getMinutes() + 15)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })
        console.log(token)
        mailer.sendMail({
            to: email,
            from: 'recupera@mail.com',
            template: 'template',
            context: { name, token }
        }, (err) => {
            if (err)
                console.log(err)
                return res.status(400).send({ error: "Não foi posível enviar o email de recuperação" })

            return res.send()
        })

    } catch (err) {
        res.status(400).send({ erro: "Erro ao tentar recuperar senha" })
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')

        if (!user)
            return res.status(404).send({ error: "Usuário não encontrado" })

        if(token !== user.passwordResetToken)
            return res.status(400).send({error: 'Token inválido'})
        
        const now = new Date()

        if(now > user.passwordResetExpires)
            return res.status(403).send({erro: "Token expirado"})
        
        user.password = password

        await user.save()

        return res.send()

    } catch (err) {
        console.log(err)
        res.status(400).send({ error: "Não foi possível resetar a senha, tente novamente" })
    }
})
module.exports = app => app.use('/auth', router)