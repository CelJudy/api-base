const express = require('express');
const cors=require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const functions = require("./functions");

app.get("/api/select/all/:table", functions.verifyToken, functions.verifySQL, functions.selectAll);
app.get("/api/select/id/:table/:id", functions.verifyToken, functions.verifySQL, functions.selectByPk);
app.get("/api/select/column/:table/:column/:value", functions.verifyToken, functions.verifySQL, functions.selectByColumn);
app.get("/api/select/options/:table/:column", functions.verifyToken, functions.verifySQL, functions.selectOptions);

app.delete("/api/delete/:table/:id", functions.verifyToken, functions.verifySQL, functions.deleteByPk);
app.delete("/api/delete/:table/:column/:value", functions.verifyToken, functions.verifySQL, functions.deleteByColumn);

app.post("/api/insert/:table", functions.verifyToken, functions.verifySQL, functions.insert);

app.put("/api/update/:table/:id", functions.verifyToken, functions.verifySQL, functions.updateByPk);
app.put("/api/update/:table/:column/:value", functions.verifyToken, functions.verifySQL, functions.updateByColumn);

app.post("/api/auth", functions.auth);

app.listen(3000, (err) => {
    console.log("Listening on port 3000");
});