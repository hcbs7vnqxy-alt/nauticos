const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { imbarcazione_id, stato, gravita, search } = req.query;
    let query = {};
    if (req.user.ruolo === 'equipaggio') {
      const assoc = await db.assoc.find({ utente_id: req.user.id });
      query.imbarcazione_id = { $in: assoc.map(a => a.imbarcazione_id) };
    }
    if (imbarcazione_id) query.imbarcazione_id = imbarcazione_id;
    if (stato)   query.stato   = stato;
    if (gravita) query.gravita = gravita;

    let rows = await db.segnalazioni.find(query).sort({ created_at: -1 });
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(s => [s.titolo, s.apparato, s.codice, s.descrizione].some(f => (f||'').toLowerCase().includes(q)));
    }
    const enriched = await Promise.all(rows.map(async s => {
      const b = await db.imbarcazioni.findOne({ _id: s.imbarcazione_id });
      return { ...s, matricola: b?.matricola, imbarcazione_modello: b?.modello };
    }));
    res.json({ segnalazioni: enriched, total: enriched.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const s = await db.segnalazioni.findOne({ _id: req.params.id });
    if (!s) return res.status(404).json({ error: 'Non trovata.' });
    const b = await db.imbarcazioni.findOne({ _id: s.imbarcazione_id });
    const commenti = await db.commenti.find({ segnalazione_id: s._id }).sort({ created_at: 1 });
    const simili = (await db.segnalazioni.find({ apparato: s.apparato, stato: 'risolta' })).slice(0, 3);
    res.json({ ...s, matricola: b?.matricola, commenti, simili });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { imbarcazione_id, apparato, posizione, gravita, titolo, descrizione } = req.body;
    if (!imbarcazione_id || !apparato || !gravita || !titolo) return res.status(400).json({ error: 'Campi mancanti.' });
    const anno = new Date().getFullYear();
    const num  = String(Math.floor(Math.random() * 900) + 100);
    const now  = new Date().toISOString();
    const nuova = await db.segnalazioni.insert({
      imbarcazione_id, autore_id: req.user.id,
      codice: `#${anno}-${num}`, apparato, posizione: posizione||null,
      gravita, stato: 'aperta', titolo, descrizione: descrizione||null,
      soluzione: null, tecnico_id: null, ore_risoluzione: null,
      created_at: now, updated_at: now, resolved_at: null
    });
    const tecnici = await db.utenti.find({ ruolo: 'tecnico' });
    for (const t of tecnici) {
      await db.notifiche.insert({ utente_id: t._id, titolo: `Nuova segnalazione: ${titolo}`, descrizione: `${nuova.codice} · ${apparato}`, tipo: 'allarme', gravita, letta: false, link_id: nuova._id, created_at: now });
    }
    res.status(201).json(nuova);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const s = await db.segnalazioni.findOne({ _id: req.params.id });
    if (!s) return res.status(404).json({ error: 'Non trovata.' });
    const { stato, soluzione, tecnico_id, ore_risoluzione } = req.body;
    const now = new Date().toISOString();
    const upd = { updated_at: now };
    if (stato)           { upd.stato = stato; if (stato === 'risolta') upd.resolved_at = now; }
    if (soluzione)       upd.soluzione = soluzione;
    if (tecnico_id)      upd.tecnico_id = tecnico_id;
    if (ore_risoluzione) upd.ore_risoluzione = ore_risoluzione;
    await db.segnalazioni.update({ _id: req.params.id }, { $set: upd });
    res.json(await db.segnalazioni.findOne({ _id: req.params.id }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/commenti', async (req, res) => {
  try {
    const { testo } = req.body;
    if (!testo) return res.status(400).json({ error: 'Testo mancante.' });
    const c = await db.commenti.insert({ segnalazione_id: req.params.id, autore_id: req.user.id, testo, tipo: 'commento', created_at: new Date().toISOString() });
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
