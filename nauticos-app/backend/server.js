const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Frontend statico
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// API
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/segnalazioni', require('./routes/segnalazioni'));
app.use('/api/imbarcazioni', require('./routes/imbarcazioni'));
app.use('/api/notifiche',    require('./routes/notifiche'));
app.use('/api/ai',           require('./routes/ai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('\n  🚢  NauticOS avviato!');
  console.log(`  🌐  http://localhost:${PORT}\n`);
});
