const Joi = require("joi");

exports.applicationValidation = (data) => {
  const schema = Joi.object({

     
     vacancy_id:Joi.number(),
     worker_id:Joi.number(),
     application_date:Joi.date()
 
  });
  return schema.validate(data, { abortEarly: false });
};
