const router = require('express').Router();
const Problem = require('../models/Problem');
const axios = require('axios');

// Set the compiler URL to port 8000 to match your running service
const COMPILER_URL = process.env.COMPILER_URL;

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sample test cases for a problem
router.get('/:id/testcases', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const samples = problem.testCases.filter(tc => tc.isSample);
    res.json(samples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Run code on sample test cases
router.post('/:id/run', async (req, res) => {
  try {
    const { code, language = 'cpp' } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const samples = problem.testCases.filter(tc => tc.isSample);
    const results = await Promise.all(samples.map(async (tc) => {
      try {
        const response = await axios.post(COMPILER_URL, { code, language, input: tc.input });
        const userOutput = (response.data.output || '').trim();
        const expectedOutput = (tc.output || '').trim();
        return {
          input: tc.input,
          expectedOutput,
          userOutput,
          passed: userOutput === expectedOutput
        };
      } catch (err) {
        return {
          input: tc.input,
          expectedOutput: tc.output,
          userOutput: '',
          passed: false,
          error: err.message || 'Execution error'
        };
      }
    }));
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit code for all test cases
router.post('/:id/submit', async (req, res) => {
  try {
    const { code, language = 'cpp' } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const testCases = problem.testCases;
    const results = await Promise.all(testCases.map(async (tc) => {
      try {
        const response = await axios.post(COMPILER_URL, { code, language, input: tc.input });
        const userOutput = (response.data.output || '').trim();
        const expectedOutput = (tc.output || '').trim();
        return {
          input: tc.input,
          expectedOutput,
          userOutput,
          passed: userOutput === expectedOutput
        };
      } catch (err) {
        return {
          input: tc.input,
          expectedOutput: tc.output,
          userOutput: '',
          passed: false,
          error: err.message || 'Execution error'
        };
      }
    }));
    const allPassed = results.every(r => r.passed);
    res.json({ results, allPassed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 