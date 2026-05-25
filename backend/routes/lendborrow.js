const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LendBorrow = require('../models/LendBorrow');

router.get('/', auth, async (req, res) => {
  try {
    const records = await LendBorrow.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const record = new LendBorrow({ ...req.body, user: req.user.id });
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id/settle', auth, async (req, res) => {
  try {
    const record = await LendBorrow.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { settled: true },
      { new: true }
    );
    res.json(record);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await LendBorrow.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Record deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
