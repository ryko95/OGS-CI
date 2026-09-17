(function(){
'use strict';
const regionFeatures=features_REGIONSANITAIRE_1, caseFeatures=features_LIEUDESUICIDE_2;
const originalRegionStyle=style_REGIONSANITAIRE_1, originalCaseStyle=style_LIEUDESUICIDE_2;
let currentCases=[...caseFeatures], currentRegions=[...regionFeatures], selectedTheme='', themeMode='auto', activeTab='region', pickMode=false;
const $=id=>document.getElementById(id);
const trimKey=k=>String(k||'').trim();
function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/D\.A\.?\s*/g,'').replace(/[^A-Z0-9]+/g,' ').trim();}
function regionName(f){return f.get('REG_2012')||f.get(' REGION')||f.get('REGION')||'';}
function caseRegion(f){return f.get('REGION')||f.get('regions')||'';}
function regionKey(v){let n=norm(v); const aliases={'AGNEBY TIASSA':'AGNEBY TIASSA','SUD COMOE':'SUD COMOE','ABIDJAN':'ABIDJAN','YAMOUSSOUKRO':'YAMOUSSOUKRO'};return aliases[n]||n;}
function isNumericValue(v){if(v===null||v===undefined||v==='')return false;return !isNaN(Number(String(v).replace(',','.')));}
function num(v){const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0;}
function allKeys(features){const s=new Set();features.forEach(f=>Object.keys(f.getProperties()).filter(k=>k!=='geometry').forEach(k=>s.add(k)));return [...s];}
const regionKeys=allKeys(regionFeatures), caseKeys=allKeys(caseFeatures);
function labelKey(k){const labels={'REG_2012':'Région sanitaire','NBRE CAS':'Présence de cas','HOMME':'Nombre d’hommes','FEMME':'Nombre de femmes','URBAIN':'Cas urbains','RURAL':'Cas ruraux','CONFIRME':'Cas confirmés','RAPPORTE':'Cas rapportés',' PRESUME':'Cas présumés','NIV PREUVE':'Niveau de preuve','id_eveneme':'Identifiant','date_evene':'Date événement','annee':'Année','localite':'Localité','REGION':'Région','district':'District','type_milie':'Type de milieu','categorie_':'Type de lieu','sexe':'Sexe','age':'Âge','categori_1':'Tranche d’âge','statut_pro':'Statut professionnel','contexte_p':'Contexte','methode_ge':'Méthode','statut_con':'Statut de confirmation','niveau_pre':'Niveau de preuve','source_pri':'Source principale','source_typ':'Type de source','date_publi':'Date publication'};return labels[k]||trimKey(k).replaceAll('_',' ');}
function fillSelect(el,keys,blank){el.innerHTML=(blank?'<option value="">— Aucun filtre —</option>':'')+keys.map(k=>`<option value="${esc(k)}">${esc(labelKey(k))}</option>`).join('');}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
fillSelect($('themeField'),regionKeys,false); $('themeField').insertAdjacentHTML('afterbegin','<option value="">Aucune coloration thématique</option><option value="__cases__">Cas documentés (calculés depuis les points)</option>');
fillSelect($('qRegionField'),regionKeys,true);fillSelect($('qCaseField'),caseKeys,true);
const ops=[['eq','Égal à'],['contains','Contient'],['neq','Différent de'],['gt','Supérieur à'],['gte','Supérieur ou égal'],['lt','Inférieur à'],['lte','Inférieur ou égal'],['empty','Est vide'],['notempty','N’est pas vide']];
['qRegionOp','qCaseOp'].forEach(id=>$(id).innerHTML=ops.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join(''));
function uniqueVals(features,key){return [...new Set(features.map(f=>f.get(key)).filter(v=>v!==null&&v!==undefined&&String(v).trim()!==''))].sort((a,b)=>String(a).localeCompare(String(b),'fr',{numeric:true}));}
function updateDatalist(fieldId,listId,features){const k=$(fieldId).value;$(listId).innerHTML=k?uniqueVals(features,k).slice(0,300).map(v=>`<option value="${esc(v)}"></option>`).join(''):'';}
$('qRegionField').onchange=()=>updateDatalist('qRegionField','qRegionValues',regionFeatures);$('qCaseField').onchange=()=>updateDatalist('qCaseField','qCaseValues',caseFeatures);
function detectMode(key){if(key==='__cases__')return'numeric';const vals=regionFeatures.map(f=>f.get(key)).filter(v=>v!==null&&v!==undefined&&v!=='');return vals.length&&vals.filter(isNumericValue).length/vals.length>.75?'numeric':'nominal';}
const hot=['#fff3b0','#ffd166','#f8961e','#f3722c','#d00000','#9d0208','#6a040f'];const cool=['#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#38bdf8','#0ea5e9','#0284c7','#0369a1','#075985','#0f766e','#14b8a6','#22d3ee'];
function themeValue(f,key){if(key==='__cases__'){const rk=regionKey(regionName(f));return caseFeatures.filter(c=>regionKey(caseRegion(c))===rk).length;}return f.get(key);}
function quantBreaks(values,n){const a=values.map(num).sort((x,y)=>x-y), out=[];if(!a.length)return[];for(let i=0;i<=n;i++){const pos=(a.length-1)*i/n, lo=Math.floor(pos), hi=Math.ceil(pos), v=lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(pos-lo);out.push(v);}return out;}
function thematicStyle(feature){if(currentRegions.indexOf(feature)<0)return null;if(!selectedTheme)return originalRegionStyle(feature,map.getView().getResolution());const mode=themeMode==='auto'?detectMode(selectedTheme):themeMode;const v=themeValue(feature,selectedTheme);if(v===null||v===undefined||v==='')return new ol.style.Style({fill:new ol.style.Fill({color:'rgba(230,234,239,.55)'}),stroke:new ol.style.Stroke({color:'#64748b',width:1})});let color='#ccc';if(mode==='numeric'){const vals=currentRegions.map(f=>themeValue(f,selectedTheme)).filter(isNumericValue).map(num);const n=Math.max(3,Math.min(7,Number($('themeClasses').value)||5));const br=quantBreaks(vals,n);let idx=n-1;for(let i=0;i<n;i++){if(num(v)<=br[i+1]){idx=i;break;}}color=hot[Math.round(idx*(hot.length-1)/(n-1))];}else{const vals=uniqueVals(currentRegions,selectedTheme);let idx=vals.findIndex(x=>String(x)===String(v));if(idx<0)idx=0;color=cool[idx%cool.length];}return new ol.style.Style({fill:new ol.style.Fill({color:hexAlpha(color,.72)}),stroke:new ol.style.Stroke({color:'#334155',width:1.1}),text:new ol.style.Text({text:String(regionName(feature)),font:'600 10px Segoe UI',fill:new ol.style.Fill({color:'#172033'}),stroke:new ol.style.Stroke({color:'#fff',width:3}),overflow:true})});}
function hexAlpha(hex,a){let h=hex.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`;}
lyr_REGIONSANITAIRE_1.setStyle(thematicStyle);
const caseBaseStyle=new ol.style.Style({image:new ol.style.Circle({radius:6,fill:new ol.style.Fill({color:'#b91c1c'}),stroke:new ol.style.Stroke({color:'#fff',width:2})})});
lyr_LIEUDESUICIDE_2.setStyle(f=>currentCases.indexOf(f)>=0?caseBaseStyle:null);
function updateLegend(){const box=$('themeLegend');if(!selectedTheme){box.innerHTML='';return;}const mode=themeMode==='auto'?detectMode(selectedTheme):themeMode;if(mode==='numeric'){const vals=currentRegions.map(f=>themeValue(f,selectedTheme)).filter(isNumericValue).map(num),n=Math.max(3,Math.min(7,Number($('themeClasses').value)||5)),br=quantBreaks(vals,n);box.innerHTML=`<div class="legend">${Array.from({length:n},(_,i)=>`<span class="sw" style="background:${hot[Math.round(i*(hot.length-1)/(n-1))]}"></span>`).join('')}</div><div class="legend-labels"><span>${br.length?br[0].toFixed(0):0}</span><span>${br.length?br[br.length-1].toFixed(0):0}</span></div>`;}else{const vals=uniqueVals(currentRegions,selectedTheme);box.innerHTML=vals.slice(0,10).map((v,i)=>`<div style="font-size:10px;margin:3px 0"><span style="display:inline-block;width:11px;height:11px;background:${cool[i%cool.length]};border-radius:2px;margin-right:5px"></span>${esc(v)}</div>`).join('')+(vals.length>10?`<div class="muted">+ ${vals.length-10} autres catégories</div>`:'');}}
function refreshTheme(){selectedTheme=$('themeField').value;themeMode=$('themeMode').value;lyr_REGIONSANITAIRE_1.changed();updateLegend();}
$('themeField').onchange=refreshTheme;$('themeMode').onchange=refreshTheme;$('themeClasses').onchange=refreshTheme;
function test(f,k,op,want){if(!k)return true;const raw=f.get(k), a=String(raw??'').trim(), b=String(want??'').trim();if(op==='empty')return !a;if(op==='notempty')return !!a;if(op==='contains')return norm(a).includes(norm(b));if(op==='eq')return norm(a)===norm(b);if(op==='neq')return norm(a)!==norm(b);const na=num(a),nb=num(b);if(op==='gt')return na>nb;if(op==='gte')return na>=nb;if(op==='lt')return na<nb;if(op==='lte')return na<=nb;return true;}
function runQuery(){let rf=$('qRegionField').value, ro=$('qRegionOp').value, rv=$('qRegionValue').value, cf=$('qCaseField').value, co=$('qCaseOp').value, cv=$('qCaseValue').value;let regs=regionFeatures.filter(f=>test(f,rf,ro,rv)), cases=caseFeatures.filter(f=>test(f,cf,co,cv));if($('linkQueries').checked){if(rf){const keys=new Set(regs.map(f=>regionKey(regionName(f))));cases=cases.filter(f=>keys.has(regionKey(caseRegion(f))));}if(cf){const keys=new Set(cases.map(f=>regionKey(caseRegion(f))));regs=regs.filter(f=>keys.has(regionKey(regionName(f))));}}currentRegions=regs;currentCases=cases;lyr_REGIONSANITAIRE_1.changed();lyr_LIEUDESUICIDE_2.changed();syncHeat();updateAll();$('queryInfo').textContent=`${regs.length} région(s) et ${cases.length} cas correspondent aux critères.`;}
$('runQuery').onclick=runQuery;$('resetQuery').onclick=()=>{['qRegionField','qCaseField'].forEach(id=>$(id).value='');['qRegionValue','qCaseValue'].forEach(id=>$(id).value='');currentRegions=[...regionFeatures];currentCases=[...caseFeatures];lyr_REGIONSANITAIRE_1.changed();lyr_LIEUDESUICIDE_2.changed();syncHeat();updateAll();$('queryInfo').textContent='Aucun filtre actif.';};
function fitFeatures(fs){if(!fs.length)return;const e=ol.extent.createEmpty();fs.forEach(f=>ol.extent.extend(e,f.getGeometry().getExtent()));map.getView().fit(e,{padding:[40,40,40,40],maxZoom:12,duration:400});}
$('zoomQuery').onclick=()=>fitFeatures(currentCases.length?currentCases:currentRegions);$('btnHome').onclick=()=>map.getView().fit(jsonSource_REGIONSANITAIRE_1.getExtent(),{padding:[20,20,20,20],duration:400});
function countsBy(key,features=currentCases){const m=new Map();features.forEach(f=>{let v=f.get(key);if(v===null||v===undefined||String(v).trim()==='')v='Non précisé';const s=String(v).trim();m.set(s,(m.get(s)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1]);}
function updateKPIs(){const regs=new Set(currentCases.map(f=>regionKey(caseRegion(f))).filter(Boolean));$('kpiCases').textContent=currentCases.length;$('kpiRegions').textContent=regs.size;$('kpiMale').textContent=currentCases.filter(f=>norm(f.get('sexe'))==='M').length;$('kpiFemale').textContent=currentCases.filter(f=>norm(f.get('sexe'))==='F').length;}
function renderChart(){let data,title;if(activeTab==='region'){data=countsBy('REGION');title='Cas documentés par région';}else if(activeTab==='sex'){data=countsBy('sexe');title='Répartition par sexe';}else if(activeTab==='place'){data=countsBy('categorie_');title='Types de lieux';}else{data=countsBy('methode_ge');title='Méthodes documentées';}const max=Math.max(1,...data.map(d=>d[1]));$('chart').innerHTML=`<h3>${title}</h3><div class="chart">${data.slice(0,16).map(([k,v])=>`<div class="barrow" title="${esc(k)}: ${v}"><div class="barlabel">${esc(k)}</div><div class="bartrack"><div class="bar ${activeTab==='place'?'cool':''}" style="width:${100*v/max}%"></div></div><b>${v}</b></div>`).join('')}</div>`;}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeTab=b.dataset.tab;renderChart();});
function renderResults(){$('resultBody').innerHTML=currentCases.slice(0,150).map(f=>`<tr data-id="${esc(f.get('id_eveneme'))}"><td>${esc(f.get('localite')||'—')}</td><td>${esc(f.get('REGION')||'—')}</td><td>${esc(f.get('sexe')||'—')}</td><td>${esc(f.get('date_evene')||f.get('annee')||'—')}</td></tr>`).join('');document.querySelectorAll('#resultBody tr').forEach(tr=>tr.onclick=()=>{const f=caseFeatures.find(x=>String(x.get('id_eveneme'))===tr.dataset.id);if(f){fitFeatures([f]);showCasePopup(f);}});}
function updateAll(){updateKPIs();renderChart();renderResults();updateLegend();}
let heatSource=new ol.source.Vector(), heatLayer=new ol.layer.Heatmap({source:heatSource,blur:18,radius:24,weight:()=>1,visible:false});map.addLayer(heatLayer);
function syncHeat(){heatSource.clear();heatSource.addFeatures(currentCases.map(f=>f.clone()));}
$('heatToggle').onchange=e=>heatLayer.setVisible(e.target.checked);$('btnHeat').onclick=()=>{$('heatToggle').checked=!$('heatToggle').checked;heatLayer.setVisible($('heatToggle').checked)};$('heatRadius').oninput=e=>heatLayer.setRadius(Number(e.target.value));$('heatBlur').oninput=e=>heatLayer.setBlur(Number(e.target.value));$('careToggle').onchange=e=>lyr_SERVICESDESOINSPUBLICS_3.setVisible(e.target.checked);
function popupValue(v){return (v===null||v===undefined||String(v).trim()==='')?'Non renseigné':String(v).trim();}
function popupRows(rows){return rows.filter(r=>r[1]!==null&&r[1]!==undefined&&String(r[1]).trim()!=='').map(r=>`<div class="popup-row"><div class="popup-label">${esc(r[0])}</div><div class="popup-value">${esc(popupValue(r[1]))}</div></div>`).join('');}
function popupCard(type,icon,title,subtitle,rows,extra=''){content.innerHTML=`<div class="popup-card ${type}"><div class="popup-head"><div class="popup-icon">${icon}</div><div><div class="popup-title">${esc(title)}</div>${subtitle?`<div class="popup-subtitle">${esc(subtitle)}</div>`:''}</div></div><div class="popup-body">${popupRows(rows)}${extra}</div></div>`;container.style.display='block';}
function sourceLink(p){let u='';if(p.url_source&&p.source_sec){u=String(p.url_source)+String(p.source_sec);}else{u=String(p.url_source||p.source_sec||'');}if(!/^https?:\/\//i.test(u))return '';return `<div class="popup-actions"><a class="popup-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">↗ Consulter la source</a></div>`;}
function showCasePopup(f){const p=f.getProperties();const sexe=norm(p.sexe)==='M'?'Masculin':norm(p.sexe)==='F'?'Féminin':p.sexe;const rows=[['Identifiant du cas',p.id_eveneme],['Date de l’événement',p.date_evene],['Date du décès',p.date_deces],['Année',p.annee],['Localité',p.localite],['Région',p.REGION||p.regions],['District',p.district],['Type de milieu',p.type_milie],['Type de lieu',p.categorie_],['Sexe',sexe],['Âge',p.age],['Tranche d’âge',p.categori_1],['Statut professionnel',p.statut_pro],['Contexte / circonstances',p.contexte_p],['Méthode documentée',p.methode_ge],['Statut de confirmation',p.statut_con],['Niveau de preuve',p.niveau_pre],['Nombre de cas',p.nombre_cas],['Source principale',p.source_pri],['Type de source',p.source_typ],['Date de publication',p.date_publi]];popupCard('popup-case','●','Cas de suicide documenté',p.localite||p.REGION||'',rows,sourceLink(p));overlayPopup.setPosition(f.getGeometry().getCoordinates());}
function showRegionPopup(f){const p=f.getProperties();const total=p['TYPE SOURC'];const rows=[['Région sanitaire',p.REG_2012],['Région administrative',p[' REGION']],['District',p[' DISTRICT']],['Nombre total de cas documentés',total],['Hommes',p.HOMME],['Femmes',p.FEMME],['Cas en milieu urbain',p.URBAIN],['Cas en milieu rural',p.RURAL],['Cas confirmés',p.CONFIRME],['Cas rapportés',p.RAPPORTE],['Cas présumés',p[' PRESUME']]];if(selectedTheme){rows.push([`Variable cartographiée : ${selectedTheme==='__cases__'?'Cas documentés':labelKey(selectedTheme)}`,themeValue(f,selectedTheme)]);}popupCard('popup-region','▰','Région sanitaire',p.REG_2012||'',rows);overlayPopup.setPosition(ol.extent.getCenter(f.getGeometry().getExtent()));}
function showCarePopup(f){const p=f.getProperties();const rows=[['Nom du service',p.NOM],['Identifiant',p.ET_ID],['Personnel IDES / SFS',p.IDES_SFS],['Nombre de psychiatres',p.PSYCHIATRE]];popupCard('popup-care','✚','Service de soins publics',p.NOM||'',rows);overlayPopup.setPosition(f.getGeometry().getCoordinates());}
function showReportPopup(f){const p=f.getProperties();const rows=[['Référence',p.id],['Date de la situation',p.date],['Région',p.region],['Commune',p.commune],['Quartier / localité',p.quartier],['Sexe',p.sexe],['Âge / tranche d’âge',p.age],['Type de milieu',p.milieu],['Statut du signalement',p.statut],['Informations utiles',p.situation]];popupCard('popup-report','!','Signalement utilisateur','Non validé — à vérifier',rows,'<div class="popup-warning">Ce signalement n’est pas encore intégré à la base officielle.</div>');overlayPopup.setPosition(f.getGeometry().getCoordinates());}
map.on('singleclick',evt=>{if(pickMode){const ll=ol.proj.toLonLat(evt.coordinate);$('reportLon').value=ll[0].toFixed(6);$('reportLat').value=ll[1].toFixed(6);pickMode=false;$('reportModal').classList.add('open');map.getTargetElement().style.cursor='';return;}let hitCase=null,hitCare=null,hitRegion=null,hitReport=null;map.forEachFeatureAtPixel(evt.pixel,(f,l)=>{if(l===lyr_LIEUDESUICIDE_2&&currentCases.indexOf(f)>=0)hitCase=f;else if(l===lyr_SERVICESDESOINSPUBLICS_3)hitCare=f;else if(l===lyr_REGIONSANITAIRE_1&&currentRegions.indexOf(f)>=0)hitRegion=f;else if(typeof reportLayer!=='undefined'&&l===reportLayer)hitReport=f;});if(hitCase)showCasePopup(hitCase);else if(hitCare)showCarePopup(hitCare);else if(hitReport)showReportPopup(hitReport);else if(hitRegion)showRegionPopup(hitRegion);});
// Reports stored locally in prototype
const reportSource=new ol.source.Vector();const reportLayer=new ol.layer.Vector({source:reportSource,style:new ol.style.Style({image:new ol.style.Circle({radius:7,fill:new ol.style.Fill({color:'#7c3aed'}),stroke:new ol.style.Stroke({color:'#fff',width:2})})})});reportLayer.set('title','Signalements utilisateurs (non validés)');map.addLayer(reportLayer);
function loadReports(){reportSource.clear();let arr=[];try{arr=JSON.parse(localStorage.getItem('ogsuicide_reports')||'[]')}catch(e){}arr.forEach(r=>{if(Number.isFinite(+r.lon)&&Number.isFinite(+r.lat)){const f=new ol.Feature({geometry:new ol.geom.Point(ol.proj.fromLonLat([+r.lon,+r.lat])),...r,_report:true});reportSource.addFeature(f);}});}
function reportRegions(){const vals=[...new Set(regionFeatures.map(f=>regionName(f)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));$('reportRegion').innerHTML='<option value="">Sélectionner...</option>'+vals.map(v=>`<option>${esc(v)}</option>`).join('');}
reportRegions();loadReports();$('btnReport').onclick=()=> $('reportModal').classList.add('open');$('closeReport').onclick=()=> $('reportModal').classList.remove('open');$('reportModal').onclick=e=>{if(e.target===$('reportModal'))$('reportModal').classList.remove('open')};$('pickLocation').onclick=()=>{pickMode=true;$('reportModal').classList.remove('open');map.getTargetElement().style.cursor='crosshair';alert('Cliquez sur la carte à l’emplacement du signalement.');};
const REPORT_WHATSAPP='2250747460104';
const REPORT_EMAIL='sreueric@gmail.com';
function prepareReport(){
  const form=$('reportForm');
  if(!form.reportValidity())return null;
  const fd=new FormData(form),r=Object.fromEntries(fd.entries());
  r.id='USR-'+Date.now();
  r.created_at=new Date().toISOString();
  let arr=[];try{arr=JSON.parse(localStorage.getItem('ogsuicide_reports')||'[]')}catch(x){}
  arr.push(r);localStorage.setItem('ogsuicide_reports',JSON.stringify(arr));loadReports();
  return r;
}
function reportMessage(r){
  const line=(label,value)=>`${label} : ${value&&String(value).trim()?String(value).trim():'Non précisé'}`;
  return [
    "SIGNALEMENT – Observatoire géographique du suicide en Côte d’Ivoire",
    `Référence : ${r.id}`,
    line('Date de la situation',r.date),
    line('Région',r.region),
    line('Commune',r.commune),
    line('Quartier / localité',r.quartier),
    line('Sexe',r.sexe),
    line('Âge / tranche d’âge',r.age),
    line('Type de milieu',r.milieu),
    line('Statut du signalement',r.statut),
    line('Latitude',r.lat),
    line('Longitude',r.lon),
    `Informations utiles : ${r.situation||'Non précisées'}`,
    '',
    'Signalement à vérifier avant toute intégration dans la base officielle.',
    'Merci de ne pas transmettre de nom, numéro de téléphone, adresse personnelle précise ou autre information permettant d’identifier une personne.'
  ].join('\n');
}
function finishReport(form){form.reset();$('reportModal').classList.remove('open');}
$('reportForm').onsubmit=e=>e.preventDefault();
$('sendWhatsApp').onclick=()=>{
  const form=$('reportForm'),r=prepareReport();if(!r)return;
  const url=`https://wa.me/${REPORT_WHATSAPP}?text=${encodeURIComponent(reportMessage(r))}`;
  window.open(url,'_blank','noopener,noreferrer');
  finishReport(form);
};
$('sendEmail').onclick=()=>{
  const form=$('reportForm'),r=prepareReport();if(!r)return;
  const subject=`Signalement suicide – ${r.region||'Région non précisée'} – ${r.date||''}`;
  const url=`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportMessage(r))}`;
  window.location.href=url;
  finishReport(form);
};
// improve title and suppress duplicate qgis popup for point layer by keeping our popup dominant
syncHeat();updateAll();refreshTheme();
})();
