const GetFormattedStrategyData = (data) => {
    const formattedData = {};

    data.forEach((item) => {
        const { asset_class_name, stock } = item;

        if (!formattedData[asset_class_name]) {
            formattedData[asset_class_name] = [];
        }

        formattedData[asset_class_name].push(stock);
    });

    const result = Object.values(formattedData);
    return result;
};

module.exports = { GetFormattedStrategyData };
