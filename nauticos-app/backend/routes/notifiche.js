const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const notifiche = await db.notifiche.find({ utente_id: req.user.id }).sort({ created_at: -1 });
    res.json({ notifiche: notifiche.slice(0, 30), non_lette: notifiche.filter(n => !n.letta).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/leggi-tutte', async (req, res) => {
  try {
    await db.notifiche.update({ utente_id: req.user.id }, { $set: { letta: true } }, { multi: true });
    res.json({ message: 'ok' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/leggi', async (req, res) => {
  try {
    await db.notifiche.update({ _id: req.params.id }, { $set: { letta: true } });
    res.json({ message: 'ok' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
