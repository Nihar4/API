const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { isEmpty } = require("../../../utils/Validation");
const { fetchHistoricalData, fetchQuoteData } = require("../../../utils/YahooFinanceApi");

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
        let result;
        try {
          result = await fetchQuoteData(stock);
        } catch (error) {
          console.log(error);
        }

        const detailed_name = result && result.longName ? result.longName : (result && result.shortName ? result.shortName : '--');
        const regularMarketPrice = result ? result.regularMarketPrice : null;
        const regularMarketChangePercent = result ? result.regularMarketChangePercent : null;

        let percentage_change;

        let currentDate = new Date();
        let calculatedStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1
        );

        let lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString().split("T")[0];
        const queryOptions = { period1: calculatedStartDate.toISOString() };

        let stockDetails;
        try {
          stockDetails = await fetchHistoricalData(stock, queryOptions);
        } catch (error) {
          console.log(error);
        }

        if (!stockDetails || stockDetails.length === 0) {
          console.log("No historical data found for the stock");
          percentage_change = null;
        }
        else {
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

          if (!isEmpty(lastMonthData)) {
            percentage_change = ((latestData / lastMonthData) - 1) * 100;
          }
          else {
            console.log("No data found for the last month");
            percentage_change = null;
          }
        }

        resolve({
          percentage_change,
          detailed_name,
          regularMarketPrice,
          regularMarketChangePercent,
        });
      }
    } catch (error) {
      console.log(`Failed to get stock details for ${stock}: ${error.message}`);
      resolve({
        percentage_change: null,
        detailed_name: "--",
        regularMarketPrice: null,
        regularMarketChangePercent: null,
      });
    }
  });
};

module.exports = { getStockDetails };
