const AccessManagment = require("express").Router()
const { CustomerSignupEmailValidationController, CustomerPinController } = require("./controllers/CustomerSignup")
const { CustomerLoginEmailValidationController, CustomerGenerateOtpController, CustomerValidateOtpController, CustomerValidatePinController, CustomerResetPinController } = require("./controllers/CustomerLogin")


AccessManagment.post("/signup/email-validation", CustomerSignupEmailValidationController)
AccessManagment.get("/signup/set-pin", CustomerPinController)
AccessManagment.get("/login/email-validation", CustomerLoginEmailValidationController)
AccessManagment.post("/generate-otp", CustomerGenerateOtpController)
AccessManagment.post("/validate-otp", CustomerValidateOtpController)
AccessManagment.post("/login/validate-pin", CustomerValidatePinController)
AccessManagment.put("/reset-pin", CustomerResetPinController)





exports.AccessManagment = AccessManagment;