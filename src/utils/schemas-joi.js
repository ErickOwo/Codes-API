const Joi = require('@hapi/joi');

// user schemas 
const schemaRegisterUser = Joi.object({
  name: Joi.string().min(3).max(460).required(),
  email: Joi.string().min(6).max(260).required().email(),
  password: Joi.string().min(8).max(2048).required(),
});
const schemaLoginUser = Joi.object({
  email: Joi.string().min(6).max(260).required().email(),
  password: Joi.string().min(8).max(2048).required(),
});



module.exports = {
  schemaRegisterUser,
  schemaLoginUser,
}

