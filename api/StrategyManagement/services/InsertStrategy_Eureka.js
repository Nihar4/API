const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const InsertStrategy_Eureka = async (email,id, strategyName, description, asset_class_name, stock, percentage) => {
    return new Promise(async (resolve, reject) => {


        const query = 'INSERT INTO strategy_Eureka (email,id, name, description, asset_class_name, stock, percentage) VALUES (?,?, ?, ?, ?, ?, ?)';
        const params = [email,id, strategyName, description, asset_class_name, stock, percentage];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { InsertStrategy_Eureka };
