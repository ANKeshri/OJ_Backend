const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Submission = require('../models/Submission'); // Added Submission model import

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { email, password, dob, fullName, leetcodeProfile } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            dob,
            fullName,
            leetcodeProfile
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                leetcodeProfile: user.leetcodeProfile
            }
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Google Auth Route
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // User exists, if they don't have a googleId, link it
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        } else {
            // User doesn't exist, create a new one
            // For DOB and LeetCode, you might want a separate step for the user to enter them.
            user = new User({
                googleId: sub,
                email,
                fullName: name,
                // These fields are required in your schema, but not provided by Google.
                // Setting a default/placeholder. The user should update this later.
                dob: new Date(), // Placeholder DOB
                leetcodeProfile: '' // Placeholder
            });
            await user.save();
        }

        // Create JWT token for the user
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                leetcodeProfile: user.leetcodeProfile
            },
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ message: 'Google authentication failed' });
    }
});

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

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, leetcodeProfile, dob } = req.body;
    const update = {};
    if (fullName) update.fullName = fullName;
    if (leetcodeProfile) update.leetcodeProfile = leetcodeProfile;
    if (dob) update.dob = dob;
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      leetcodeProfile: user.leetcodeProfile,
      dob: user.dob,
      createdAt: user.createdAt
    }});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Leaderboard route: returns users with solved count and rating
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email');
    // For each user, count unique problems with a 'Submitted' submission
    const leaderboard = await Promise.all(users.map(async user => {
      const solvedProblems = await Submission.distinct('problem', { user: user._id, status: 'Submitted' });
      const solved = solvedProblems.length;
      // Simple rating: 1500 + 10*solved
      const rating = 1500 + 10 * solved;
      return {
        name: user.fullName,
        email: user.email,
        solved,
        rating
      };
    }));
    // Sort by solved descending, then rating descending
    leaderboard.sort((a, b) => b.solved - a.solved || b.rating - a.rating);
    // Add rank
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 