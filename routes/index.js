const express = require('express')
const app = express()


const { AccessManagment } = require("../api/AccessManagment");
const { StrategyManagement } = require('../api/StrategyManagement');
const { BackOffice } = require('../api/BackOffice');

app.use("/access", AccessManagment);
app.use("/strategy", StrategyManagement);
app.use("/back-office", BackOffice);





module.exports = app