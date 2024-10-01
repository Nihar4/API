const multer = require("multer");
const { AddStrategyController_Eureka, GetAllStrategiesController_Eureka, DeleteStrategyController_Eureka, GetStrategyController_Eureka, InsertDlDataEureka, getDlDataForHedgeIndex, update_WeightsController, update_percentageController } = require("./controllers/EurekaStrategyManagement");
const { AddStrategyController, GetAllStrategiesController, DeleteStrategyController, GetStrategyController, getDlData, postDlData, getStockInfo, getChartDataDetails, ValidateStock, jobqueue, getJobQueue, getlongname, update_WeightsController_asset, GetScatterChartDataController, update_PercentageController_asset, GetPerformanceDataController, UpdatePortfolioController, GetPortfolioController, GetPortfolioChartController, getStrategyStockInfoController, DeletePortfolioStrategyController, GetPortfolioStrategyController, GetAllPortfolioStrategiesController, AddPortfolioStrategyController, GetPortfolioTradesController, GetPortfolioCashController, UpdatePortfolioCashController, DeletePortfolioTradesController, InsertPortfolioTradesController, UpdatePortfolioTradesController, ProcessPortfolioTradesController, BulkUpdatePortfolioTradesController, getStrategyStocksController, UpdateStrategyController, AddStrategyStockController, DeleteStrategyStockController } = require("./controllers/StrategyManagement");

const StrategyManagement = require("express").Router()

const fs = require("fs");
const path = require("path");
const UploadToAwsBucket = require("../../utils/UploadToAwsBucket");
const GenerateID = (length) => {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../Uploads/"));
    },
    filename: function (req, file, cb) {
        console.log("Original File Name", file.originalname);
        if (!file.fieldname) {
            cb(null);
        }
        const filename = GenerateID(13) + file.originalname.match(/\..*$/)[0];
        req.body[file.fieldname] = filename;
        cb(null, filename)
    },
});

const multiple_upload = multer({ storage }).any();


async function UploadFile(filename) {
    return new Promise(async (resolve, reject) => {
        const file_url = await UploadToAwsBucket(filename);
        console.log("Upload S3 URL ", file_url);
        resolve(file_url);
    })
}

const UploadTestController = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedFile = req.files[0];
        const fileName = uploadedFile.filename;
        console.log("Uploaded file name:", fileName);

        const file_url = await UploadFile(fileName);
        res.status(200).json({ file_url });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "File upload failed", error });
    }
};

StrategyManagement.post("/upload-test", multiple_upload, UploadTestController)


StrategyManagement.post("/insert", AddStrategyController)
StrategyManagement.get("/getdldta", getDlData)
StrategyManagement.get("/get", GetAllStrategiesController)
StrategyManagement.get("/getone", GetStrategyController)
StrategyManagement.delete("/", DeleteStrategyController)
StrategyManagement.put("/update", UpdateStrategyController)
StrategyManagement.get("/stocks", getStrategyStocksController)
StrategyManagement.post("/stock/insert", AddStrategyStockController)
StrategyManagement.delete("/stock", DeleteStrategyStockController)



StrategyManagement.post("/insertdldata", postDlData)
StrategyManagement.get("/getstockinfo", getStockInfo)
StrategyManagement.get("/chartdata", getChartDataDetails)
StrategyManagement.get("/validatestock", ValidateStock)

StrategyManagement.get("/getjobqueue", getJobQueue)
StrategyManagement.get("/getlongname", getlongname)
StrategyManagement.post("/jobqueue", jobqueue)

StrategyManagement.post("/updateWeights-asset", update_WeightsController_asset)
StrategyManagement.post("/updatePercentage-asset", update_PercentageController_asset)
StrategyManagement.post("/insertdldata-asset", GetScatterChartDataController)

StrategyManagement.post("/insertEureka", AddStrategyController_Eureka)
StrategyManagement.get("/getEureka", GetAllStrategiesController_Eureka)
StrategyManagement.delete("/eureka", DeleteStrategyController_Eureka)
StrategyManagement.get("/getoneEureka", GetStrategyController_Eureka)
StrategyManagement.get("/getdldataHedge", getDlDataForHedgeIndex)
StrategyManagement.post("/updateWeights", update_WeightsController)
StrategyManagement.post("/updatepercentage", update_percentageController)

StrategyManagement.post("/insertdldataEureka", InsertDlDataEureka)


StrategyManagement.get("/stockAllData", getStrategyStockInfoController)
StrategyManagement.get("/portfolio/get", GetAllPortfolioStrategiesController)
StrategyManagement.get("/portfolio/getone", GetPortfolioStrategyController)
StrategyManagement.post("/portfolio/insert", AddPortfolioStrategyController)
StrategyManagement.delete("/portfolio", DeletePortfolioStrategyController)

StrategyManagement.get("/portfolio/trades", GetPortfolioTradesController)
StrategyManagement.delete("/portfolio/trades", DeletePortfolioTradesController)
StrategyManagement.post("/portfolio/trades", InsertPortfolioTradesController)
StrategyManagement.post("/portfolio/process/trades", ProcessPortfolioTradesController)

StrategyManagement.put("/portfolio/trades", UpdatePortfolioTradesController)
StrategyManagement.put("/portfolio/trades/bulk", BulkUpdatePortfolioTradesController)

StrategyManagement.get("/portfolio/cash", GetPortfolioCashController)
StrategyManagement.post("/portfolio/cash", UpdatePortfolioCashController)








exports.StrategyManagement = StrategyManagement;