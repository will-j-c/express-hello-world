const Joi = require('joi');

const ProjectSchema = Joi.object({
  user_id: Joi.string().required().min(1).max(30),

  title: Joi.string().required().min(1).max(30),

  slug: Joi.string().min(1).max(30),

  logo_url: Joi.string(),

  tagline: Joi.string(),

  categories: Joi.array().items(Joi.string()),

  state: Joi.string(),

  description: Joi.string(),

  image_urls: Joi.array().items(Joi.string()),
});

module.exports = ProjectSchema;

// schema.validate({ username: 'abc', birth_year: 1994 });
// -> { value: { username: 'abc', birth_year: 1994 } }

// schema.validate({});
// -> { value: {}, error: '"username" is required' }

// Also -

// try {
//     const value = await schema.validateAsync({ username: 'abc', birth_year: 1994 });
// }
// catch (err) { }
