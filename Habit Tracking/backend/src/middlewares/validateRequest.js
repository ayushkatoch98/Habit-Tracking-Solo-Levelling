/**
 * Validation middleware factory
 * @param {Function} validator - Validation function that returns { error, value }
 */
const validateRequest = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
        
    req.body = value;
    next();
  };
};

module.exports = validateRequest;

