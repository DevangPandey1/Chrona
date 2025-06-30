const express = require('express');
const router = express.Router();
const {
  getNotes,
  getTags,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.get('/tags', getTags);

router.route('/:id')
  .put(updateNote)
  .delete(deleteNote);

module.exports = router; 