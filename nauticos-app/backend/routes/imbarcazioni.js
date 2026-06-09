const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    if (req.user.ruolo === 'equipaggio') {
      const assoc = await db.assoc.find({ utente_id: req.user.id });
      const barche = [];
      for (const a of assoc) {
        const b = await db.imbarcazioni.findOne({ _id: a.imbarcazione_id });
        if (b) barche.push({ ...b, ruolo_bordo: a.ruolo_bordo });
      }
      return res.json(barche);
    }
    res.json(await db.imbarcazioni.find({}));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const b = await db.imbarcazioni.findOne({ _id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Non trovata.' });
    const tutte = await db.segnalazioni.find({ imbarcazione_id: b._id });
    const stats = {
      totale: tutte.length,
      aperte: tutte.filter(s => s.stato === 'aperta').length,
      in_lavorazione: tutte.filter(s => s.stato === 'in_lavorazione').length,
      risolte: tutte.filter(s => s.stato === 'risolta').length,
      critiche_aperte: tutte.filter(s => s.gravita === 'critica' && s.stato === 'aperta').length,
    };
    const manutenzioni = await db.manutenzioni.find({ imbarcazione_id: b._id });
    const ultime_segnalazioni = tutte.sort((a, c) => c.created_at.localeCompare(a.created_at)).slice(0, 5);
    res.json({ ...b, stats, manutenzioni, ultime_segnalazioni });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
