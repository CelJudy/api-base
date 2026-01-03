const express = require('express');
const cors=require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const tables = require("./src/routes/tables");
const auth = require("./src/routes/auth");

app.use("/api", tables);
app.use("/api", auth);

app.listen(3000, (err) => {
    console.log("Listening on port 3000");
});