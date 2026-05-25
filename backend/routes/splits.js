const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Split = require('../models/Split');

router.get('/', auth, async (req, res) => {
  try {
    const splits = await Split.find({ user: req.user.id }).sort({ date: -1 });
    res.json(splits);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const split = new Split({ ...req.body, user: req.user.id });
    await split.save();
    res.json(split);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id/member/:memberId', auth, async (req, res) => {
  try {
    const split = await Split.findOne({ _id: req.params.id, user: req.user.id });
    if (!split) return res.status(404).json({ msg: 'Not found' });
    const member = split.members.id(req.params.memberId);
    if (member) member.paid = !member.paid;
    await split.save();
    res.json(split);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Split.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Split deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
