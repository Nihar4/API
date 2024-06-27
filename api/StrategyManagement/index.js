const { AddStrategyController_Eureka, GetAllStrategiesController_Eureka, DeleteStrategyController_Eureka, GetStrategyController_Eureka, InsertDlDataEureka, getDlDataForHedgeIndex, update_WeightsController, update_percentageController } = require("./controllers/EurekaStrategyManagement");
const { AddStrategyController, GetAllStrategiesController, DeleteStrategyController, GetStrategyController,getDlData,postDlData ,getStockInfo,getChartDataDetails,ValidateStock, jobqueue, getJobQueue, getlongname, update_WeightsController_asset, GetScatterChartDataController, update_PercentageController_asset, GetPerformaceDataController} = require("./controllers/StrategyManagement");

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
StrategyManagement.post("/updateWeights-asset",update_WeightsController_asset)
StrategyManagement.post("/updatePercentage-asset",update_PercentageController_asset)
StrategyManagement.post("/insertdldata-asset",GetScatterChartDataController)
StrategyManagement.post("/performance-asset",GetPerformaceDataController)


StrategyManagement.post("/insertEureka",AddStrategyController_Eureka)
StrategyManagement.get("/getEureka", GetAllStrategiesController_Eureka)
StrategyManagement.delete("/eureka", DeleteStrategyController_Eureka)
StrategyManagement.get("/getoneEureka", GetStrategyController_Eureka)
StrategyManagement.get("/getdldataHedge", getDlDataForHedgeIndex)
StrategyManagement.post("/updateWeights",update_WeightsController)
StrategyManagement.post("/updatepercentage",update_percentageController)

StrategyManagement.post("/insertdldataEureka",InsertDlDataEureka)












exports.StrategyManagement = StrategyManagement;