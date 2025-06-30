const Note = require('../models/Note');

// @desc    Get user notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = { userId: req.user._id };
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }
    
    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user tags
// @route   GET /api/notes/tags
// @access  Private
const getTags = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    const allTags = notes.reduce((tags, note) => {
      return tags.concat(note.tags || []);
    }, []);
    
    // Get unique tags and count
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const uniqueTags = Object.keys(tagCounts).map(tag => ({
      name: tag,
      count: tagCounts[tag]
    }));
    
    res.json(uniqueTags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    // Process tags - convert to array and clean
    const processedTags = tags ? 
      tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
      [];

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      tags: processedTags,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check for user
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Process tags if provided
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check for user
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotes,
  getTags,
  createNote,
  updateNote,
  deleteNote,
}; 