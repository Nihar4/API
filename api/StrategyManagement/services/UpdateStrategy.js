const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const UpdateStrategy = async (id, description, name) => {
    return new Promise(async (resolve, reject) => {
        const query = 'UPDATE buckets SET description = ? , name = ? WHERE id = ?';
        const params = [description, name, id];
        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { UpdateStrategy };
