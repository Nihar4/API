const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const generateID = () => {
    return Math.floor(Date.now()).toString().substring(0, 12);
};

const checkAndAddMissingColumns = async (columnsToCheck, tableName) => {
    try {
        const columnQuery = `SHOW COLUMNS FROM ${tableName}`;
        console.log(columnQuery);
        const existingColumnsResult = await ExecuteQuery(columnQuery);

        const existingColumns = existingColumnsResult.map((col) => col.Field);

        const missingColumns = columnsToCheck.filter((col) => !existingColumns.includes(col));

        if (missingColumns.length > 0) {
            const alterTableQuery = missingColumns
                .map(
                    (col) => `ALTER TABLE ${tableName} ADD COLUMN ${col} VARCHAR(255) DEFAULT NULL`
                )
                .join("; ");

            await ExecuteQuery(alterTableQuery);
        }
    } catch (error) {
        console.log("Error checking and adding missing columns: ", error);
        throw error;
    }
};

const insertPerformanceData = async (performanceData, id) => {
    try {
        const columnsToCheck = [];
        const deleteQueries = "Delete from funds_performance where id = ?"
        await ExecuteQuery(deleteQueries, id);
        const insertQueries = performanceData.map((shareClass) => {
            const { name, entries } = shareClass;

            entries.forEach((entry) => {
                const entryColumns = Object.keys(entry);
                columnsToCheck.push(...entryColumns);
            });

            const entryColumns = entries.map((entry) => {
                const columns = Object.keys(entry).join(", ");

                return `${columns}`;
            }).join(", ");

            const entryRows = entries.map((entry) => {
                const values = Object.values(entry).map((val) => (typeof val === 'number' ? val : `'${val}'`)).join(", ");

                return `${values}`;
            }).join(", ");

            return `
                INSERT INTO funds_performance 
                (id, class_name, ${entryColumns}) 
                VALUES ('${id}' , '${name}' , ${entryRows});
            `;
        }).join(" ");

        await checkAndAddMissingColumns([...new Set(columnsToCheck)], 'funds_performance');

        await ExecuteQuery(insertQueries);

        console.log("Performance data inserted successfully.");
    } catch (error) {
        console.log("Error inserting performance data: ", error);
        throw error;
    }
};

const insertAllocationData = async (allocationData, id) => {
    try {
        const columnsToCheck = [];

        const deleteQueries = "Delete from funds_allocation where id = ?"
        await ExecuteQuery(deleteQueries, id);

        const insertQueries = allocationData.map((shareClass) => {
            const { name, entries } = shareClass;

            const entryColumns = Object.keys(entries).join(", ");
            const entryValues = Object.values(entries)
                .map((val) => (typeof val === "number" ? val : `'${val}'`))
                .join(", ");

            columnsToCheck.push(...Object.keys(entries));

            return `
        INSERT INTO funds_allocation
        (id, class_name, ${entryColumns}) 
        VALUES ('${id}', '${name}', ${entryValues});
      `;
        }).join(" ");

        await checkAndAddMissingColumns([...new Set(columnsToCheck)], "funds_allocation");

        await ExecuteQuery(insertQueries);

        console.log("Allocation data inserted successfully.");
    } catch (error) {
        console.log("Error inserting Allocation data: ", error);
        throw error;
    }
};


const EditFund = async (email, teamMembers, fundDetails, performanceData, allocationData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(performanceData);
            const { id, team_id } = fundDetails;
            let newTeamId = team_id;

            if (!team_id) {
                newTeamId = generateID();
            }

            let deleteQueries = [];

            if (team_id) {
                deleteQueries.push(`DELETE FROM team_details WHERE team_id = '${team_id}'`);
            }

            deleteQueries.push(`DELETE FROM funds_details WHERE id = '${id}'`);

            await ExecuteQuery(deleteQueries.join('; '));

            const insertFundDetailsQuery = `
        INSERT INTO funds_details
        (id, description, logo_url, firm_assets, strategy_assets, strategy_url, team_id, date_updated)
        VALUES
        ('${id}', '${fundDetails.fund_description}', '${fundDetails.logo_url}', 
         '${fundDetails.firm_assets}', '${fundDetails.strategy_assets}', 
         '${fundDetails.strategy_url}', '${newTeamId}', NOW())
      `;

            const insertTeamMembersQueries = teamMembers.map(member => {
                return `
          INSERT INTO team_details
          (team_id, name, designation, description, linkedin_url)
          VALUES
          ('${newTeamId}', '${member.team_member_name}', '${member.designation}', 
           '${member.team_member_description}', '${member.linkedin_url}')
        `;
            }).join('; ');

            await ExecuteQuery(`${insertFundDetailsQuery}; ${insertTeamMembersQueries}`);

            await insertPerformanceData(performanceData, id);
            await insertAllocationData(allocationData, id);

            resolve({
                success: true,
                message: 'Fund and team member details updated successfully'
            });
        } catch (error) {
            console.log(error)
            reject({
                success: false,
                message: 'Error updating fund details',
                error
            });
        }
    });
};

module.exports = { EditFund };
