const express = require('express');
const router = express.Router();
const {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

router.route('/:id')
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

module.exports = router; 