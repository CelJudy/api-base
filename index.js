const express = require('express');
const cors=require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const functions = require("./functions");

app.get("/api/select/all/:table", functions.verifyToken, functions.selectAll);
app.get("/api/select/id/:table/:id", functions.verifyToken, functions.selectByPk);
app.get("/api/select/column/:table/:column/:value", functions.verifyToken, functions.selectByColumn);
app.get("/api/select/options/:column/:table", functions.verifyToken, functions.selectOptions);

app.delete("/api/delete/:table/:id", functions.verifyToken, functions.deleteByPk);
app.delete("/api/delete/:table/:column/:value", functions.verifyToken, functions.deleteByColumn);

app.get("/api/auth", functions.auth);

app.listen(3000, (err) => {
    console.log("Listening on port 3000");
});