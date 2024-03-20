const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getStockDetails = async (stock) => {
  return new Promise(async (resolve, reject) => {
    const stockName = stock.replace(".L", "");
    // console.log(stockName);

    let currentDate = new Date();
    let calculatedStartDate = new Date(currentDate.getFullYear(),currentDate.getMonth() - 1,1);

    let lastMonthDate = new Date(currentDate.getFullYear(),currentDate.getMonth() ,1).toISOString().split('T')[0];
    // console.log(lastMonthDate);

    const queryOptions = { period1: calculatedStartDate /* ... */ };

    let stockDetails = await yahooFinance.historical(`${stock}`, queryOptions);
    const latestData = stockDetails[stockDetails.length-1].adjClose;
    const lastMonthData = stockDetails.find(stockData => stockData.date.toISOString().split('T')[0] === lastMonthDate).adjClose;
    // console.log(latestData);
    // console.log(lastMonthData);

    const query = `SELECT code, name FROM security_list WHERE code = '${stockName}'`;
    const result = await ExecuteQuery(query);
    const detailed_name = result[0].name;
    
    const percentage_change = (latestData/lastMonthData -1)*100;
    
    resolve({percentage_change,detailed_name});
  });
};

module.exports = { getStockDetails };
