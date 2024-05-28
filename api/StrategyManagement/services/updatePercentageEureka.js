const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const updatePercentageEureka = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const obj of data) {
        const stock = Object.keys(obj)[0];
        const value = (parseFloat(obj[stock]) * 100).toFixed(2);

        const query = `UPDATE swiftfoliosuk.strategy_Eureka
        SET 
        percentage = ${(value)}
        WHERE 
        id = '${id}' AND stock = '${stock.trim()}'`;

        //     console.log(query);
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

module.exports = { updatePercentageEureka };
