const { AddStrategyController_Eureka, GetAllStrategiesController_Eureka, DeleteStrategyController_Eureka, GetStrategyController_Eureka, InsertDlDataEureka } = require("./controllers/EurekaStrategyManagement");
const { AddStrategyController, GetAllStrategiesController, DeleteStrategyController, GetStrategyController,getDlData,postDlData ,getStockInfo,getChartDataDetails,ValidateStock, jobqueue, getJobQueue, getlongname} = require("./controllers/StrategyManagement");

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
StrategyManagement.get("/getlongname", getlongname)
StrategyManagement.post("/jobqueue", jobqueue)



StrategyManagement.post("/insertEureka",AddStrategyController_Eureka)
StrategyManagement.get("/getEureka", GetAllStrategiesController_Eureka)
StrategyManagement.delete("/eureka", DeleteStrategyController_Eureka)
StrategyManagement.get("/getoneEureka", GetStrategyController_Eureka)

StrategyManagement.post("/insertdldataEureka",InsertDlDataEureka)












exports.StrategyManagement = StrategyManagement;