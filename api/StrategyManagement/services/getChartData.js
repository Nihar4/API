const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getChartData = async (stock, range, id) => {
  return new Promise(async (resolve, reject) => {
    if (stock == stock.split(".")[0]) {
      const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stock)}'`;
      const result = await ExecuteQuery(query);

      const columnName = result[0].column_name;
      const data_query = `SELECT Month_Year, \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;

      const data_result = await ExecuteQuery(data_query);
      // console.log(data_result);

      const candlesWithoutAdjClose = [];
      data_result.forEach((row) => {
        const [month, year] = row.Month_Year.split("-");
        const datestring = new Date(year, month - 1, 1);
        datestring.setHours(datestring.getHours() + 5);
        datestring.setMinutes(datestring.getMinutes() + 30);

        const date = datestring.toISOString();

        candlesWithoutAdjClose.push({
          date: date,
          close: parseFloat(row[columnName]),
        });
      });

      try {
        const query = `SELECT * FROM swiftfoliosuk.dl_jobs WHERE \`strategy_id\`=${id} AND \`security\`= '${stock}'`;
        // console.log(query);
        const result = await ExecuteQuery(query);

        result.sort(
          (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
        );

        const latestOutputData = result[0].output_data;
        
        const lastDate = new Date(
          candlesWithoutAdjClose[candlesWithoutAdjClose.length - 1].date
        );
        
        const startDate = new Date(
          lastDate.getFullYear(),
          lastDate.getMonth() + 1,
          1
        );
        startDate.setHours(startDate.getHours() + 5);
        startDate.setMinutes(startDate.getMinutes() + 30);
        
        //  console.log(startDate);
        const outputDataArray = latestOutputData.split(",");
        console.log(stock , outputDataArray.length);

        const dataChunks = [];

        for (let i = 0; i < outputDataArray.length; i += 12) {
          dataChunks.push(outputDataArray.slice(i, i + 12));
        }

        let dataWithDates = [];

        let len = dataChunks[0].length;
        // console.log(len);
        const currentDate = new Date(startDate);
        for (let i = 0; i < len; i++) {
          dataWithDates.push({
            date: currentDate.toISOString(),
            close1: parseFloat(dataChunks[0][i]),
            close2: parseFloat(dataChunks[1][i]),
            close3: parseFloat(dataChunks[2][i]),
            close4: parseFloat(dataChunks[3][i]),
            close5: parseFloat(dataChunks[4][i]),
            close6: parseFloat(dataChunks[5][i]),
          });
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // console.log(dataWithDates.length);

        const candlesWithAdditionalData = [
          ...candlesWithoutAdjClose,
          ...dataWithDates,
        ];

        // console.log(candlesWithAdditionalData);
        let filteredData;

        if (range == "3Y") {
          const threeYearAgo = new Date();
          threeYearAgo.setFullYear(threeYearAgo.getFullYear() - 3);
          // threeYearAgo.setDate(0);

          const filteredData = candlesWithAdditionalData.filter(
            (candle) => new Date(candle.date) >= threeYearAgo
          );
          resolve(filteredData);
        }
        else if(range == "5Y"){
          const fiveYearAgo = new Date();
          fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5);

          const filteredData = candlesWithAdditionalData.filter(
            (candle) => new Date(candle.date) >= fiveYearAgo
          );
          resolve(filteredData);
        }
        else{
          filteredData = candlesWithAdditionalData;
          resolve(filteredData);
        }
        resolve(candlesWithAdditionalData);
        
      } catch (error) {
        console.log(error);
      }
    } else {
      let calculatedStartDate = null;

      const currentDate = new Date();
      calculatedStartDate = new Date();

      switch (range.toUpperCase()) {
        case "1M":
          calculatedStartDate.setMonth(currentDate.getMonth() - 1);
          break;
        case "3M":
          calculatedStartDate.setMonth(currentDate.getMonth() - 3);
          break;
        case "6M":
          calculatedStartDate.setMonth(currentDate.getMonth() - 6);
          break;
        case "YTD":
          calculatedStartDate = new Date(currentDate.getFullYear() - 1, 11, 31);
          break;
        case "1Y":
          calculatedStartDate.setFullYear(currentDate.getFullYear() - 1);
          break;
        case "5Y":
          calculatedStartDate.setFullYear(currentDate.getFullYear() - 5);
          break;
        case "MAX":
          calculatedStartDate = new Date(1970, 0, 1);
          break;
        default:
          break;
      }
      // calculatedStartDate = new Date(1970, 0, 1);
      calculatedStartDate = calculatedStartDate.getTime() / 1000;

      const finalStartDate = calculatedStartDate;
      const finalEndDate = new Date().getTime() / 1000;
      let symbolToPass = stock;
      let interval = "1d";
      if (range === "5Y" || range === "MAX") {
        interval = "1wk";
      }

      // console.log(interval);

      const historicalData = await yahooFinance.historical(symbolToPass, {
        period1: finalStartDate,
        period2: finalEndDate,
        interval: interval,
      });

      // resolve(historicalData);

      const candlesWithoutAdjClose = historicalData.map((candle) => {
        const { adjClose, ...candleWithoutAdjClose } = candle;
        return candleWithoutAdjClose;
      });

      try {
        const query = `SELECT * FROM swiftfoliosuk.dl_jobs WHERE \`strategy_id\`=${id} AND \`security\`= '${stock}'`;
        const result = await ExecuteQuery(query);

        result.sort(
          (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
        );
        // resolve(result);

        const latestOutputData = result[0].output_data;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const outputDataArray = latestOutputData.split(",");
        // console.log(outputDataArray.length);

        const dataChunks = [];

        for (let i = 0; i < outputDataArray.length; i += 66) {
          dataChunks.push(outputDataArray.slice(i, i + 66));
        }

        let dataWithDates = [];

        let len = dataChunks[0].length;
        const currentDate = new Date(startDate);
        for (let i = 0; i < len; i++) {
          dataWithDates.push({
            date: currentDate.toISOString(),
            close1: parseFloat(dataChunks[0][i]),
            close2: parseFloat(dataChunks[1][i]),
            close3: parseFloat(dataChunks[2][i]),
            close4: parseFloat(dataChunks[3][i]),
            close5: parseFloat(dataChunks[4][i]),
            close6: parseFloat(dataChunks[5][i]),
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (range === "5Y" || range === "MAX") {
          dataWithDates = dataWithDates.filter(
            (data, index) => index % 7 === 0
          );
        }

        // console.log(dataWithDates.length);

        const candlesWithAdditionalData = [
          ...candlesWithoutAdjClose,
          ...dataWithDates,
        ];
        resolve(candlesWithAdditionalData);
      } catch (error) {
        console.log(error);
      }
    }

    // resolve(candlesWithoutAdjClose);
  });
};

module.exports = { getChartData };
