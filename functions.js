const db = require('./connection');
const jwt=require("jsonwebtoken");
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
require('dotenv').config();
const saltRounds = 10;
const secret = process.env.SECRET;

async function selectAll(req, res){
    try {
        const result = await db.query(`SELECT * FROM ${req.params.table}`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function selectByPk(req, res){
    const {table, id}=req.params;
    try {
        const result = await db.query(
            `SELECT * FROM ${table} where id=$1`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function selectByColumn(req, res){
    const {table, column, value}=req.params;
    try {
        const result = await db.query(
            `SELECT * FROM ${table} where ${column}=$1`,
            [value]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function selectOptions(req, res){
    try {
        const result = await db.query(`SELECT id as value, ${req.params.column} as item FROM ${req.params.table}`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteByPk(req, res){
    const {table, id}=req.params;
    try {
        const result = await db.query(
            `delete from ${table} where id=$1`,
            [id]
        );
        res.json({message:"ok"});
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteByColumn(req, res){
    const {table, column, value}=req.params;
    try {
        const result = await db.query(
            `delete from ${table} where ${column}=$1`,
            [value]
        );
        res.json({message:"ok"});
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function auth(req, res){
    const {user, pass}=req.body;
    //const p=CryptoJS.AES.encrypt(pass, secret).toString();
    //console.log(p); //U2FsdGVkX18FFPkoGlBuSJKUL2/UR4S6DKbYtgjHknU=  //12345
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

async function verifyToken(req, res, next){
    const token=req.get("access-token");
    jwt.verify(token, secret, function(err, decoded) {
        console.log("decoded", decoded);
        if(decoded===undefined){
            res.json({message:"invalid token"});
        }else{
            next();
        }
    });
    
}

module.exports = {
    selectAll,
    selectByPk,
    selectByColumn,
    selectOptions,
    deleteByPk,
    deleteByColumn,
    auth,
    verifyToken
}