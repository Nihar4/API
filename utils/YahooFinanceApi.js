const { default: yahooFinance } = require("yahoo-finance2");

const cache = new Map();
const cacheDuration = 5 * 1000;

function cacheData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now(),
    });
    if (cache.size > 100) cache.clear();
}

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
    }
    return null;
}

function fetchChartData(symbol, queryOptions) {
    return new Promise(async (resolve, reject) => {
        try {
            const historicalData = await yahooFinance.chart(symbol, queryOptions);
            if (!historicalData || !historicalData.quotes) {
                return resolve(null);
            }

            const Data = historicalData.quotes.map(({ adjclose, ...rest }) => ({
                ...rest,
                adjClose: adjclose,
            }));

            resolve(Data);
        } catch (error) {
            console.log("Error fetching chart data:", error);
            reject(error);
        }
    });
}

function fetchHistoricalData(symbol, queryOptions) {
    return new Promise(async (resolve, reject) => {
        const cacheKey = `historical_${symbol}_${queryOptions.period1}_${queryOptions.period2}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return resolve(cachedData);

        try {
            const historicalData = await yahooFinance.historical(symbol, queryOptions);
            if (!historicalData) {
                const Data = await fetchChartData(symbol, queryOptions);
                cacheData(cacheKey, Data);
                return resolve(Data);
            }
            cacheData(cacheKey, historicalData);
            resolve(historicalData);
        } catch (error) {
            const Data = await fetchChartData(symbol, queryOptions);
            cacheData(cacheKey, Data);
            resolve(Data);
        }
    });
}

function fetchQuoteData(symbol) {
    return new Promise(async (resolve, reject) => {
        const cacheKey = `quote_${symbol}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return resolve(cachedData);

        try {
            const Data = await yahooFinance.quote(symbol);
            cacheData(cacheKey, Data);
            resolve(Data);
        } catch (error) {
            console.log("Error fetching quote data:", error);
            reject(error);
        }
    });
}

function fetchSearch(query) {
    return new Promise(async (resolve, reject) => {
        const cacheKey = `search_${query}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return resolve(cachedData);

        try {
            const results = await yahooFinance.search(query);
            cacheData(cacheKey, results);
            resolve(results);
        } catch (error) {
            console.log("Error fetching search data:", error);
            reject(error);
        }
    });
}

module.exports = {
    fetchHistoricalData,
    fetchQuoteData,
    fetchSearch,
};
