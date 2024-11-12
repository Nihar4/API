const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const AddFundUpdates = async (fundId,title, body ,file_url,video_url , currentDate) =>{
    const query1 = `INSERT INTO funds_updates (fund_id,title, description, date,video_url,doc_url) VALUES (?, ?, ?, ?,?,?)`;
    const params1 = [fundId,title,body,currentDate,video_url,file_url];
    
    

    try {
        console.log(params1);
        const result = await ExecuteQuery(query1, params1);
        console.log("Database insert result:", result);
      } catch (error) {
        console.error("Error in AddFundUpdates:", error);
        throw error; 
      }


};
module.exports = { AddFundUpdates};