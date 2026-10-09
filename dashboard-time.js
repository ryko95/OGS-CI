/* Dates are event dates, never publication dates. No monthly imputation. */
(function(root){
'use strict';
function parseDate(value){
  const text=String(value||'').trim();
  const fr=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if(!fr&&!iso)return null;
  const y=Number(fr?fr[3]:iso[1]),m=Number(fr?fr[2]:iso[2]),d=Number(fr?fr[1]:iso[3]);
  const date=new Date(Date.UTC(y,m-1,d));
  return y>=1900&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?date:null;
}
function monthKey(value){const d=parseDate(value);return d?d.toISOString().slice(0,7):null;}
function monthlySeries(records,year,now=new Date(),startKey=null){
  const counts=new Map();let undated=0,future=0;
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  const currentKey=now.toISOString().slice(0,7);
  records.forEach(p=>{const date=parseDate(p.date_evene);if(!date){undated++;return;}if(date.getTime()>today){future++;return;}const key=monthKey(p.date_evene);counts.set(key,(counts.get(key)||0)+1);});
  const keys=[...counts.keys()].sort();
  const first=year==='all'?(startKey||keys[0]):year+'-01';
  const last=year==='all'?currentKey:(Number(year)===now.getUTCFullYear()?currentKey:year+'-12');
  const months=[];
  if(first&&first<=last&&Number(first.slice(0,4))<=now.getUTCFullYear()){
    let y=Number(first.slice(0,4)),m=Number(first.slice(5));
    while(y+'-'+String(m).padStart(2,'0')<=last){
      const key=y+'-'+String(m).padStart(2,'0');months.push({key,count:counts.get(key)||0});
      if(++m===13){m=1;y++;}
    }
  }
  return {months,undated,future,dated:records.length-undated-future};
}
function monthlyAdditions(records,now=new Date()){
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  return records.filter(p=>{
    const date=parseDate(p.date_ajout);
    return p.validation_par&&date&&date.getTime()<=today&&date.getUTCFullYear()===now.getUTCFullYear()&&date.getUTCMonth()===now.getUTCMonth();
  }).sort((a,b)=>parseDate(b.date_ajout)-parseDate(a.date_ajout));
}
const api={parseDate,monthKey,monthlySeries,monthlyAdditions};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OGSTime=api;
})(typeof window!=='undefined'?window:globalThis);
