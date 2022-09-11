/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const contributorValidation = {
  add: Joi.object({
    title: Joi.string().min(3).max(30).required(),
    skills: Joi.string().required(),
    is_remote: Joi.boolean().required(),
    city: Joi.string(),
    remuneration: Joi.string(),
    commitmentLevel: Joi.string().valid('high', 'medium', 'low').required(),
    description: Joi.string().required(),
    available_slots: Joi.number().required(),
  }),
};

module.exports = contributorValidation;
