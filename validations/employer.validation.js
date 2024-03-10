const Joi = require("joi");

exports.employerValidation = (data) => {
  const schema = Joi.object({
    company_name: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$"))
      .min(2)
      .max(50),
    industry: Joi.string(),
    country_id: Joi.number(),
    address: Joi.string(),
    location: Joi.string(),
    contact_name: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$"))
      .min(2)
      .max(50),
    contact_passport: Joi.string(),
    contact_email: Joi.string(),
    contact_phone: Joi.string().pattern(
      new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)
    ),
    password: Joi.string().min(6),
    confirm_password: Joi.ref("password"),
  });
  return schema.validate(data, { abortEarly: false });
};
