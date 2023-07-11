const Joi = require("joi");

exports.dataValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    phone: Joi.string().min(5).max(15).required(),
    email: Joi.string().required(),
    favorite: Joi.boolean(),
  });

  return schema.validate(data);
};

exports.emailValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};
