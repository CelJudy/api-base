const express = require("express");
const router = express.Router();

const tables = require("../controller/tables");
const middleware = require("../controller/middleware");

router.get("/select/all/:table", middleware.verifyToken, middleware.verifySQL, tables.selectAll);
router.get("/select/id/:table/:id", middleware.verifyToken, middleware.verifySQL, tables.selectByPk);
router.get("/select/column/:table/:column/:value", middleware.verifyToken, middleware.verifySQL, tables.selectByColumn);
router.get("/select/options/:table/:column", middleware.verifyToken, middleware.verifySQL, tables.selectOptions);

router.delete("/delete/:table/:id", middleware.verifyToken, middleware.verifySQL, tables.deleteByPk);
router.delete("/delete/:table/:column/:value", middleware.verifyToken, middleware.verifySQL, tables.deleteByColumn);

router.post("/insert/:table", middleware.verifyToken, middleware.verifySQL, tables.insert);
router.post("/insert/many/:table", middleware.verifyToken, middleware.verifySQL, tables.insertMany);

router.put("/update/:table/:id", middleware.verifyToken, middleware.verifySQL, tables.updateByPk);
router.put("/update/:table/:column/:value", middleware.verifyToken, middleware.verifySQL, tables.updateByColumn);

module.exports = router;