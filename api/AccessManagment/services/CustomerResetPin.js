const { ExecuteQuery } = require("../../../utils/ExecuteQuery")

const CustomerResetPin = (email_id, pin) => {
    return new Promise(async (resolve, reject) => {
        const updatePinQuery = 'UPDATE swiftfolios_accounts SET pin = ? WHERE email_id = ?';
        const updatePinParams = [pin, email_id];
        try {
            await ExecuteQuery(updatePinQuery, updatePinParams);
            resolve('PIN reset successfully.');
        } catch (error) {
            reject(error);
        }
    });
}
module.exports = { CustomerResetPin }
