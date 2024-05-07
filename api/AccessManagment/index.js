const AccessManagment = require("express").Router()
const { CustomerSignupEmailValidationController, CustomerPinController } = require("./controllers/CustomerSignup")
const { CustomerLoginEmailValidationController, CustomerGenerateOtpController, CustomerValidateOtpController, CustomerValidatePinController, CustomerResetPinController } = require("./controllers/CustomerLogin")
const getstockprice = require("./getstockprice")
const getstockdetails = require("./getstockdetails")
const getsearchlive = require("./getsearchlive")
const gethistoricaldata = require("./gethistoricaldata")
const getsearchliveEureka = require("./getSearchLiveEureka")


AccessManagment.post("/signup/email-validation", CustomerSignupEmailValidationController)
AccessManagment.get("/signup/set-pin", CustomerPinController)
AccessManagment.get("/login/email-validation", CustomerLoginEmailValidationController)
AccessManagment.post("/generate-otp", CustomerGenerateOtpController)
AccessManagment.post("/validate-otp", CustomerValidateOtpController)
AccessManagment.post("/login/validate-pin", CustomerValidatePinController)
AccessManagment.put("/reset-pin", CustomerResetPinController)

AccessManagment.post("/getstockprice", getstockprice)
AccessManagment.get("/getstockdetails", getstockdetails)
AccessManagment.get("/getsearchlive", getsearchlive)
AccessManagment.get("/getsearchliveEureka", getsearchliveEureka)
AccessManagment.get("/hitstoricaldata",gethistoricaldata)





exports.AccessManagment = AccessManagment;