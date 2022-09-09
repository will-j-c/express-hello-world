const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const projectSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      slug: 'title',
    },
    logo_url: {
      type: String,
    },
    tagline: {
      type: String,
    },
    categories: {
      type: Array,
    },
    state: {
      type: String,
    },
    description: {
      type: String,
    },
    image_urls: {
      type: Array,
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = ProjectModel;
