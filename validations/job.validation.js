const Joi = require("joi");

exports.jobValidation = (data) => {
  const schema = Joi.object({
    worker_id: Joi.number(),
    job_id: Joi.number(),
  });
  return schema.validate(data, { abortEarly: false });
};
