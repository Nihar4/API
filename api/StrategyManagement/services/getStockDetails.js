const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getStockDetails = async (stock) => {
  return new Promise(async (resolve, reject) => {
    if (stock == stock.split(".")[0]) {
      // console.log(stock);
      const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stock)}'`;
      // console.log(query);
      const result = await ExecuteQuery(query);
  
      const columnName = result[0].column_name;
      // console.log(columnName);
      longname = columnName.substring(0, columnName.lastIndexOf("_")).replace(/_/g, " ");

      const data_query = `SELECT Month_Year, \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;

      const data_result = await ExecuteQuery(data_query);
      // console.log(data_result.length);
      const last = parseFloat(data_result[data_result.length-1][columnName])
      const secondLast = parseFloat(data_result[data_result.length-2][columnName])
      // console.log(last,secondLast)

      const percentage_change = '-';
      const detailed_name =longname.length >0 ? longname : stock ;
      const regularMarketPrice = last;
      const regularMarketChangePercent = last/ secondLast -1;
      resolve({
        percentage_change,
        detailed_name,
        regularMarketPrice,
        regularMarketChangePercent,
      });
      return;
    } else {
      // console.log(stock);

      let currentDate = new Date();
      let calculatedStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 2,
        1
      );

      let curr  = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );

      let lastMonthDate = new Date(
        curr.getFullYear(),
        curr.getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      // console.log(lastMonthDate);

      const queryOptions = { period1: calculatedStartDate /* ... */ };

      let stockDetails = await yahooFinance.historical(
        `${stock}`,
        queryOptions
      );

      // console.log(stockDetails);
      const latestData = stockDetails[stockDetails.length - 1].adjClose;
      // console.log(latestData, stockDetails[stockDetails.length-1].date);
      let lastMonthData;

      // console.log("1",lastMonthDate);

      if (
        new Date(lastMonthDate).toISOString() >=
        stockDetails[stockDetails.length - 1].date.toISOString()
      ) {
        const currentDate = new Date(
          stockDetails[stockDetails.length - 1].date
        );

        const l = new Date(currentDate);
        l.setDate(0);

        while (1) {
          const foundData = stockDetails.find(
            (stockData) =>
              stockData.date.toISOString().split("T")[0] ===
              l.toISOString().split("T")[0]
          );
          if (foundData) {
            // console.log(foundData);
            lastMonthData = foundData.adjClose;
            break;
          }
          l.setDate(l.getDate() - 1);
        }
      } else {
        // lastMonthData = stockDetails.find(
        //   (stockData) =>
        //     stockData.date.toISOString().split("T")[0] === lastMonthDate
        // ).adjClose;
        // console.log("2",lastMonthDate);

        const l = new Date(lastMonthDate);

        while (1) {
          const foundData = stockDetails.find(
            (stockData) =>
              stockData.date.toISOString().split("T")[0] === l.toISOString().split("T")[0]
          );
          if (foundData) {
            lastMonthData = foundData.adjClose;
            break;
          }
          l.setDate(l.getDate() - 1);
        }
      }
      // console .log("hii");
      const result = await yahooFinance.quote(`${stock}`);
      // console.log(result);
      const detailed_name = result.longName
        ? result.longName
        : result.shortName;
      const regularMarketPrice = result.regularMarketPrice;
      const regularMarketChangePercent = result.regularMarketChangePercent;

      const percentage_change = (latestData / lastMonthData - 1) * 100;

      resolve({
        percentage_change,
        detailed_name,
        regularMarketPrice,
        regularMarketChangePercent,
      });
    }
  });
};

module.exports = { getStockDetails };
