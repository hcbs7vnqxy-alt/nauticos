const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'data');
fs.mkdirSync(dir, { recursive: true });

const db = {
  utenti:       Datastore.create({ filename: path.join(dir, 'utenti.db'),       autoload: true }),
  imbarcazioni: Datastore.create({ filename: path.join(dir, 'imbarcazioni.db'), autoload: true }),
  assoc:        Datastore.create({ filename: path.join(dir, 'assoc.db'),        autoload: true }),
  segnalazioni: Datastore.create({ filename: path.join(dir, 'segnalazioni.db'), autoload: true }),
  commenti:     Datastore.create({ filename: path.join(dir, 'commenti.db'),     autoload: true }),
  notifiche:    Datastore.create({ filename: path.join(dir, 'notifiche.db'),    autoload: true }),
  manutenzioni: Datastore.create({ filename: path.join(dir, 'manutenzioni.db'), autoload: true }),
  ai_conv:      Datastore.create({ filename: path.join(dir, 'ai_conv.db'),      autoload: true }),
};

module.exports = db;
