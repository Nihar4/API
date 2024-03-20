const { GetAllStrategies } = require("../services/GetAllStrategies");
const { InsertStrategy } = require("../services/InsertStrategy");
const { DeleteStrategy } = require("../services/DeleteStrategy");
const { GetStrategy } = require("../services/GetStrategy");
const {AddStocks} = require("../services/AddStocks");
const {getAllData} = require("../services/getAllData");
const {insertDlData} = require("../services/insertDlData");
const {getStockDetails} = require("../services/getStockDetails");
const {getChartData} = require("../services/getChartData");
const { validateStock } = require("../services/validateStock");


const AddStrategyController = async (req, res, next) => {
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
                await InsertStrategy(email,id, strategyName, description, asset_class_name, stock, percentage);
                await AddStocks(email,id,stock)
            }
        }

        return res.json({ error: false, message: "Strategy added successfully.",data:id });
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


const GetAllStrategiesController = async (req, res, next) => {
    try {
        const {email} = req.query
        const strategies = await GetAllStrategies(email);
        return res.json({ error: false, data: strategies });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const GetStrategyController = async (req, res, next) => {
    try {
        const { id } = req.query;
        const strategies = await GetStrategy(id);
        // console.log(strategies);
        const data = formatData(strategies);
        return res.json({ error: false, data: data[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};


const DeleteStrategyController = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: false, message: "ID is required for deletion." });
        }
        await DeleteStrategy(id);

        return res.json({ error: false, message: "Strategy deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const getDlData = async (req, res, next) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: false, message: "ID is required for data." });
        }
        const dl_data = await getAllData(id);

        return res.json({ error: false, message: "Data get successfully",data:dl_data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};


const postDlData = async (req, res, next) => {
    try {
        const { stock,id } = req.body;
        if ( !id) {
            return res.status(400).json({ error: false, message: "ID  is required for data." });
        }
        if ( !stock) {
            return res.status(400).json({ error: false, message: "stock  is required for data." });
        }
        await insertDlData(stock,id);
        return res.json({ error: false, message: "Process run completely"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const getStockInfo = async (req, res, next) => {
    try {
        const { stock } = req.query;
        if ( !stock) {
            return res.status(400).json({ error: false, message: "stock  is required for data." });
        }
        const result = await getStockDetails(stock);
        return res.json({ error: false, message: "Data get successfully",data : result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const getChartDataDetails = async (req, res, next) => {
    try {
        const { stock,range,id } = req.query;
        if ( !stock) {
            return res.status(400).json({ error: false, message: "stock  is required for data." });
        }
        if ( !range) {
            return res.status(400).json({ error: false, message: "Range is not valid." });
        }
        const result = await getChartData(stock,range,id);
        return res.json({ error: false, message: "Data get successfully",data : result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const ValidateStock = async (req, res, next) => {
    try {
        const { stock } = req.query;
        if ( !stock) {
            return res.status(400).json({ error: false, message: "stock  is required for data." });
        }
       
        const result = await validateStock(stock);
        return res.json({ error: false, message: "stock validates successfully",data : result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};


module.exports = { AddStrategyController, GetAllStrategiesController, DeleteStrategyController, GetStrategyController,getDlData,postDlData,getStockInfo,getChartDataDetails,ValidateStock};
