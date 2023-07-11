const { emailValidator } = require("../middleware/emailValidator");

const validateEmail = () => {
  const validate = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ message: "Missing required field email" });
    }
    const { error } = await emailValidator(req.body);
    if (error) {
      res.status(400).json({ message: "Email not valid" });
    }
    next();
  };
  return validate;
};

module.exports = validateEmail;
