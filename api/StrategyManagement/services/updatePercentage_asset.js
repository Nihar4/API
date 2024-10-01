const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const updatePercentage_asset = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const obj of data) {
        const stockObj = Object.keys(obj)[0];
        const stock = stockObj.split("+")[1];
        const AssetClass = stockObj.split("+")[0];
        const value = (parseFloat(obj[stockObj]) * 100).toFixed(2);
        // console.log(stock,AssetClass,value);

        const query = `UPDATE strategy
        SET 
        percentage = ${(value)}
        WHERE 
        id = '${id}' AND stock = '${stock.trim()}' AND asset_class_name='${AssetClass}'`;

        // console.log(query);
        await ExecuteQuery(query);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
    // console.log(data);
    // resolve();
  });
};

module.exports = { updatePercentage_asset };
