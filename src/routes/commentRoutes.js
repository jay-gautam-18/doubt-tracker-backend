const express = require('express');
const { body, query } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const commentController = require('../controllers/commentController');

const router = express.Router();

// Mentor: post comment
router.post('/',
  authMiddleware,
  roleMiddleware(['mentor']),
  [body('doubtId').notEmpty(), body('content').notEmpty(), validateRequest],
  commentController.postComment
);

// Get all comments for a doubt
router.get('/',
  authMiddleware,
  [query('doubtId').notEmpty(), validateRequest],
  commentController.getComments
);

module.exports = router; 