const { AddStrategyController, GetAllStrategiesController, DeleteStrategyController, GetStrategyController,getDlData,postDlData ,getStockInfo,getChartDataDetails,ValidateStock, jobqueue, getJobQueue} = require("./controllers/StrategyManagement");

const StrategyManagement = require("express").Router()



StrategyManagement.post("/insert", AddStrategyController)
StrategyManagement.get("/getdldta", getDlData)
StrategyManagement.get("/get", GetAllStrategiesController)
StrategyManagement.get("/getone", GetStrategyController)
StrategyManagement.delete("/", DeleteStrategyController)
StrategyManagement.post("/insertdldata", postDlData)
StrategyManagement.get("/getstockinfo", getStockInfo)
StrategyManagement.get("/chartdata", getChartDataDetails)
StrategyManagement.get("/validatestock", ValidateStock)
StrategyManagement.get("/getjobqueue", getJobQueue)
StrategyManagement.post("/jobqueue", jobqueue)









exports.StrategyManagement = StrategyManagement;