const db = require('../models/connection');
require('dotenv').config();

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
        res.json(result.rows[0]);
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
        res.json({message:"ok", deletedRows: result.rowCount});
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
        res.json({message:"ok", deletedRows: result.rowCount});
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
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

async function insertMany(req, res){
    const {table}=req.params;
    const {values}=req.body;

    if (!Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ error: "values debe ser un arreglo no vacío" });
    }
    let x=0;

    let val=[];
    const fields=values.map((element)=>{
        return element.map((value)=>{
            val.push(value);
            x++;
            return `$${x}`;
        }).join(", ");
    }).join("), (default, ");

    try {
        const result = await db.query(`insert into "${table}" values (default, ${fields}) returning id`, val);
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
        const query = `UPDATE "${table}" SET ${setClauses} WHERE id = $${values.length + 1}`;

        const result = await db.query(query, queryValues);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json({message:"ok", updatedRows: result.rowCount});
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
        const query = `UPDATE "${table}" SET ${setClauses} WHERE ${column} = $${values.length + 1}`;

        const result = await db.query(query, queryValues);

        res.json({message:"ok", updatedRows: result.rowCount});
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
    insert,
    insertMany,
    updateByPk,
    updateByColumn
}