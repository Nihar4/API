const AccessManagment = require("express").Router()
const { CustomerLoginEmailValidationController, CustomerGenerateOtpController, CustomerValidateOtpController, CustomerValidatePinController, CustomerResetPinController } = require("./controllers/CustomerLogin")



AccessManagment.get("/login/email-validation", CustomerLoginEmailValidationController)
AccessManagment.post("/generate-otp", CustomerGenerateOtpController)
AccessManagment.post("/validate-otp", CustomerValidateOtpController)
AccessManagment.post("/login/validate-pin", CustomerValidatePinController)
AccessManagment.put("/reset-pin", CustomerResetPinController)





exports.AccessManagment = AccessManagment;