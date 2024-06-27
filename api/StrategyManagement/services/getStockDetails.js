const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getStockDetails = async (stock) => {
  return new Promise(async (resolve, reject) => {
    try {
      if ("EH" === stock.split(".")[1]) {
        const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${stock.split(".")[0]}'`;
        const result = await ExecuteQuery(query);
        
        if (result.length === 0) {
          reject(new Error("No columns found for the stock"));
          return;
        }
        
        const columnName = result[0].column_name;
        const longname = columnName.substring(0, columnName.lastIndexOf("_")).replace(/_/g, " ");

        const data_query = `SELECT Month_Year, \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;
        const data_result = await ExecuteQuery(data_query);

        if (data_result.length < 2) {
          reject(new Error("Insufficient data for the stock"));
          return;
        }

        const last = parseFloat(data_result[data_result.length - 1][columnName]);
        const secondLast = parseFloat(data_result[data_result.length - 2][columnName]);

        const percentage_change = '-';
        const detailed_name = longname;
        const regularMarketPrice = last;
        const regularMarketChangePercent = last / secondLast - 1;

        resolve({
          percentage_change,
          detailed_name,
          regularMarketPrice,
          regularMarketChangePercent,
        });
      } else {
        let currentDate = new Date();
        let calculatedStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1
        );

        let curr = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );

        let lastMonthDate = new Date(
          curr.getFullYear(),
          curr.getMonth(),
          1
        ).toISOString().split("T")[0];

        const queryOptions = { period1: calculatedStartDate.toISOString() };

        let stockDetails;
        try {
          stockDetails = await yahooFinance.historical(stock, queryOptions);
        } catch (error) {
          reject(new Error(`Failed to fetch historical data for ${stock}: ${error.message}`));
          return;
        }

        if (stockDetails.length === 0) {
          reject(new Error("No historical data found for the stock"));
          return;
        }

        const latestData = stockDetails[stockDetails.length - 1].adjClose;
        let lastMonthData;

        const l = new Date(lastMonthDate);

        while (1) {
          const foundData = stockDetails.find(
            (stockData) => stockData.date.toISOString().split("T")[0] === l.toISOString().split("T")[0]
          );
          if (foundData) {
            lastMonthData = foundData.adjClose;
            break;
          }
          l.setDate(l.getDate() - 1);
        }

        if (lastMonthData === undefined) {
          reject(new Error("No data found for the last month"));
          return;
        }

        let result;
        try {
          result = await yahooFinance.quote(stock);
        } catch (error) {
          reject(new Error(`Failed to fetch quote data for ${stock}: ${error.message}`));
          return;
        }

        const detailed_name = result.longName ? result.longName : result.shortName;
        const regularMarketPrice = result.regularMarketPrice;
        const regularMarketChangePercent = result.regularMarketChangePercent;
        const percentage_change = ((latestData / lastMonthData) - 1) * 100;

        resolve({
          percentage_change,
          detailed_name,
          regularMarketPrice,
          regularMarketChangePercent,
        });
      }
    } catch (error) {
      reject(new Error(`Failed to get stock details for ${stock}: ${error.message}`));
    }
  });
};

module.exports = { getStockDetails };
