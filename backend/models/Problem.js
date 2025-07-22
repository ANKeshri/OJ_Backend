const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String,
  isSample: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  constraints: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  testCases: [testCaseSchema],
});

module.exports = mongoose.model('Problem', problemSchema); 