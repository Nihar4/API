const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const validateStock = async (stock) => {
  return new Promise(async (resolve, reject) => {
    // if(stock == '1.0'){
    // console.log(stock);
    // resolve(true);
    // return;
    // }
    if(stock.split(".")[1]=="EH"){

      const query = `SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'master_benchmarks_price'
      AND COLUMN_NAME LIKE '%${stock.split(".")[0]}'`;
      
      const data = await ExecuteQuery(query);
      if(data.length>0){
        resolve(true);
        return;
      }
    }
    else{



    let calculatedStartDate = new Date(1970, 0, 1);
    calculatedStartDate = calculatedStartDate.getTime() / 1000;
    let symbolToPass = stock;
    const finalEndDate = new Date().getTime() / 1000;

    const historicalData = await yahooFinance.historical(symbolToPass, {
      period1: calculatedStartDate,
      period2: finalEndDate,
    });

    if (historicalData.length < 1200) {
      // console.log(historicalData.length);
      resolve(false);
    } else {
      // console.log(historicalData.length);
      resolve(true);
    }
  }
  });
};

module.exports = { validateStock };
