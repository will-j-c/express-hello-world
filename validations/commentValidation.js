/* eslint-disable prefer-regex-literals */
/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const commentValidation = {
  post: Joi.object({
    user_id: Joi.required(),
    project_id: Joi.required(),
    content: Joi.string().min(1).max(700).required(),
  }),
};

module.exports = commentValidation;
