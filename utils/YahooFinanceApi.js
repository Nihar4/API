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
            let historicalData = await yahooFinance.chart(symbol, queryOptions);

            if (!historicalData || !historicalData.quotes || historicalData.quotes.length === 0) {
                const alternativeSymbol = symbol.endsWith('.NS')
                    ? symbol.replace('.NS', '.BO')
                    : symbol.endsWith('.BO') ? symbol.replace('.BO', '.NS') : symbol;

                console.log(`Retrying with alternative symbol: ${alternativeSymbol}`);
                historicalData = await yahooFinance.chart(alternativeSymbol, queryOptions);
            }

            if (!historicalData || !historicalData.quotes || historicalData.quotes.length === 0) {
                return resolve(null);
            }
            let Data = historicalData.quotes.map(({ adjclose, ...rest }) => ({
                ...rest,
                adjClose: adjclose,
            }));

            let previousValidRow = null;
            Data = Data.map(row => {
                if (row.adjClose === null || Object.values(row).some(val => val === null)) {
                    if (previousValidRow !== null) {
                        return {
                            ...previousValidRow,
                            date: row.date
                        };
                    }
                } else {
                    previousValidRow = row;
                }
                return row;
            });
            resolve(Data);
        } catch (error) {
            console.log("Error fetching chart data:", error);

            const alternativeSymbol = symbol.endsWith('.NS')
                ? symbol.replace('.NS', '.BO')
                : symbol.endsWith('.BO') ? symbol.replace('.BO', '.NS') : symbol;

            try {
                console.log(`Retrying with alternative symbol: ${alternativeSymbol}`);
                const historicalData = await yahooFinance.chart(alternativeSymbol, queryOptions);

                if (!historicalData || !historicalData.quotes || historicalData.quotes.length === 0) {
                    return resolve(null)
                }

                let Data = historicalData.quotes.map(({ adjclose, ...rest }) => ({
                    ...rest,
                    adjClose: adjclose,
                }));

                let previousValidRow = null;
                Data = Data.map(row => {
                    if (row.adjClose === null || Object.values(row).some(val => val === null)) {
                        if (previousValidRow !== null) {
                            return {
                                ...previousValidRow,
                                date: row.date
                            };
                        }
                    } else {
                        previousValidRow = row;
                    }
                    return row;
                });
                resolve(Data);
            } catch (retryError) {
                console.log("Error fetching chart data with alternative symbol:", retryError);
                return resolve(null)
            }
        }
    });
}

function fetchHistoricalData(symbol, queryOptions) {
    return new Promise(async (resolve, reject) => {
        const cacheKey = `historical_${symbol}_${queryOptions.period1}_${queryOptions.period2}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return resolve(cachedData);

        try {
            const Data = await fetchChartData(symbol, queryOptions);
            if (Data) {
                cacheData(cacheKey, Data);
                resolve(Data);
            }
            else {
                reject({ error: true, msg: "API Down" });
            }
        } catch (error) {
            reject({ error: true, msg: "API Down" });
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
            reject({ error: true, msg: error });
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
