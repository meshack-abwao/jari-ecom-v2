export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'jari-v2-secret-change-in-production',
  jwtExpiry: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  // CORS: Allow all origins for public endpoints (domain lookup needs to work from any custom domain)
  // In production, the /domain/lookup endpoint is public and needs to accept requests from ANY custom domain
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || '*'
};
