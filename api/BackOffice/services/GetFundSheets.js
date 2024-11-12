const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetFundSheets = async (fundId) =>{
    const query = `SELECT * FROM funds_factsheet WHERE fund_id = ?`;
    

    try {
        const result = await ExecuteQuery(query,[fundId]);
        return result
      } catch (error) {
        console.error("Error in GetFactSheets:", error);
        throw error; 
      }


};
module.exports = { GetFundSheets};