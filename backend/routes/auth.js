import express from 'express';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router()

// Input validation helpers
const validateEmail = (email) => {
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
            console.log('Validation failed: Missing fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!validateEmail(email)) {
            console.log('Validation failed: email validation')
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            })
        } 

        if (!validatePassword(password)) {
            console.log('Validation failed: password')
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number and special character'
            })
        }

        if (password !== confirmPassword) {
            console.log('PWs do not match')
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
              });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('user exists')
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

// @route   POST /api/auth/login
// @desc    Login user
// @access Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
              success: false,
              message: 'Email and password are required'
            });
          }
      
          if (!validateEmail(email)) {
            return res.status(400).json({
              success: false,
              message: 'Please provide a valid email address'
            });
          }

        // find user with password field
        const user =  await User.findOne({ email: email.toLowerCase()}).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        // check if active account
        if (!user.isActive) {
            return res.status(401).json({
              success: false,
              message: 'Account is deactivated'
            });
          }

        const isValidPassword = await user.comparePassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
              });
        }
        // generate tokens
        const tokens = generateTokens(user);
        
        // Clean up old refresh tokens and add new one
        user.cleanupRefreshTokens();
        user.refreshTokens.push({
            token: tokens.refreshToken,
            createdAt: new Date()
        });
        user.lastLogin = new Date();
        await user.save();

        // Remove sensitive data from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshTokens;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh tokens)
// @access  Private
router.post('/logout', verifyRefreshToken, async (req, res) => {
    try {
        const user = req.user;
        const refreshToken = req.refreshToken;

        user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
        await user.save()

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        })
    }
})

// @router  GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-refreshTokens');

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data'
        })
    }
})

// @route   POST /api/auth/test-protected
// @desc    Test protected route
// @access  Private
router.get('/test-protected', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        message: 'Protected route accessed successfully!',
        user: {
            id: req.user._id,
            name: req.user.fullName,
            email: req.user.email
        }
    });
});

export default router