/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const contributorValidation = {
  details: Joi.object({
    title: Joi.string().min(3).max(30).required(),
    skills: Joi.array().required(),
    is_remote: Joi.boolean().required(),
    city: Joi.string(),
    remuneration: Joi.string(),
    commitment_level: Joi.string().valid('high', 'medium', 'low').required(),
    description: Joi.string().required(),
    available_slots: Joi.number().min(1).required(),
  }),
};

module.exports = contributorValidation;
