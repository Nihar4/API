const { ExecuteQuery } = require("../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getsearchlive = async (req, res, next) => {
  try {
    const { search } = req.query;
    // console.log(search)
    // const query = `
    //         SELECT *
    //         FROM security_list
    //         WHERE code LIKE ? OR name LIKE ?;
    //     `;

    // const results = await ExecuteQuery(query, [`%${search}%`, `%${search}%`]);
    if (!search || search.length == 0) {
      res.json({ error: true, message: "Require search" });
    }

    const query = `${search}`;
    const results = await yahooFinance.search(query);
    const filteredResults = results.quotes.filter(
      (item) => item.isYahooFinance !== false
    );

    const db_query = ` SHOW COLUMNS FROM master_benchmarks_price WHERE Field != 'Month_Year';`;
    const db_result = await ExecuteQuery(db_query);
    const transformedArray = db_result.map((item) => {
      const decodedField = decodeURIComponent(item.Field);
      const symbol = decodedField.split("_").pop();
      let longname = decodedField;
      if (decodedField.includes("_")) {
        longname = decodedField.substring(0, decodedField.lastIndexOf("_")).replace(/_/g, " ");
      }
      return { symbol, longname, exchange: "EurekaHedge" };
    });
    // console.log(transformedArray);
    const final_result = [...filteredResults, ...transformedArray];

    res.json(final_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getsearchlive;
