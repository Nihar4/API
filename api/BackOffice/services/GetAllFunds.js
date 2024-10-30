const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetAllFunds = async () => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT 
                funds.id AS fund_id,
                funds.email,
                funds.name AS fund_name,
                funds.date_time,
                funds_details.description AS fund_description,
                funds_details.logo_url,
                funds_details.firm_assets,
                funds_details.strategy_assets,
                funds_details.strategy_url,
                funds_details.team_id,
                funds_details.date_updated AS fund_details_updated,
                team_details.name AS team_member_name,
                team_details.designation,
                team_details.description AS team_member_description,
                team_details.linkedin_url
            FROM 
                funds funds
            LEFT JOIN 
                funds_details funds_details 
            ON 
                funds.id = funds_details.id
            LEFT JOIN 
                team_details team_details 
            ON 
                funds_details.team_id = team_details.team_id
        `;

        try {
            const result = await ExecuteQuery(query);
            const fundsMap = {};

            result.forEach((row) => {
                const fundId = row.fund_id;

                if (!fundsMap[fundId]) {
                    fundsMap[fundId] = {
                        id: row.fund_id,
                        email: row.email,
                        fund_name: row.fund_name,
                        date_time: row.date_time,
                        fund_description: row.fund_description,
                        logo_url: row.logo_url,
                        firm_assets: row.firm_assets,
                        strategy_assets: row.strategy_assets,
                        strategy_url: row.strategy_url,
                        fund_details_updated: row.fund_details_updated,
                        team_id: row.team_id,
                        team_members: [],
                        performance_data: null,
                        allocation_data: null
                    };
                }

                if (row.team_member_name) {
                    fundsMap[fundId].team_members.push({
                        team_member_name: row.team_member_name,
                        designation: row.designation,
                        team_member_description: row.team_member_description,
                        linkedin_url: row.linkedin_url
                    });
                }
            });

            Object.values(fundsMap).forEach(fund => {
                fund.team_members.reverse();
            });

            const fundsArray = Object.values(fundsMap);


            for (const fund of fundsArray) {
                const fundId = fund.id;

                const performanceQuery = `
                    SELECT * FROM funds_performance WHERE id = ?
                `;
                const performanceResult = await ExecuteQuery(performanceQuery, [fundId]);

                const transformedPerformanceData = performanceResult.map(classData => {
                    const entries = [];

                    const uniqueYears = new Set();
                    Object.keys(classData).forEach(key => {
                        if (key !== 'id' && key !== 'class_name') {
                            const year = key.slice(-4);
                            if (!isNaN(year)) {
                                uniqueYears.add(year);
                            }
                        }
                    });

                    Array.from(uniqueYears).sort((a, b) => b - a).forEach(year => {
                        const yearEntries = {};
                        Object.keys(classData).forEach(key => {
                            if (key.endsWith(year) && classData[key] !== null) {
                                yearEntries[key] = classData[key];
                            }
                        });
                        if (Object.keys(yearEntries).length > 0) {
                            entries.push(yearEntries);
                        }
                    });

                    return {
                        name: classData.class_name,
                        entries: entries
                    };
                });

                fund.performance_data = transformedPerformanceData;


                const allocationQuery = `
                    SELECT * FROM funds_allocation WHERE id = ?
                `;
                const allocationResult = await ExecuteQuery(allocationQuery, [fundId]);

                const transformedData = allocationResult.map(row => {
                    const { id, class_name, ...entries } = row;
                    return {
                        name: class_name,
                        entries: entries
                    };
                });

                fund.allocation_data = transformedData;
            }

            resolve(fundsArray);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetAllFunds };
