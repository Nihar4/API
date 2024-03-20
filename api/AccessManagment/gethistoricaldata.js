const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");

const gethistoricaldata = async (req, res, next) => {
  try {
    const { symbol, duration, startdate, enddate } = req.query;
    const data = await axios.get(
      `https://www.swiftfolios.com/api/v1/GetStockConfig/${symbol}`
    );
    // console.log(data.data.stock);

    let code, exchange;
    let bse_symbol;
    code = data.data.stock["code"];
    if (data.data.stock["exchange"] == 1) {
      exchange = "NSE";
    } else if (data.data.stock["exchange"] == 6) {
      exchange = "BSE";
      const data = await axios.get(
        `https://www.swiftfolios.com/api/v1/StockDetails/${symbol}`
      );
      // const data = response.data;
      bse_symbol = data.data.stock.symbol;
      // console.log(bse_symbol);
    }

    if (
      duration == "3M" ||
      duration == "6M" ||
      duration == "1Y" ||
      duration == "5Y" ||
      (duration == "YTD") | (duration == "MAX")
    ) {
      let calculatedStartDate = null;

      if (!startdate) {
        const currentDate = new Date();
        calculatedStartDate = new Date();

        switch (duration.toUpperCase()) {
          case "3M":
            calculatedStartDate.setMonth(currentDate.getMonth() - 3);
            break;
          case "6M":
            calculatedStartDate.setMonth(currentDate.getMonth() - 6);
            break;
          case "YTD":
            calculatedStartDate = new Date(
              currentDate.getFullYear() - 1,
              11,
              31
            );
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
      }

      const finalStartDate = startdate ? startdate / 1000 : calculatedStartDate;
      const finalEndDate = enddate
        ? enddate / 1000
        : new Date().getTime() / 1000;

      let symbolToPass;

      if (exchange === "NSE") {
        symbolToPass = symbol + ".NS";
      } else if (exchange === "BSE") {
        symbolToPass = bse_symbol + ".BO";
      }

      const historicalData = await yahooFinance.historical(symbolToPass, {
        period1: finalStartDate,
        period2: finalEndDate,
      });

      const candlesWithoutAdjClose = historicalData.map((candle) => {
        const { adjClose, ...candleWithoutAdjClose } = candle;
        return candleWithoutAdjClose;
      });

      res.json(candlesWithoutAdjClose);
      // res.json(historicalData);
    } else {
      let calculatedStartDate = null;
      // console.log("hello");

      if (!startdate) {
        const currentDate = new Date();
        calculatedStartDate = new Date();

        switch (duration.toUpperCase()) {
          case "1H":
            calculatedStartDate = new Date(
              currentDate.getTime() - 86400000 * 10
            );
            break;
          case "1D":
            calculatedStartDate = new Date(
              currentDate.getTime() - 86400000 * 10
            );
            break;
          case "5D":
            calculatedStartDate = new Date(
              currentDate.getTime() - 86400000 * 10
            );
            break;
          case "1M":
            calculatedStartDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 1,
              currentDate.getDate()
            );
            break;
          default:
            break;
        }

        calculatedStartDate = Math.floor(calculatedStartDate.getTime() / 1000);
      }

      const finalStartDate = startdate
        ? Math.floor(startdate / 1000)
        : calculatedStartDate;
      const finalEndDate = enddate
        ? Math.floor(enddate / 1000) + 1
        : Math.floor(Date.now() / 1000) + 1;

      // console.log(finalStartDate, finalEndDate);

      const api_url = `https://masterswift.mastertrust.co.in/api/v1/charts/tdv?exchange=${exchange}&token=${code}&candletype=1&starttime=${finalStartDate}&endtime=${finalEndDate}&data_duration=1`;
      const historicalData = await axios.get(api_url);

      const candlesArray = historicalData.data.data["candles"];

      const candlesObjects = candlesArray.map((candle) => {
        return {
          date: candle[0],
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
        };
      });
      if (candlesObjects.length == 0) {
        res.json("No data");
        return;
      }

      if (duration == "1D") {
        const uniqueDatesSet = new Set();
        candlesObjects.forEach((candle) => {
          uniqueDatesSet.add(candle.date.slice(0, 10));
        });

        const uniqDatearray = Array.from(uniqueDatesSet);
        // console.log(uniqDatearray);

        const lastDate = uniqDatearray[uniqDatearray.length - 1];

        const candlesForLastDate = candlesObjects.filter((candle) => {
          return candle.date.slice(0, 10) === lastDate;
        });

        res.json(candlesForLastDate);
      } else if (duration == "5D") {
        const uniqueDatesSet = new Set();
        candlesObjects.forEach((candle) => {
          uniqueDatesSet.add(candle.date.slice(0, 10));
        });

        const uniqDatearray = Array.from(uniqueDatesSet);

        const lastFiveDates = uniqDatearray.slice(-5);
        // console.log(lastFiveDates);

        const candlesForLastFiveDates = candlesObjects.filter((candle) => {
          return lastFiveDates.includes(candle.date.slice(0, 10));
        });

        res.json(candlesForLastFiveDates);
      } else if (duration == "1H") {
        const uniqueDatesSet = new Set();
        candlesObjects.forEach((candle) => {
          uniqueDatesSet.add(candle.date.slice(0, 10));
        });

        const uniqDatearray = Array.from(uniqueDatesSet);
        // console.log(uniqDatearray);

        const lastDate = uniqDatearray[uniqDatearray.length - 1];
        const candlesForLastDate = candlesObjects.filter((candle) => {
          return candle.date.slice(0, 10) === lastDate;
        });
        const candlesForLast60 = candlesForLastDate.slice(-60);
        res.json(candlesForLast60);
      } else {
        res.json(candlesObjects);
      }
    }
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = gethistoricaldata;
