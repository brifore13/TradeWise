import express from 'express';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router()

// Input validation helpers
const valdateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && re.test(password);
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public

router.post('/register', async(req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // validation
        if (!(firstName && lastName && email && password && confirmPassword)) {
            return res.status(400),json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!valdateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            })
        } 

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Passwork must be at least 8 characters and contain uppercase, lowercase, number and special character'
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
              });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
              });
        }
        
        //  Create new user
        const user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password
        })

        await user.save()

        // Generate token
        const tokens = generateTokens(user);

        // Store refresh token
        user.refreshTokens.push({
            token: tokens.refreshToken,
            createdAt: new Date()
        });
        user.lastLogin = new Date();
        await user.save();

        //  remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshTokens;

        res.status(201).json({
            success: true,
            message: 'User registered successsfully',
            data: {
                user: userResponse,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});