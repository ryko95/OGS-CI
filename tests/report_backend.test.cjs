const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function backend() {
  const mail = [];
  const values = new Map();
  const cache = {get: key => values.get(key), put: (key, val) => values.set(key, val)};
  const context = {
    MailApp: {getRemainingDailyQuota: () => 100, sendEmail: msg => mail.push(msg)},
    CacheService: {getScriptCache: () => cache},
    LockService: {getScriptLock: () => ({tryLock: () => true, releaseLock: () => {}})},
    HtmlService: {XFrameOptionsMode: {ALLOWALL: 'ALLOWALL'}, createHtmlOutput: html => ({html, setXFrameOptionsMode() {return this;}})},
    console, Date, String, Number, JSON
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../backend/apps-script/Code.gs'), 'utf8'), context);
  return {post: context.doPost, mail};
}

test('un signalement valide envoie un e-mail une fois et reste distinct de la carte', () => {
  const {post, mail} = backend();
  const parameter = {id: 'OGS-123456789abc', date: '2026-09-25', region: 'Gbêkê', commune: 'Bouaké', situation: 'TEST sans personne réelle'};
  const first = post({parameter});
  const second = post({parameter});
  assert.match(first.html, /"ok":true/);
  assert.match(second.html, /Déjà reçu/);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].to, 'sreueric@gmail.com');
  assert.match(mail[0].body, /NON VÉRIFIÉ/);
});

test('un signalement incomplet ne déclenche pas de message', () => {
  const {post, mail} = backend();
  const result = post({parameter: {id: 'OGS-123456789abc', date: '2026-09-25', region: 'Gbêkê'}});
  assert.match(result.html, /"ok":false/);
  assert.equal(mail.length, 0);
});
