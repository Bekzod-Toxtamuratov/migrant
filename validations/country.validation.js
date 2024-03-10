const Joi = require("joi");

exports.countryValidation = (data) => {
  const schema = Joi.object({

    name:Joi.string(),
    flag:Joi.string()
   
  });
  return schema.validate(data, { abortEarly: false });
};
