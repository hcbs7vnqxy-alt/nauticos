const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');
const SECRET = process.env.JWT_SECRET || 'nauticos-secret-2024';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e password obbligatori.' });

    const u = await db.utenti.findOne({ email: email.toLowerCase().trim() });
    if (!u || !bcrypt.compareSync(password, u.password))
      return res.status(401).json({ error: 'Credenziali non valide.' });

    const token = jwt.sign(
      { id: u._id, email: u.email, ruolo: u.ruolo, nome: u.nome, cognome: u.cognome },
      SECRET, { expiresIn: '7d' }
    );

    const assocList = await db.assoc.find({ utente_id: u._id });
    const imbarcazioni = [];
    for (const a of assocList) {
      const b = await db.imbarcazioni.findOne({ _id: a.imbarcazione_id });
      if (b) imbarcazioni.push({ ...b, ruolo_bordo: a.ruolo_bordo });
    }

    console.log(`Login: ${u.email} | Barche trovate: ${imbarcazioni.length}`);

    res.json({
      token,
      utente: { id: u._id, nome: u.nome, cognome: u.cognome, email: u.email, ruolo: u.ruolo },
      imbarcazioni
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { nome, cognome, email, password, ruolo = 'equipaggio' } = req.body;
    if (!nome || !cognome || !email || !password) return res.status(400).json({ error: 'Campi mancanti.' });
    if (await db.utenti.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email già usata.' });
    const u = await db.utenti.insert({ nome, cognome, email: email.toLowerCase(), password: bcrypt.hashSync(password, 10), ruolo, created_at: new Date().toISOString() });
    res.status(201).json({ id: u._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const u = await db.utenti.findOne({ _id: req.user.id });
    if (!u) return res.status(404).json({ error: 'Non trovato.' });
    const assocList = await db.assoc.find({ utente_id: u._id });
    const imbarcazioni = [];
    for (const a of assocList) {
      const b = await db.imbarcazioni.findOne({ _id: a.imbarcazione_id });
      if (b) imbarcazioni.push({ ...b, ruolo_bordo: a.ruolo_bordo });
    }
    res.json({ utente: { id: u._id, nome: u.nome, cognome: u.cognome, email: u.email, ruolo: u.ruolo }, imbarcazioni });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
