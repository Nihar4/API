const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const updateWeights = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const [stock, weight] of Object.entries(data)) {
        const query = `UPDATE strategy_Eureka
                    SET 
                        min_weight = ${weight[0]},
                        max_weight = ${weight[1]}
                    WHERE 
                        id = '${id}' AND stock = '${stock.trim()}' `;

        // console.log(query);
        await ExecuteQuery(query);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { updateWeights };
