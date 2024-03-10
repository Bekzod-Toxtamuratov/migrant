const Joi = require("joi");

exports.worker_jobValidation = (data) => {
  const schema = Joi.object({
    worker_id: Joi.number(),
    job_id: Joi.number(),
  });
  return schema.validate(data, { abortEarly: false });
};
