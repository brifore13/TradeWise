import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('✅ Environment variables loaded successfully');
}

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY ? 'LOADED' : 'NOT FOUND');

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise',
  jwtSecret: process.env.JWT_SECRET,
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Additional debug
console.log('Config object:');
console.log('alphaVantageApiKey:', config.alphaVantageApiKey ? 'LOADED' : 'NOT FOUND');