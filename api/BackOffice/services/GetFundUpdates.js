const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetFundUpdates = async (fundId) =>{
    const query = `SELECT * FROM funds_updates WHERE fund_id = ?`;
    

    try {
        const result = await ExecuteQuery(query,[fundId]);
        return result
      } catch (error) {
        reject(error)
      }


}; 
module.exports = {GetFundUpdates};