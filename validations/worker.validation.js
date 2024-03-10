const Joi = require("joi");

exports.workerValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    last_name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    birth_date: Joi.string(),
    gender: Joi.string().valid("erkak", "ayol"),
    passport: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    confirm_password: Joi.ref("password"),
    phone_number: Joi.string().pattern(new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)),
    tg_link: Joi.string(),
    graduate: Joi.string(),
    skills: Joi.string(),
    exprience: Joi.number().integer().min(1).max(5),
    is_active: Joi.boolean().default(false),
    is_creator: Joi.boolean().default(false),
    description: Joi.string(),
  });
  return schema.validate(data, { abortEarly: false });
};
