const assert=require('node:assert/strict');
const {parseDate,monthKey,monthlySeries,recentAdditions}=require('../dashboard-time.js');
assert.equal(monthKey('02/09/2026'),'2026-09');
assert.equal(monthKey('2026-09-02'),'2026-09');
for(const value of ['',null,'2026','31/02/2026','2026-13-01'])assert.equal(parseDate(value),null);
assert.equal(monthKey('29/02/2024'),'2024-02');
const records=[{date_evene:'02/09/2026'},{date_evene:'2026-09-15'},{date_evene:null,date_publi:'03/09/2026'},{date_evene:'01/01/2025'}];
const series=monthlySeries(records,'2026',new Date('2026-10-09T12:00:00Z'));
assert.equal(series.months.length,10);assert.equal(series.months[8].count,2);assert.equal(series.months[0].count,0);assert.equal(series.undated,1);
assert.equal(monthlySeries(records,'all',new Date('2026-10-09T12:00:00Z')).months.length,22);
assert.equal(monthlySeries([],'all').months.length,0);
const now=new Date('2026-10-09T12:00:00Z');
const additions=[{id:1,validation_par:'Dr SREU Eric',date_ajout:'2026-10-09'},{id:2,validation_par:'Dr SREU Eric',date_ajout:'2026-09-10'},{id:3,validation_par:'Dr SREU Eric',date_ajout:'2026-09-09'},{id:4,date_ajout:'2026-10-09'},{id:5,validation_par:'Dr SREU Eric',date_ajout:'2026-10-10'}];
assert.deepEqual(recentAdditions(additions,now).map(p=>p.id),[1,2]);
console.log('PASS: event dates, leap years, empty months, missing dates, year range, validated alerts and 30-day boundary.');

const globalSeries=monthlySeries([{date_evene:'21/05/2014'},{date_evene:'02/09/2026'}],'all',now);
assert.equal(globalSeries.months[0].key,'2014-05');assert.equal(globalSeries.months.at(-1).key,'2026-10');assert.equal(globalSeries.months.length,150);
assert.equal(monthlySeries([{date_evene:'10/10/2026'}],'2026',now).future,1);
