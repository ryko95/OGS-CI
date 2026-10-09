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
function monthlySeries(records,year){
  const counts=new Map();let undated=0;
  records.forEach(p=>{const key=monthKey(p.date_evene);if(key)counts.set(key,(counts.get(key)||0)+1);else undated++;});
  const years=[...counts.keys()].map(k=>Number(k.slice(0,4)));
  const first=year==='all'?Math.min(...years):Number(year),last=year==='all'?Math.max(...years):Number(year);
  const months=[];
  if(Number.isFinite(first)&&Number.isFinite(last))for(let y=first;y<=last;y++)for(let m=1;m<=12;m++){
    const key=y+'-'+String(m).padStart(2,'0');months.push({key,count:counts.get(key)||0});
  }
  return {months,undated,dated:records.length-undated};
}
function recentAdditions(records,now=new Date()){
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  return records.filter(p=>{
    const date=parseDate(p.date_ajout),age=date?(today-date.getTime())/86400000:-1;
    return p.validation_par&&date&&age>=0&&age<30;
  }).sort((a,b)=>parseDate(b.date_ajout)-parseDate(a.date_ajout));
}
const api={parseDate,monthKey,monthlySeries,recentAdditions};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OGSTime=api;
})(typeof window!=='undefined'?window:globalThis);
