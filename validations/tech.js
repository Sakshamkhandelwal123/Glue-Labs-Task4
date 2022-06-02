const Joi = require("joi");

const TechValidations = {
  createOrUpdateTechValidator: {
    body: Joi.object({
      title: Joi.string().min(3).max(30).required(),
      technologies: Joi.string().required(),
      description: Joi.string().min(10).max(200).required(),
      budget: Joi.string().required(),
      contact_email: Joi.string().email().required()
    }),
  },
};

module.exports = TechValidations;