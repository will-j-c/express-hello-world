/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const projectValidationSchema = {
  create: Joi.object({
    user_id: Joi.string().required().min(1).max(30),
    title: Joi.string().required().min(1).max(30),
    slug: Joi.string().min(1).max(30),
    logo_url: Joi.string(),
    tagline: Joi.string(),
    categories: Joi.array().items(Joi.string()),
    state: Joi.string(),
    description: Joi.string().min(0),
    image_urls: Joi.array().items(Joi.string()),
  }),
  edit: Joi.object({
    user_id: Joi.string().min(1).max(30),
    title: Joi.string().min(1).max(30),
    slug: Joi.string().min(1).max(30),
    logo_url: Joi.string(),
    tagline: Joi.string(),
    categories: Joi.array().items(Joi.string()),
    state: Joi.string(),
    description: Joi.string(),
    image_urls: Joi.array().items(Joi.string()),
  }),
};

module.exports = projectValidationSchema;
