import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate access token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};
// Generate token pair
const generateTokens = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};

//  Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // bearer token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // check user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is deactivated'
            });
        }

        //  add user to request object
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError'){
            return res.status(403).json({
                success: false,
                message: 'Invalid token'
              });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Token expired'
              });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}
// Middleware to verify refresh token
// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user and check if refresh token exists
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
      
      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found or expired'
        });
      }
      
      req.user = user;
      req.refreshToken = refreshToken;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      
      console.error('Refresh token verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token verification error'
      });
    }
  };

  export {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    authenticateToken,
    verifyRefreshToken
  };