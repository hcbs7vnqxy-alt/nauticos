const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Pulizia...');
  for (const col of Object.values(db)) await col.remove({}, { multi: true });

  const hash = bcrypt.hashSync('password123', 10);
  const now  = new Date().toISOString();

  console.log('Utenti...');
  const u1 = await db.utenti.insert({ nome:'Luca',  cognome:'Ferraro',  email:'comandante@nauticos.app', password:hash, ruolo:'equipaggio', created_at:now });
  const u2 = await db.utenti.insert({ nome:'Marco', cognome:'Rossi',    email:'tecnico@nauticos.app',    password:hash, ruolo:'tecnico',    created_at:now });
  const u3 = await db.utenti.insert({ nome:'Admin', cognome:'NauticOS', email:'admin@nauticos.app',      password:hash, ruolo:'admin',      created_at:now });

  console.log('Imbarcazioni...');
  const b1 = await db.imbarcazioni.insert({ matricola:'FG-2022-04871', modello:'Riva 110 Dolceriva',  anno:2022, cantiere:'Ferretti Group', stato:'attiva', created_at:now });
  const b2 = await db.imbarcazioni.insert({ matricola:'FG-2021-04203', modello:'Ferretti Yachts 780', anno:2021, cantiere:'Ferretti Group', stato:'attiva', created_at:now });

  console.log('Associazioni...');
  await db.assoc.insert({ utente_id:u1._id, imbarcazione_id:b1._id, ruolo_bordo:'comandante' });
  await db.assoc.insert({ utente_id:u2._id, imbarcazione_id:b1._id, ruolo_bordo:'tecnico' });

  console.log('Segnalazioni...');
  const s1 = await db.segnalazioni.insert({ imbarcazione_id:b1._id, autore_id:u1._id, codice:'#2024-092', apparato:'Impianto antincendio', posizione:'Ponte prodiero', gravita:'critica', stato:'aperta', titolo:'Allarme persistente zona prodiera', descrizione:'Allarme ogni 30s sul Kidde-15.', soluzione:null, created_at:'2025-06-07T08:14:00.000Z', updated_at:'2025-06-07T08:14:00.000Z', resolved_at:null });
  const s2 = await db.segnalazioni.insert({ imbarcazione_id:b1._id, autore_id:u1._id, codice:'#2024-087', apparato:'Navigazione GPS',      posizione:'Plancia',        gravita:'moderata', stato:'in_lavorazione', titolo:'GPS intermittente Garmin MFD', descrizione:'Segnale perso ogni ora.', soluzione:null, created_at:'2025-05-29T14:30:00.000Z', updated_at:'2025-06-06T16:32:00.000Z', resolved_at:null });
  const s3 = await db.segnalazioni.insert({ imbarcazione_id:b1._id, autore_id:u1._id, codice:'#2024-079', apparato:'Condizionamento',       posizione:'Cabina armatore', gravita:'moderata', stato:'risolta',        titolo:'Compressore non raffredda',   descrizione:'Temp non raggiunta.', soluzione:'Valvola espansione sostituita. Gas R410a ricaricato.', created_at:'2025-04-10T09:00:00.000Z', updated_at:'2025-04-12T15:00:00.000Z', resolved_at:'2025-04-12T15:00:00.000Z' });
  const s4 = await db.segnalazioni.insert({ imbarcazione_id:b1._id, autore_id:u1._id, codice:'#2024-061', apparato:'Motore SX',             posizione:'Locale macchine', gravita:'critica',  stato:'risolta',        titolo:'Perdita olio tenuta albero',  descrizione:'Macchia olio rilevata.', soluzione:'Paraolio sostituito. Garanzia.', created_at:'2025-01-03T11:00:00.000Z', updated_at:'2025-01-03T15:00:00.000Z', resolved_at:'2025-01-03T15:00:00.000Z' });

  console.log('Manutenzioni...');
  await db.manutenzioni.insert({ imbarcazione_id:b1._id, tipo:'Tagliando motori 500h', descrizione:'Cambio olio, filtri, cinghie', scadenza_data:'2025-07-15', scadenza_ore:500, ore_attuali:455, stato:'programmata', created_at:now });
  await db.manutenzioni.insert({ imbarcazione_id:b1._id, tipo:'Ispezione carena',      descrizione:'Carena, anodi zinco, elica',  scadenza_data:'2025-09-01', scadenza_ore:null, ore_attuali:null, stato:'programmata', created_at:now });

  console.log('Notifiche...');
  await db.notifiche.insert({ utente_id:u1._id, titolo:'Allarme critico — Antincendio', descrizione:'Zona prodiera · Kidde-15', tipo:'allarme', gravita:'critica', letta:false, link_id:s1._id, created_at:'2025-06-07T08:14:00.000Z' });
  await db.notifiche.insert({ utente_id:u1._id, titolo:'Pressione olio motore SX',      descrizione:'Sotto soglia minima',        tipo:'allarme', gravita:'moderata', letta:false, link_id:null, created_at:'2025-06-06T19:32:00.000Z' });
  await db.notifiche.insert({ utente_id:u1._id, titolo:'Risposta cantiere — #2024-087', descrizione:'Tecnico GPS disponibile domani', tipo:'risposta', gravita:'info', letta:false, link_id:s2._id, created_at:'2025-06-06T16:32:00.000Z' });
  await db.notifiche.insert({ utente_id:u1._id, titolo:'Firmware v3.2.1 disponibile',   descrizione:'Garmin Chartplotter',        tipo:'aggiornamento', gravita:'info', letta:false, link_id:null, created_at:'2025-06-05T11:04:00.000Z' });
  await db.notifiche.insert({ utente_id:u1._id, titolo:'Ticket #2024-079 chiuso',       descrizione:'Condizionamento risolto',    tipo:'sistema', gravita:'successo', letta:true, link_id:s3._id, created_at:'2025-04-12T15:00:00.000Z' });

  console.log('\n✅ Fatto!\n');
  console.log('   comandante@nauticos.app  /  password123');
  console.log('   tecnico@nauticos.app     /  password123');
  console.log('   admin@nauticos.app       /  password123\n');
}

seed().catch(e => { console.error(e); process.exit(1); });
