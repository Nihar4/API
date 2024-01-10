const AccessManagment = require("express").Router()
const { CustomerSignupEmailValidationController, CustomerPinController } = require("./controllers/CustomerSignup")


AccessManagment.post("/signup/email-validation", CustomerSignupEmailValidationController)
AccessManagment.get("/signup/set-pin", CustomerPinController)


exports.AccessManagment = AccessManagment;