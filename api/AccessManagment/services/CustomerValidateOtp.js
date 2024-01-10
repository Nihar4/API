const { ExecuteQuery } = require("../../../utils/ExecuteQuery")

const CustomerValidateOtp = (email_id) => {
    return new Promise(async (resolve, reject) => {
        const checkEmailQuery = 'SELECT * FROM swiftfolios_emailotp WHERE email_id = ?';
        const checkEmailParams = [email_id];

        try {
            const data = await ExecuteQuery(checkEmailQuery, checkEmailParams);
            resolve(data)

        } catch (error) {
            reject(error);
        }
    });
}
module.exports = { CustomerValidateOtp }
