const router = require('express').Router();
const Problem = require('../models/Problem');
const axios = require('axios');
const Submission = require('../models/Submission');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Set the compiler URL to port 8000 to match your running service
const COMPILER_URL = process.env.COMPILER_URL;
const API_BASE_URL=process.env.BACKEND_URL;
// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all problems (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { difficulty, solved } = req.query;
    let filter = {};
    if (difficulty) {
      filter.difficulty = difficulty.toLowerCase();
    }
    let problems = await Problem.find(filter);
    // If solved filter is provided, try to authenticate and filter accordingly
    if (solved !== undefined) {
      // solved can be 'true' or 'false' as string
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            // Get all submissions for this user with status 'Submitted'
            const userSubmissions = await Submission.find({ user: userId, status: 'Submitted' });
            const solvedProblemIds = new Set(userSubmissions.map(sub => sub.problem.toString()));
            if (solved === 'true') {
              problems = problems.filter(p => solvedProblemIds.has(p._id.toString()));
            } else if (solved === 'false') {
              problems = problems.filter(p => !solvedProblemIds.has(p._id.toString()));
            }
          } catch (err) {
            // If token is invalid, ignore solved filter and return all problems
          }
        }
      }
      // If no auth header or token, ignore solved filter and return all problems
    }
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/:id/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.id;
    
    // Get the latest submission (successful or failed)
    const latestSubmission = await Submission.findOne({ 
      user: userId, 
      problem: problemId 
    }).sort({ createdAt: -1 });
    
    // Also check if there's any successful submission
    const successfulSubmission = await Submission.findOne({ 
      user: userId, 
      problem: problemId, 
      status: 'Submitted' 
    });
    
    if (latestSubmission) {
      return res.json({ 
        status: successfulSubmission ? 'Submitted' : latestSubmission.status,
        lastAttemptStatus: latestSubmission.status,
        submittedAt: latestSubmission.createdAt,
        submissionId: latestSubmission._id,
        hasSuccessfulSubmission: !!successfulSubmission
      });
    } else {
      return res.json({ status: 'Not Attempted' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Get all submissions for a specific problem by the logged-in user
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.id;
    
    const submissions = await Submission.find({ 
      user: userId, 
      problem: problemId 
    }).sort({ createdAt: -1 });
    
    const submissionData = submissions.map(sub => ({
      _id: sub._id,
      language: sub.language,
      status: sub.status,
      submittedAt: sub.createdAt
    }));
    
    res.json(submissionData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Get a single problem by ID


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

// Get submission status for a user and problem


// Submit code for all test cases
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { code, language = 'cpp' } = req.body;
    const userId = req.user.id;
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
    
    // Save all submission attempts (both successful and failed)
    try {
      const status = allPassed ? 'Submitted' : 'Failed';
      const newSubmission = new Submission({
        user: userId,
        problem: problem._id,
        code,
        language,
        status,
        testResults: results,
        createdAt: new Date()
      });
      await newSubmission.save();
    } catch (err) {
      // Silently handle submission save errors
      console.error('Error saving submission:', err);
    }
    
    res.json({ results, allPassed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get user statistics: total, solved, remaining
router.get('/user/statistics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await Problem.countDocuments();
    
    // Count unique problems solved (distinct problem IDs with status 'Submitted')
    const solvedProblems = await Submission.distinct('problem', { user: userId, status: 'Submitted' });
    const solved = solvedProblems.length;
    
    res.json({ total, solved, remaining: total - solved });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all submissions for a user
router.get('/user/submissions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 });
    
    const submissionData = submissions.map(sub => ({
      _id: sub._id,
      problem: {
        _id: sub.problem._id,
        title: sub.problem.title,
        difficulty: sub.problem.difficulty
      },
      language: sub.language,
      status: sub.status,
      submittedAt: sub.createdAt
    }));
    
    res.json(submissionData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get specific submission code
router.get('/submissions/:submissionId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const submissionId = req.params.submissionId;
    
    const submission = await Submission.findOne({ 
      _id: submissionId, 
      user: userId 
    }).populate('problem', 'title difficulty');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json({
      _id: submission._id,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      submittedAt: submission.createdAt,
      testResults: submission.testResults || [],
      problem: {
        _id: submission.problem._id,
        title: submission.problem.title,
        difficulty: submission.problem.difficulty
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 