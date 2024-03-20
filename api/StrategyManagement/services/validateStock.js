const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const validateStock = async (stock) => {
    return new Promise(async (resolve, reject) => {

        let calculatedStartDate = new Date(1970, 0, 1);
        calculatedStartDate = calculatedStartDate.getTime() / 1000;
        let symbolToPass = stock + ".L";
        const finalEndDate = new Date().getTime() / 1000;

        const historicalData = await yahooFinance.historical(symbolToPass, {
            period1: calculatedStartDate,
            period2: finalEndDate,
          });

          if(historicalData.length < 500){
            // console.log(historicalData.length);
            resolve(false);
          }
          else{
            // console.log(historicalData.length);
            resolve(true);
          }
      
    });
};

module.exports = { validateStock };
