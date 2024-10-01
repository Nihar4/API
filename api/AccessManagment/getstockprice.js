const { ExecuteQuery } = require("../../utils/ExecuteQuery");
const { fetchHistoricalData } = require("../../utils/YahooFinanceApi");

const checkAndAddCodeColumn = async (stock) => {
  const checkColumnQuery = `SHOW COLUMNS FROM security_price LIKE '${stock}'`;
  const addColumnQuery = `ALTER TABLE security_price ADD COLUMN \`${stock}\` VARCHAR(255)`;

  try {
    const result = await ExecuteQuery(checkColumnQuery);

    if (result.length === 0) {
      await ExecuteQuery(addColumnQuery);
      console.log(`Column ${stock} added to table`);
    } else {
      console.log(`Column ${stock} already exists`);
    }

    const q = `INSERT INTO security_price (Date)
    SELECT date_range
    FROM (
        SELECT DATE_ADD((SELECT DATE_ADD((SELECT MAX(Date) FROM security_price), INTERVAL 1 DAY)), INTERVAL (t4*1000 + t3*100 + t2*10 + t1) DAY) AS date_range
        FROM 
            (SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
             SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
            (SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
             SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
            (SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
             SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
            (SELECT 0 t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
             SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4
        WHERE DATE_ADD((SELECT DATE_ADD((SELECT MAX(Date) FROM security_price), INTERVAL 1 DAY)), INTERVAL (t4*1000 + t3*100 + t2*10 + t1) DAY) <= NOW()
    ) AS DateRange`;

    await ExecuteQuery(q);

    const checkDate = `SELECT Date FROM security_price WHERE \`${stock}\` IS NULL `;
    let dateResult = await ExecuteQuery(checkDate);
    // console.log(dateResult[0]);

    const queryOptions = { period1: "2019-01-01" /* ... */ };
    let stockDetails = await fetchHistoricalData(
      `${stock}.L`,
      queryOptions
    );

    let lastValue = stockDetails[0].adjClose;

    if (dateResult.length > 0) {
      let firstdate = new Date(dateResult[0].Date);

      if (firstdate.toISOString().split("T")[0] !== "2019-01-01") {
        let latestDate = firstdate.toISOString().split("T")[0];

        const getAdjCloseQuery = `SELECT ${stock} FROM security_price WHERE Date = '${latestDate}'`;
        let latestResult = await ExecuteQuery(getAdjCloseQuery);

        // console.log(y);
        lastValue = latestResult[0][stock];
        dateResult.unshift({ Date: firstdate.toISOString().split("T")[0] });
      }
    }

    // console.log(lastValue);
    let listedDate = new Date(stockDetails[0].date);
    listedDate.setDate(listedDate.getDate() - 1);
    listedDate = listedDate.toISOString().split("T")[0];
    // console.log(listedDate);

    for (date of dateResult) {
      let currDate = new Date(date.Date).toISOString().split("T")[0];
      // console.log(currDate,listedDate);
      if (currDate >= listedDate) {
        let targetdate = new Date(date.Date).toLocaleDateString("en-GB");

        const matchingEntry = stockDetails.find((entry) => {
          const stockDate = new Date(entry.date).toLocaleDateString("en-GB");
          return stockDate == targetdate;
        });

        let adjClose;

        if (matchingEntry) {
          adjClose = matchingEntry.adjClose;
          lastValue = adjClose;
        } else {
          adjClose = lastValue;
        }

        adjClose = parseFloat(adjClose).toFixed(2);

        targetdate = new Date(date.Date);

        targetdate.setMinutes(
          targetdate.getMinutes() - targetdate.getTimezoneOffset()
        );

        targetdate = targetdate.toISOString().split("T")[0];

        const updateQuery = `UPDATE security_price SET \`${stock}\` = '${adjClose}' WHERE Date = '${targetdate}'`;

        await ExecuteQuery(updateQuery);
      }
      // break;
    }
  } catch (error) {
    console.error("Error checking/adding 'code' column:", error.message);
  }
};

const getstockprice = async (req, res, next) => {
  const { code } = req.body;

  try {
    await checkAndAddCodeColumn(code);
    res.json({ error: false, message: "Stock price updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error });
  }
};

module.exports = getstockprice;
