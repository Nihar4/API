const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { fetchHistoricalData } = require("../../../utils/YahooFinanceApi");

const getChartData = async (stock, range, id, historicalOnly) => {
  return new Promise(async (resolve, reject) => {
    if ("EH" == stock.split(".")[1]) {
      // const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${stock.split(".")[0]}'`;
      // const result = await ExecuteQuery(query);

      // const columnName = result[0].column_name;
      // const data_query = `SELECT Month_Year, \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;

      // const data_result = await ExecuteQuery(data_query);
      // // console.log(data_result);

      // const candlesWithoutAdjClose = [];
      // data_result.forEach((row) => {
      //   const [month, year] = row.Month_Year.split("-");
      //   const datestring = new Date(year, month - 1, 1);
      //   datestring.setHours(datestring.getHours() + 5);
      //   datestring.setMinutes(datestring.getMinutes() + 30);

      //   const date = datestring.toISOString();

      //   candlesWithoutAdjClose.push({
      //     date: date,
      //     close: parseFloat(row[columnName]),
      //   });
      // });

      // try {
      //   const query = `SELECT * FROM dl_jobs WHERE \`strategy_id\`=${id} AND \`security\`= '${stock}'`;
      //   // console.log(query);
      //   const result = await ExecuteQuery(query);

      //   result.sort(
      //     (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
      //   );

      //   const latestOutputData = result[0].output_data;

      //   const lastDate = new Date(
      //     candlesWithoutAdjClose[candlesWithoutAdjClose.length - 1].date
      //   );

      //   const startDate = new Date(
      //     lastDate.getFullYear(),
      //     lastDate.getMonth() + 1,
      //     1
      //   );
      //   startDate.setHours(startDate.getHours() + 5);
      //   startDate.setMinutes(startDate.getMinutes() + 30);

      //   //  console.log(startDate);
      //   const outputDataArray = latestOutputData.split(",");

      //   const dataChunks = [];

      //   for (let i = 0; i < outputDataArray.length; i += 12) {
      //     dataChunks.push(outputDataArray.slice(i, i + 12));
      //   }

      //   let dataWithDates = [];

      //   let len = dataChunks[0].length;
      //   // console.log(len);
      //   const currentDate = new Date(startDate);
      //   for (let i = 0; i < len; i++) {
      //     dataWithDates.push({
      //       date: currentDate.toISOString(),
      //       close1: parseFloat(dataChunks[0][i]),
      //       close2: parseFloat(dataChunks[1][i]),
      //       close3: parseFloat(dataChunks[2][i]),
      //       close4: parseFloat(dataChunks[3][i]),
      //       close5: parseFloat(dataChunks[4][i]),
      //       close6: parseFloat(dataChunks[5][i]),
      //     });
      //     currentDate.setMonth(currentDate.getMonth() + 1);
      //   }

      //   // console.log(dataWithDates.length);

      //   const candlesWithAdditionalData = [
      //     ...candlesWithoutAdjClose,
      //     ...dataWithDates,
      //   ];

      //   // console.log(candlesWithAdditionalData);
      //   let filteredData;

      //   if (range == "3Y") {
      //     const threeYearAgo = new Date();
      //     threeYearAgo.setFullYear(threeYearAgo.getFullYear() - 3);
      //     // threeYearAgo.setDate(0);

      //     const filteredData = candlesWithAdditionalData.filter(
      //       (candle) => new Date(candle.date) >= threeYearAgo
      //     );
      //     resolve(filteredData);
      //   }
      //   else if (range == "5Y") {
      //     const fiveYearAgo = new Date();
      //     fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5);

      //     const filteredData = candlesWithAdditionalData.filter(
      //       (candle) => new Date(candle.date) >= fiveYearAgo
      //     );
      //     resolve(filteredData);
      //   }
      //   else {
      //     filteredData = candlesWithAdditionalData;
      //     resolve(filteredData);
      //   }
      //   resolve(candlesWithAdditionalData);

      // } catch (error) {
      //   console.log(error);
      // }
      reject()
    } else {
      try {
        // HISTORICAL DATA 

        const formatDate = (date) => date.toISOString().split('T')[0]; // Helper Function

        let calculatedStartDate = new Date();
        let currentDate = new Date();
        currentDate = new Date(currentDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);

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

        calculatedStartDate = calculatedStartDate.getTime() / 1000;
        const finalStartDate = calculatedStartDate;
        const finalEndDate = new Date().getTime() / 1000;
        let symbolToPass = stock;
        let interval = "1d";

        if (historicalOnly) {
          let interval = "1d";

          if (range === "5Y" || range === "MAX") {
            interval = "1wk";
          }

          const historicalData = await fetchHistoricalData(symbolToPass, {
            period1: finalStartDate,
            period2: finalEndDate,
            interval: interval,
          });

          historicalData.map((item) => item.date = new Date(item.date).toISOString().split('T')[0])
          return resolve(historicalData)
        }

        const historicalData = await fetchHistoricalData(symbolToPass, {
          period1: finalStartDate,
          period2: finalEndDate,
          interval: interval,
        });

        let candlesWithoutAdjClose = historicalData.map((candle) => {
          const { adjClose, ...candleWithoutAdjClose } = candle;
          return candleWithoutAdjClose;
        });

        candlesWithoutAdjClose = candlesWithoutAdjClose.reduce((acc, candle, index) => {
          const prevCandle = index > 0 ? acc[acc.length - 1] : null;
          // console.log(candle.date, candle.close);

          if (!candle.close && prevCandle) {
            candle = { ...prevCandle, date: new Date(prevCandle.date) };
            candle.date.setDate(candle.date.getDate() + 1);
            acc.push(candle);
          }

          if (prevCandle) {
            const prevDate = new Date(prevCandle.date);
            const currentDate = new Date(candle.date);

            const nextDate = new Date(prevDate);
            nextDate.setDate(prevDate.getDate() + 1);


            while (currentDate.setHours(0, 0, 0, 0) > nextDate.setHours(0, 0, 0, 0)) {
              // console.log("yes1", currentDate, nextDate);
              const newCandle = { ...prevCandle, date: nextDate.toISOString().split('T')[0] };
              acc.push(newCandle);
              nextDate.setDate(nextDate.getDate() + 1);
            }
          }

          acc.push(candle);
          return acc;
        }, []);

        const lastCandle = candlesWithoutAdjClose[candlesWithoutAdjClose.length - 1];
        let lastDate = new Date(lastCandle.date);

        while (lastDate.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)) {
          lastDate.setDate(lastDate.getDate() + 1);

          const newCandle = { ...lastCandle, date: formatDate(lastDate) };
          candlesWithoutAdjClose.push(newCandle);
        }

        // candlesWithoutAdjClose.map((x, i) => console.log(x.date, x.close));

        // DL DATA
        const query = `SELECT * FROM dl_jobs WHERE \`strategy_id\`=${id} AND \`security\`= '${stock}'`;
        const result = await ExecuteQuery(query);

        result.forEach((item) => {
          const originalDate = new Date(item.date_completed);
          const adjustedDate = new Date(originalDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);
          item.date_completed = adjustedDate.toISOString();
        });

        result.sort(
          (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
        );

        const latestOutputData = result[0].output_data;
        const runDate = new Date(result[0].date_completed).toISOString().split('T')[0];

        const beforeRunDateData = candlesWithoutAdjClose
          .filter((candle) => {
            const candleDate = new Date(candle.date);
            const runDateOnly = new Date(runDate);

            candleDate.setHours(0, 0, 0, 0);
            runDateOnly.setHours(0, 0, 0, 0);

            return candleDate <= runDateOnly;
          })
          .map((candle) => {
            return {
              ...candle,
              date: new Date(candle.date).toISOString().split('T')[0],
            };
          });

        const afterRunDateData = candlesWithoutAdjClose
          .filter((candle) => {
            const candleDate = new Date(candle.date);
            const runDateOnly = new Date(runDate);

            candleDate.setHours(0, 0, 0, 0);
            runDateOnly.setHours(0, 0, 0, 0);

            return candleDate > runDateOnly;
          })
          .map((candle) => {
            return {
              ...candle,
              date: new Date(candle.date).toISOString().split('T')[0],
            };
          });

        // console.log(afterRunDateData, runDate, beforeRunDateData[beforeRunDateData.length - 1]);

        const outputDataArray = latestOutputData.split(",");
        const dataChunks = [];

        for (let i = 0; i < outputDataArray.length; i += 66) {
          dataChunks.push(outputDataArray.slice(i, i + 66));
        }

        let len = dataChunks[0].length;
        // console.log(len, dataChunks.length, outputDataArray.length);

        const topDataNo = 11;
        const daysToAdd = 66;

        let PredLastDate = new Date(beforeRunDateData[beforeRunDateData.length - 1].date);
        // PredLastDate.setDate(new Date(beforeRunDateData[beforeRunDateData.length - 1]).getDate() + 1);

        for (let i = 0; i < daysToAdd; i++) {
          const currentDate = new Date(PredLastDate);
          currentDate.setDate(PredLastDate.getDate() + 1);
          PredLastDate = currentDate;

          const existingIndex = afterRunDateData.findIndex(
            (data) => new Date(data.date).setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)
          );

          if (existingIndex !== -1) {
            for (let j = 0; j < topDataNo; j++) {
              afterRunDateData[existingIndex][`close${j + 1}`] = parseFloat(dataChunks[j][i]);
            }
          } else {
            const newEntry = {
              date: currentDate.toISOString().split('T')[0]
            };

            for (let j = 0; j < topDataNo; j++) {
              newEntry[`close${j + 1}`] = parseFloat(dataChunks[j][i]);
            }

            afterRunDateData.push(newEntry);
          }
        }

        if (range === "5Y" || range === "MAX") {
          const intervalData = beforeRunDateData.filter((_, index) => index % 7 === 0);

          const lastIntervalData = intervalData[intervalData.length - 1];
          const lastBeforeRunData = beforeRunDateData[beforeRunDateData.length - 1];

          if (lastIntervalData.date !== lastBeforeRunData.date) {
            intervalData.push(lastBeforeRunData);
          }

          resolve([...intervalData, ...afterRunDateData]);
        } else {
          resolve([...beforeRunDateData, ...afterRunDateData]);
        }

      } catch (error) {
        reject(error);
        console.log(error);
      }
    }

    // resolve(candlesWithoutAdjClose);
  });
};

module.exports = { getChartData };
