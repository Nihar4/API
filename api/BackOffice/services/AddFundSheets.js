const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const AddFundSheets = async (fundId,title,file_url, currentDate) =>{
    const query1 = `INSERT INTO funds_factsheet (fund_id,title,url,date) VALUES (?, ?, ?, ?)`;
    const params1 = [fundId,title,file_url,currentDate];
    
    

    try {
        
        const result = await ExecuteQuery(query1, params1);
        
      } catch (error) {
        console.error("Error in AddFundSheets:", error);
        throw error; 
      }


};
module.exports = { AddFundSheets};