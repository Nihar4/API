const { CustomerEmailValidation } = require("../services/CustomerEmailValidation")
const { CustomerPinset } = require("../services/CustomerPinset")
const { isEmpty, validateEmail, checkLength } = require("../../../utils/Validation");



const CustomerSignupEmailValidationController = async (req, res, next) => {
  const { email_id } = req.body;

  if (!validateEmail(email_id)) {
    return res.json({ error: true, message: "Enter Valid Email" })
  }

  try {
    const data = await CustomerEmailValidation(email_id);
    if (checkLength(data, 0)) {
      return res.json({ error: false, message: 'Email is validated' });
    }
    else {
      return res.json({ error: true, message: 'Email is already registered' });
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: true, message: error });
  }
}

const CustomerPinController = async (req, res, next) => {
  const { email_id, pin } = req.query;

  if (isEmpty(email_id))
    return res.json({ error: true, message: "email id can't be empty" })

  if (!checkLength(pin, 4))
    return res.json({ error: true, message: "PIN should be 4 length" })

  try {
    const data = await CustomerPinset(email_id, pin);
    return res.json({ error: false, message: "PIN set successfully", data });
  } catch (error) {
    return res.json({ error: true, message: error });
  }
}


module.exports = { CustomerSignupEmailValidationController, CustomerPinController };
