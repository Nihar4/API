const { AddStocks } = require("../services/AddStocks");
const { DeleteStrategy_Eureka } = require("../services/DeleteStrategy_Eureka");
const { GetAllStrategies_Eureka } = require("../services/GetAllStrategies_Eureka");
const { GetDlDataHedge } = require("../services/GetDlDataHedge");
const { GetStrategy_Eureka } = require("../services/GetStrategy_Eureka");
const { InsertStrategy_Eureka } = require("../services/InsertStrategy_Eureka");
const { InsertdldataEureka } = require("../services/InsertdldataEureka");
const { updateWeights } = require("../services/UpdateWeights");
const { updatePercentageEureka } = require("../services/updatePercentageEureka");


const AddStrategyController_Eureka = async (req, res, next) => {
    try {
        const { strategyName, description, assetClasses } = req.body;
        const email = req.body.email_id;
        const {strategy_id} = req.query;
        const id = strategy_id ?  strategy_id : Math.floor(Date.now() / 10);

        if (!strategyName || !description) {
            return res.status(400).json({ error: false, message: "Strategy name and description are required." });
        }

        for (const assetClass of assetClasses) {
            const { name: asset_class_name, underlyings } = assetClass;

            for (const underlying of underlyings) {
                const { stock, percentage } = underlying;
                await InsertStrategy_Eureka(email,id, strategyName, description, asset_class_name, stock, percentage);
                await AddStocks(email,id,stock)
            }
        }

        return res.json({ error: false, message: "Strategy added successfully.",data:id });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const GetAllStrategiesController_Eureka = async (req, res, next) => {
    try {
        const {email} = req.query
        const strategies = await GetAllStrategies_Eureka(email);
        return res.json({ error: false, data: strategies });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const DeleteStrategyController_Eureka = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: false, message: "ID is required for deletion." });
        }
        await DeleteStrategy_Eureka(id);

        return res.json({ error: false, message: "Strategy deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const formatData = (data) => {
    // console.log(data)
    if (data.length === 0) {
        return [{ strategyName: "", description: "", assetClasses: [] }];
    }

    const formattedData = data.reduce((acc, current) => {
        const { name, description, asset_class_name, stock, percentage } = current;

        if (!acc[name]) {
            acc[name] = { strategyName: name, description, assetClasses: [] };
        }

        const existingAssetClass = acc[name].assetClasses.find(ac => ac.name === asset_class_name);
        if (!existingAssetClass) {
            acc[name].assetClasses.push({ name: asset_class_name, underlyings: [{ stock, percentage }] });
        } else {
            existingAssetClass.underlyings.push({ stock, percentage });
        }

        return acc;
    }, {});

    return Object.values(formattedData);
};
const GetStrategyController_Eureka = async (req, res, next) => {
    try {
        const { id } = req.query;
        const strategies = await GetStrategy_Eureka(id);
        // console.log(strategies);
        const data = formatData(strategies);
        return res.json({ error: false, data: data[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};


const InsertDlDataEureka = async (req, res, next) => {
    try {
        const { id } = req.query;
        const data = req.body;
        // console.log(data);
        const result =  await InsertdldataEureka(id,data);

        return res.json({ error: false, message:"Dl model run successfully" ,data:result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const getDlDataForHedgeIndex = async(req,res,next) => {
    try {
        const { id } = req.query;
        const data =  await GetDlDataHedge(id);
        return res.json({ error: false, message:"Dl model run successfully" ,data:data});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
}


const update_WeightsController = async(req,res,next)=>{
    try {
        const { id } = req.query;
        const data = req.body;
        await updateWeights(id,data);
        return res.json({ error: false, message:"Weights Updated Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
}


const update_percentageController = async(req,res,next)=>{
    try {
        const { id } = req.query;
        const data = req.body;
        await updatePercentageEureka(id,data);
        return res.json({ error: false, message:"Percentage Updated Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
}




module.exports = { AddStrategyController_Eureka,GetAllStrategiesController_Eureka,DeleteStrategyController_Eureka,GetStrategyController_Eureka,InsertDlDataEureka,getDlDataForHedgeIndex,update_WeightsController,update_percentageController};
