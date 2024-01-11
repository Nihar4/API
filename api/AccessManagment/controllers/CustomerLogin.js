const { isEmpty, validateEmail, checkLength } = require("../../../utils/Validation");
const { SendEmail } = require("../../../utils/SendEmail");
const { CustomerEmailValidation } = require("../services/CustomerEmailValidation");
const { CustomerGenerateOtp } = require("../services/CustomerGenerateOtp");
const { CustomerResetPin } = require("../services/CustomerResetPin");
const { CustomerValidateOtp } = require("../services/CustomerValidateOtp");
const { CustomerValidatePin } = require("../services/CustomerValidatePin");
const { LoginOTPEmail } = require("../../../utils/Templetes/LoginOtpEmail");


const CustomerLoginEmailValidationController = async (req, res, next) => {
    const { email_id } = req.query;
    console.log(req.query)

    if (!validateEmail(email_id)) {
        return res.json({ error: true, message: "Enter Valid Email" })
    }

    try {
        const data = await CustomerEmailValidation(email_id);
        if (checkLength(data, 1)) {
            return res.json({ error: false, message: 'Email Validate', data });
        }
        else {
            return res.json({ error: true, message: 'This Email is not registered' });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: true, message: error });
    }
}

const CustomerGenerateOtpController = async (req, res, next) => {
    const { email_id } = req.body;
    console.log(req.body)
    const otp = Math.floor(Math.random() * 900000) + 100000;
    if (isEmpty(email_id))
        return res.json({ error: true, message: "email id can't be empty" })

    const subject = `${otp} is your Swiftfolios OTP`
    const html = LoginOTPEmail(otp);
    const to = email_id
    SendEmail({ to, subject, html });

    try {
        await CustomerGenerateOtp(email_id, otp);
        return res.json({ error: false, message: 'Otp Generated' });
    } catch (error) {
        console.log(error);
        return res.json({ error: true, message: error });
    }
}

const CustomerValidateOtpController = async (req, res, next) => {
    const { email_id, otp } = req.body;
    console.log(req.body)

    if (isEmpty(email_id))
        return res.json({ error: true, message: "email id can't be empty" })
    if (!checkLength(otp, 6))
        return res.json({ error: true, message: "OTP should be 6 length" })

    try {
        const data = await CustomerValidateOtp(email_id);
        if (data[0].otp == otp)
            return res.json({ error: false, message: 'Otp Valid' });
        else
            return res.json({ error: true, message: 'Otp is incorrect' });

    } catch (error) {
        console.log(error);
        return res.json({ error: true, message: error });
    }
}

const CustomerValidatePinController = async (req, res, next) => {
    const { email_id, pin } = req.body;
    console.log(req.body)

    if (isEmpty(email_id))
        return res.json({ error: true, message: "email id can't be empty" })

    if (!checkLength(pin, 4))
        return res.json({ error: true, message: "PIN should be 4 length" })

    try {
        const data = await CustomerValidatePin(email_id);
        if (data[0].pin == pin)
            return res.json({ error: false, message: 'Pin Valid' });
        else
            return res.json({ error: true, message: 'Pin is incorrect' });

    } catch (error) {
        console.log(error);
        return res.json({ error: true, message: error });
    }
}

const CustomerResetPinController = async (req, res, next) => {
    const { email_id, pin } = req.body;
    // console.log(req.body)

    if (isEmpty(email_id))
        return res.json({ error: true, message: "email id can't be empty" })

    if (!checkLength(pin, 4))
        return res.json({ error: true, message: "PIN should be 4 length" })

    try {
        await CustomerResetPin(email_id, pin);
        return res.json({ error: false, message: 'Pin Reset' });
    } catch (error) {
        console.log(error);
        return res.json({ error: true, message: error });
    }
}



module.exports = { CustomerLoginEmailValidationController, CustomerGenerateOtpController, CustomerValidateOtpController, CustomerValidatePinController, CustomerResetPinController }