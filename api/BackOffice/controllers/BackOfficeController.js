const UploadToAwsBucket = require("../../../utils/UploadToAwsBucket");
const { AddFund } = require("../services/AddFund");
const { EditFund } = require("../services/EditFund");
const { GetAllFunds } = require("../services/GetAllFunds");


const GetAllFundsController = async (req, res, next) => {
    try {
        const { email } = req.query
        const strategies = await GetAllFunds(email);
        return res.json({ error: false, data: strategies });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const AddFundController = async (req, res, next) => {
    try {
        const { email } = req.query;
        const { name } = req.body;
        const { id } = await AddFund(email, name);
        return res.json({ error: false, data: id });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

const EditFundController = async (req, res, next) => {
    try {
        const { email } = req.query;
        const teamMembers = JSON.parse(req.body.teamMembers);
        const fundDetails = JSON.parse(req.body.fundDetails);
        const performanceData = JSON.parse(req.body.performanceData);
        const allocationData = JSON.parse(req.body.allocationData);

        const uploadedFile = req.files[0];
        if (uploadedFile) {
            const fileName = uploadedFile.filename;
            const originalName = uploadedFile.originalname;

            const file_url = await UploadToAwsBucket(fileName);
            console.log("Upload S3 URL ", file_url);
            fundDetails.logo_url = file_url + '||' + originalName;
        }
        console.log(fundDetails)

        await EditFund(email, teamMembers, fundDetails, performanceData, allocationData);
        return res.json({ error: false });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error." });
    }
};

module.exports = { GetAllFundsController, AddFundController, EditFundController };
