const express = require('express')
const app = express()


const { AccessManagment } = require("../api/AccessManagment");
const { StrategyManagement } = require('../api/StrategyManagement');

app.use("/access", AccessManagment);
app.use("/strategy", StrategyManagement);




module.exports = app