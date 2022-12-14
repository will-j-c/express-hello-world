/* eslint-disable prefer-regex-literals */
/* eslint-disable react/forbid-prop-types */
const Joi = require('joi');

const userValidation = {
  register: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
      .required(),
    hash: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(6).required(),
    confirm_password: Joi.ref('hash'),
  }),
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    hash: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(6).required(),
  }),
  profile: Joi.object({
    name: Joi.string().min(3).max(30),
    about: Joi.string().min(3).max(30).allow(null, ''),

    skills: Joi.array().items(Joi.string()),
    interests: Joi.array().items(Joi.string()),

    socmed: Joi.object(),
    tagline: Joi.string().allow(null, ''),
    profile_pic_url: Joi.string(),
  }),
};

module.exports = userValidation;
