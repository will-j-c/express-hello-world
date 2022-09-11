/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const contributorValidation = {
  add: Joi.object({
    title: Joi.string().min(3).max(30).required(),
    skills: Joi.string().required(),
    is_remote: Joi.boolean().required(),
    commitmentLevel: Joi.string().required(),
    description: Joi.string().required(),
    available_slots: Joi.number().required(),
  }),
};

module.exports = contributorValidation;
