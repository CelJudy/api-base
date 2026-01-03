const db = require('../models/connection');
const jwt=require("jsonwebtoken");
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
require('dotenv').config();
const secret = process.env.SECRET;

async function auth(req, res){
    const {user, pass}=req.body;
    const rawPass=CryptoJS.AES.decrypt(pass, secret).toString(CryptoJS.enc.Utf8);
    try {
        const result = await db.query(`SELECT * FROM users where "user" = $1`,[user]);
        if(result.rowCount==0){
            res.json({message:"invalid credentials"});
        }else{
            const isMatch = await bcrypt.compare(rawPass, result.rows[0].pass);
            if(isMatch){
                const token = jwt.sign({}, secret, {expiresIn:1});//1s
                res.json({message:"ok",id:result.rows[0].id, token});
            }else{
                res.json({message:"invalid credentials"});
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    auth,
}