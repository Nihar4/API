const {ExecuteQuery}  = require("../../../utils/ExecuteQuery")
const moment = require('moment');

const CustomerPinset = (email_id,pin) => {
    return new Promise (async (resolve,reject) => {
        const status = 'pending';
        try {        
             const accountCode = moment().unix();
            const pinSetQuery = 'INSERT INTO swiftfoliosuk.swiftfolios_accounts (account_code, email_id, pin, status) VALUES (?, ?, ?, ?)';
            const pinParams = [accountCode, email_id, pin, status];

            await ExecuteQuery(pinSetQuery, pinParams);
            resolve({ accountCode, email_id, pin, status });
        } catch (error) {
            console.error("ExecuteQuery Error:", error);
            reject(error);
        }        

    })
}

module.exports = {CustomerPinset}