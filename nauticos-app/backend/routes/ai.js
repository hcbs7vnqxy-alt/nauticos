const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

const risposte = [
  { kw: ['generatore','non parte','avviamento'], testo: `Per problemi di avviamento generatore verifica:\n\n1. Livello carburante serbatoio dedicato\n2. Interruttore principale (locale macchine)\n3. Filtro carburante — da sostituire ogni 250h\n4. Batteria avviamento (min 12.4V)\n5. Termostato di sicurezza — si blocca per surriscaldamento` },
  { kw: ['antincendio','kidde','reset allarme','sensore fumo'], testo: `Procedura reset Kidde-15:\n\n1. Accedi al pannello zona interessata\n2. Tieni premuto ACK/RESET per 5 secondi\n3. LED verde = ok | LED rosso fisso = guasto hardware\n4. Se rosso persiste → sensore FS-09 da sostituire\n\n⚠️ Non disabilitare il sistema se l'allarme persiste.` },
  { kw: ['condizionamento','webasto','non raffredda'], testo: `Diagnostica condizionamento Webasto:\n\n1. Filtro aria — pulire ogni 50h\n2. Valvola di espansione termostabile\n3. Pressione gas refrigerante R410a\n4. Pompa seawater` },
  { kw: ['gps','garmin','chartplotter','segnale'], testo: `Troubleshooting GPS Garmin:\n\n1. Verifica antenna esterna (connessione)\n2. Riavvio chartplotter (power 10 secondi)\n3. Firmware v3.2.1 disponibile — aggiorna\n4. Verifica interferenze radar/VHF` },
  { kw: ['motore','olio','pressione'], testo: `Pressione olio Volvo IPS:\n\n1. ⚠️ Spegni se pressione < 1.5 bar\n2. Controlla livello con astina (motore freddo)\n3. Verifica perdite nel locale macchine\n4. Controlla sensore (falsi allarmi noti)` },
  { kw: ['manutenzione','tagliando','scadenza'], testo: `Piano manutenzione Ferretti Group:\n\n• 50h   → Filtro aria condizionamento\n• 250h  → Filtro carburante\n• 500h  → Tagliando motori completo\n• Annuale → Carena, anodi, certificati` },
];

router.post('/chat', async (req, res) => {
  try {
    const { messaggio, imbarcazione_id } = req.body;
    if (!messaggio) return res.status(400).json({ error: 'Messaggio mancante.' });
    const lower = messaggio.toLowerCase();
    let risposta = risposte.find(r => r.kw.some(k => lower.includes(k)));
    const testo = risposta ? risposta.testo : `Non ho trovato una risposta specifica per "${messaggio}".\n\nProva ad aprire una segnalazione dalla sezione Guasti o contatta il referente cantiere.`;
    await db.ai_conv.insert({ utente_id: req.user.id, messaggio, risposta: testo, created_at: new Date().toISOString() });
    res.json({ risposta: testo });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/storico', async (req, res) => {
  try {
    const rows = await db.ai_conv.find({ utente_id: req.user.id }).sort({ created_at: -1 });
    res.json(rows.slice(0, 20).reverse());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
