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
    if(!search || search.length==0){
      res.json({error:true,message:"Require search"})  
    }

      const query =`${search}`
      const results = await yahooFinance.search(query);
      const filteredResults = results.quotes.filter(item => item.isYahooFinance !== false);

    res.json(filteredResults);
  } catch (error) {
    console.log( error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getsearchlive;
