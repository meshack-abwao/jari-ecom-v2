export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  
  // Validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference' });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}
