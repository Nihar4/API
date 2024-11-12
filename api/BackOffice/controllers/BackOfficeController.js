const UploadToAwsBucket = require("../../../utils/UploadToAwsBucket");
const { AddFund } = require("../services/AddFund");

const { EditFund } = require("../services/EditFund");
const { GetAllFunds } = require("../services/GetAllFunds");

const { AddFundUpdates } = require("../services/AddFundUpdates");
const { GetFundUpdates } = require("../services/GetFundUpdates");

const { AddFundSheets } = require("../services/AddFundSheets");
const { GetFundSheets } = require("../services/GetFundSheets");

const GetAllFundsController = async (req, res, next) => {
  try {
    const { email } = req.query;
    const strategies = await GetAllFunds(email);
    return res.json({ error: false, data: strategies });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
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
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
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
      fundDetails.logo_url = file_url + "||" + originalName;
    }
    console.log(fundDetails);

    await EditFund(
      email,
      teamMembers,
      fundDetails,
      performanceData,
      allocationData
    );
    return res.json({ error: false });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

const FundUpdateController = async (req, res, next) => {
  try {
    
    const fundId = JSON.parse(req.body.fundId);
    const title = JSON.parse(req.body.title);
    const body = JSON.parse(req.body.body);
    const date = JSON.parse(req.body.date);
    const file = req.files[0];
    const video = req.files[1];

    let file_url = null;
    let video_url = null;

    if (file) {
      file_url = await UploadToAwsBucket(file.filename);
      
      
    }

    if (video) {
      video_url = await UploadToAwsBucket(video.filename);
      
    }

    
    console.log(file,video,file_url,);

    
    await AddFundUpdates(fundId, title, body, file_url, video_url, date);

    res.status(200).json({ message: "Fund update added successfully" });
  } catch (error) {
    console.error("Error in FundUpdateController:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const GetFundUpdatesController = async (req, res) => {
  try {
    const { fundId } = req.params;
    

    const fundUpdates = await GetFundUpdates(fundId);
    if (fundUpdates.length === 0) {
      return res
        .status(404)
        .json({ message: "No updates found for this fund." });
    }
    res
      .status(200)
      .json({ message: "Fetched fund updates successfully", fundUpdates });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
const FundSheetController = async (req, res) => {
  try {
    
    const fundId = JSON.parse(req.body.fundId);
    const title = JSON.parse(req.body.title);
    const date = JSON.parse(req.body.date);
    const file = req.files[0];

    let file_url = null;

    if (file) {
      file_url = await UploadToAwsBucket(file.filename);
      
    }

    

    await AddFundSheets(fundId, title, file_url, date);

    res.status(200).json({ message: "fund sheets added successfully" });
  } catch (error) {
    
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const GetFundSheetController = async (req, res) => {
  try {
    const { fundId } = req.params;
    

    const fundFactSheets = await GetFundSheets(fundId);
    if (fundFactSheets.length === 0) {
      return res
        .status(404)
        .json({ message: "No updates found for this fund." });
    }
    res
      .status(200)
      .json({ message: "Fetched fund updates successfully", fundFactSheets });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = {
  GetAllFundsController,
  AddFundController,
  EditFundController,
  FundUpdateController,
  GetFundUpdatesController,
  GetFundSheetController,
  FundSheetController,
};
