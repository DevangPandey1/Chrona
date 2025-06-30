const Journal = require('../models/Journal');

// @desc    Get user journal entries
// @route   GET /api/journal
// @access  Private
const getJournalEntries = async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = async (req, res) => {
  try {
    const { entry, date } = req.body;

    if (!entry) {
      return res.status(400).json({ message: 'Please provide journal entry content' });
    }

    // Check if entry for this date already exists
    const existingEntry = await Journal.findOne({
      userId: req.user._id,
      date: date || new Date(),
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Journal entry for this date already exists' });
    }

    const journalEntry = await Journal.create({
      userId: req.user._id,
      entry,
      date: date || new Date(),
    });

    res.status(201).json(journalEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Private
const updateJournalEntry = async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check for user
    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedEntry = await Journal.findByIdAndUpdate(
      req.params.id,
      { entry: req.body.entry },
      { new: true }
    );

    res.json(updatedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
const deleteJournalEntry = async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check for user
    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Journal.findByIdAndDelete(req.params.id);

    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
}; 