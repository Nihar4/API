const express = require('express')
const app = express()


const { AccessManagment } = require("../api/AccessManagment")

app.use("/access", AccessManagment);



module.exports = app