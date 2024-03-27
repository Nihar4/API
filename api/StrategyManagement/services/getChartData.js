const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getChartData = async (stock, range, id) => {
  return new Promise(async (resolve, reject) => {
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
    // resolve(candlesWithoutAdjClose);

    // const todayDateISO = new Date().toISOString().split('T')[0];
    // const todayDataIndex = candlesWithoutAdjClose.findIndex(item => {
    //   const itemDate = new Date(item.date);
    //   const itemDateISO = itemDate.toISOString().split('T')[0];
    //   return itemDateISO === todayDateISO;
    // });

    // if (todayDataIndex === -1) {
    //   const lastDataIndex = candlesWithoutAdjClose.length - 1;
    //   const lastData = candlesWithoutAdjClose[lastDataIndex];
    //   const todayData = {
    //     ...lastData,
    //     date: new Date().toISOString()
    //   };
    //   candlesWithoutAdjClose.push(todayData);
    // }

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

      // let  dataWithDates = outputDataArray.map((closeValue, index) => {
      //   const currentDate = new Date(startDate);
      //   currentDate.setDate(currentDate.getDate() + index);

      //   return {
      //     "date": currentDate.toISOString(),
      //     "open": 0,
      //     "high": 0,
      //     "low": 0,
      //     "close": parseFloat(closeValue),
      //     "volume": 0,
      //     "key":1
      //   };
      // });

      let dataWithDates = [];
      // let keys = 1;

      // for (let chunk of dataChunks) {
      //   const currentDate = new Date(startDate);
      //   let tempArray = [];
      //   for (let closeValue of chunk) {
      //     tempArray.push({
      //       date: currentDate.toISOString(),
      //       open: 0,
      //       high: 0,
      //       low: 0,
      //       close: parseFloat(closeValue),
      //       volume: 0,
      //       key: keys,
      //     });
      //     currentDate.setDate(currentDate.getDate() + 1);
      //   }
      //   if (range === "5Y" || range === "MAX") {
      //     tempArray = tempArray.filter((data, index) => index % 7 === 0);
      //   }
      //   dataWithDates.push(...tempArray);
      //   keys++;
      // }

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
        dataWithDates = dataWithDates.filter((data, index) => index % 7 === 0);
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

    // resolve(candlesWithoutAdjClose);
  });
};

module.exports = { getChartData };
