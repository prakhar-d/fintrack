const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ date: -1 });
    res.json(goals);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({ ...req.body, user: req.user.id });
    await goal.save();
    res.json(goal);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (goal.savedAmount >= goal.targetAmount) goal.completed = true;
    await goal.save();
    res.json(goal);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Goal deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
