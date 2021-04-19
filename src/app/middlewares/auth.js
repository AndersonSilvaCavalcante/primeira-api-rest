const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(403).send({error:"Não autorizado"})
    }else{
        const token = authorization.replace('Bearer ','');
        
        jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({error:"Token inválido"})
            }else{
                req.userId = decoded.id;
                return next()
            }   
        })
    }
}