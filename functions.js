const db = require('./connection');
const jwt=require("jsonwebtoken");
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
require('dotenv').config();
const saltRounds = 10;
const secret = process.env.SECRET;

const ALLOWED_TABLES = ["carpetas", "notas", "seccion", "tareas "];

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

async function insert(req, res){
    const {table}=req.params;
    const {values}=req.body;

    if (!Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ error: "values debe ser un arreglo no vacío" });
    }

    const fields = values.map((_, i) => `$${i + 1}`).join(", ");

    try {
        const result = await db.query(`insert into "${table}" values (default, ${fields}) returning id`, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Internal Server Error ${err}`);
    }
}

async function updateByPk(req, res){
    const { table, id } = req.params;
    const { fields, values } = req.body;

    if (!Array.isArray(fields) || !Array.isArray(values) || fields.length !== values.length) {
        return res.status(400).json({ error: "fields y values deben ser arreglos del mismo tamaño" });
    }

    try {
        const setClauses = fields.map((field, i) => `"${field}" = $${i + 1}`).join(", ");

        const queryValues = [...values, id];
        const query = `UPDATE "${table}" SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`;

        const result = await db.query(query, queryValues);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error("Error en update:", err.message);
        res.status(500).json({ error: "Error al actualizar registro" });
    }
}

async function updateByColumn(req, res){
    const { table, column, value } = req.params;
    const { fields, values } = req.body;

    if (!Array.isArray(fields) || !Array.isArray(values) || fields.length !== values.length) {
        return res.status(400).json({ error: "fields y values deben ser arreglos del mismo tamaño" });
    }

    try {
        const setClauses = fields.map((field, i) => `"${field}" = $${i + 1}`).join(", ");

        const queryValues = [...values, value];
        const query = `UPDATE "${table}" SET ${setClauses} WHERE ${column} = $${values.length + 1} RETURNING *`;

        const result = await db.query(query, queryValues);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error("Error en update:", err.message);
        res.status(500).json({ error: "Error al actualizar registro" });
    }
}

module.exports = {
    selectAll,
    selectByPk,
    selectByColumn,
    selectOptions,
    deleteByPk,
    deleteByColumn,
    auth,
    verifyToken,
    verifySQL,
    insert,
    updateByPk,
    updateByColumn
}