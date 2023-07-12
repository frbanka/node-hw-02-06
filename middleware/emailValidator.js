const Joi = require("joi");

const emailValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};
module.exports = emailValidator;
