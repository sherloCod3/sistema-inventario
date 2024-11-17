import dotenv from 'dotenv';

dotenv.config();

console.log('MONGODB_ATLAS_URI:', process.env.MONGODB_ATLAS_URI);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
