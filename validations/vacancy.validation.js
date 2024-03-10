const Joi = require("joi");

exports.vacancyValidation = (data) => {
  const schema = Joi.object({
    
    employer_id:Joi.number(),
    city:Joi.string(),
     job_id:Joi.number(),
    salary:Joi.number(),
})
  return schema.validate(data, { abortEarly: false });
};
