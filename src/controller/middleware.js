const jwt=require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.SECRET;

function verifySQL(req, res, next){
    if(req.body.fields !== undefined){
        for (const field of req.body.fields) {
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
                return res.status(400).json({ error: `Nombre de columna inválido: ${field}` });
            }
        }
    }
    if(req.params.column !== undefined){
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(req.params.column)) {
            return res.status(400).json({ error: `Nombre de columna inválido: ${req.params.column}` });
        }
    }
    if(req.params.table !== undefined){
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(req.params.table)) {
            return res.status(400).json({ error: `Nombre de tabla inválido: ${req.params.table}` });
        }
    }
    
    next();
}

async function verifyToken(req, res, next){
    const token=req.get("access-token");
    jwt.verify(token, secret, function(err, decoded) {
        if(decoded===undefined){
            res.json({message:"Invalid token"});
        }else{
            next();
        }
    });
    
}

module.exports = {
    verifyToken,
    verifySQL
}