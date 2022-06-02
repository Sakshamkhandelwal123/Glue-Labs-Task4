const Joi = require("joi");

const UserValidations = {
  createOrUpdateUserValidator: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string()
    }),
  },
};

module.exports = UserValidations;