const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const doubtController = require('../controllers/doubtController');

const router = express.Router();

// Student: create doubt
router.post('/',
  authMiddleware,
  roleMiddleware(['student']),
  [body('title').notEmpty(), body('description').notEmpty(), validateRequest],
  doubtController.createDoubt
);

// Get all doubts (student: own, mentor: all)
router.get('/', authMiddleware, doubtController.getDoubts);

// Get single doubt
router.get('/:id', authMiddleware, doubtController.getDoubtById);

// Student: update own doubt
router.put('/:id',
  authMiddleware,
  roleMiddleware(['student']),
  [body('title').optional().notEmpty(), body('description').optional().notEmpty(), validateRequest],
  doubtController.updateDoubt
);

// Student: delete own doubt
router.delete('/:id', authMiddleware, roleMiddleware(['student']), doubtController.deleteDoubt);

// Student or mentor: mark as resolved
router.patch('/:id/resolve', authMiddleware, roleMiddleware(['student', 'mentor']), doubtController.markResolved);

module.exports = router; 