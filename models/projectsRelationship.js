const mongoose = require('mongoose');

const projectsRelationshipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  project_id: {
    type: mongoose.ObjectId,
    ref: 'Project',
    required: true,
  },
});

const ProjectsRelationshipModel = mongoose.model(
  'ProjectsRelationship',
  projectsRelationshipSchema
);

module.exports = ProjectsRelationshipModel;
