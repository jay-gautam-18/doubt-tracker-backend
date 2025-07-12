const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'mentor']),
  validateRequest
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validateRequest
], login);

module.exports = router; 