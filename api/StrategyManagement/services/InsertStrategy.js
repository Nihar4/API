const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const InsertStrategy = async (email,id, strategyName, description, asset_class_name, stock, percentage) => {
    return new Promise(async (resolve, reject) => {


        const query = 'INSERT INTO strategy (email,id, name, description, asset_class_name, stock, percentage) VALUES (?,?, ?, ?, ?, ?, ?)';
        const params = [email,id, strategyName, description, asset_class_name, stock, percentage];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { InsertStrategy };
