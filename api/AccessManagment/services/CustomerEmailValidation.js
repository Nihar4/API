const { ExecuteQuery } = require("../../../utils/ExecuteQuery")

const CustomerEmailValidation = (email_id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM swiftfolios_accounts WHERE email_id = ?';
        const params = [email_id];
        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error)
        }
    });
}

module.exports = { CustomerEmailValidation }