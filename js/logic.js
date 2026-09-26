function svg(p,s){s=s||20;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function yt(q){return 'https://www.youtube.com/results?search_query='+encodeURIComponent(q);}

/* ---------- flow diagrams ---------- */
function flowSvg(id){
 var f=FLOWS[id]; if(!f) return '';
 var c=(DATA.find(function(x){return x.id===id;})||{}).color||'#6C7BD1';
 var boxes=f.nodes.map(function(n,i){
  var y=8+i*62;
  return '<rect x="8" y="'+y+'" width="250" height="46" rx="10" fill="var(--surface-2)" stroke="'+c+'" stroke-opacity=".5"/>'+
   '<circle cx="34" cy="'+(y+23)+'" r="12" fill="'+c+'" fill-opacity=".85"/>'+
   '<text x="34" y="'+(y+28)+'" font-size="12" font-weight="700" fill="#14171C" text-anchor="middle" font-family="Inter">'+(i+1)+'</text>'+
   '<text x="56" y="'+(y+28)+'" font-size="12.5" fill="var(--text)" font-family="Inter">'+esc(n)+'</text>'+
   (i<f.nodes.length-1?'<path d="M34 '+(y+48)+'v12" stroke="'+c+'" stroke-width="2" stroke-opacity=".6"/><path d="M30 '+(y+56)+'l4 5 4-5" fill="none" stroke="'+c+'" stroke-width="2" stroke-opacity=".6"/>':'');
 }).join('');
 return '<svg viewBox="0 0 266 '+(8+f.nodes.length*62)+'" width="100%" role="img" aria-label="How this business works, step by step" xmlns="http://www.w3.org/2000/svg">'+boxes+'</svg>'+
  '<p class="cap">'+esc(f.note)+'</p>';
}

function phoneFrame(inner,label){
 return '<svg viewBox="0 0 160 300" width="100%" style="max-width:148px" role="img" aria-label="'+esc(label||'Phone screen illustration')+'" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="6" y="6" width="148" height="288" rx="20" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/>'+
 '<rect x="14" y="16" width="132" height="268" rx="14" fill="var(--surface)" stroke="var(--border)"/>'+
 '<rect x="62" y="20" width="36" height="5" rx="2.5" fill="var(--border)"/>'+inner+'</svg>'+
 (label?'<div class="cap" style="text-align:center">'+esc(label)+'</div>':'');
}
const VISUALS=[
{t:'1. Hook text in the first second',d:'The most important words sit in the upper third, large and readable in two seconds. Not at the bottom — platform UI covers that area.',
 svg:phoneFrame('<rect x="22" y="60" width="116" height="40" rx="8" fill="#FF6B4A" opacity=".9"/><rect x="32" y="72" width="80" height="6" rx="3" fill="#14171C" opacity=".75"/><rect x="32" y="84" width="54" height="6" rx="3" fill="#14171C" opacity=".75"/><circle cx="80" cy="170" r="26" fill="var(--surface-2)"/><rect x="24" y="250" width="70" height="5" rx="2.5" fill="var(--border)"/><rect x="24" y="262" width="46" height="5" rx="2.5" fill="var(--border)"/><rect x="118" y="160" width="20" height="90" rx="6" fill="var(--surface-2)"/>','Upper third = hook zone')},
{t:'2. Cut every 2–3 seconds',d:'On the timeline, each block is one short clip. A good short video is many short clips, not one long take. The lower bar is your music, kept quiet.',
 svg:'<svg viewBox="0 0 320 110" width="100%" role="img" aria-label="Timeline showing six short clips and a quiet music track" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="20" width="320" height="34" rx="6" fill="var(--surface-2)"/>'+[0,1,2,3,4,5].map(function(i){return '<rect x="'+(4+i*52)+'" y="24" width="46" height="26" rx="4" fill="#2FB6A6" opacity="'+(0.55+i*0.06)+'"/>';}).join('')+'<rect x="0" y="62" width="320" height="18" rx="5" fill="var(--surface-2)"/><rect x="4" y="65" width="312" height="12" rx="4" fill="#9B8AFB" opacity=".45"/><text x="4" y="14" font-size="10" fill="var(--text-muted)" font-family="Inter">video</text><text x="4" y="95" font-size="10" fill="var(--text-muted)" font-family="Inter">music — 20% volume</text></svg>'},
{t:'3. Captions in the lower middle',d:'Two lines maximum, heavy font, dark plate behind the text. Without captions most viewers understand nothing, because they scroll muted.',
 svg:phoneFrame('<circle cx="80" cy="120" r="30" fill="var(--surface-2)"/><rect x="26" y="196" width="108" height="16" rx="5" fill="#14171C" opacity=".82"/><rect x="34" y="201" width="92" height="6" rx="3" fill="#F1F1EE"/><rect x="42" y="216" width="76" height="16" rx="5" fill="#14171C" opacity=".82"/><rect x="50" y="221" width="60" height="6" rx="3" fill="#F1F1EE"/>','Safe caption area')},
{t:'4. Full-screen 9:16',d:'Left is right, right is wrong. A square video with black bars reads instantly as reposted from another platform and gets less reach.',
 svg:'<svg viewBox="0 0 320 180" width="100%" role="img" aria-label="Correct vertical format versus a square video with black bars" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="10" width="92" height="160" rx="10" fill="#2FB6A6" opacity=".25" stroke="#2FB6A6" stroke-width="2"/><text x="60" y="95" font-size="12" fill="var(--text)" text-anchor="middle" font-family="Inter">9:16 correct</text><rect x="200" y="10" width="92" height="160" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/><rect x="200" y="56" width="92" height="68" fill="#EF6FA0" opacity=".3"/><text x="246" y="95" font-size="12" fill="var(--text)" text-anchor="middle" font-family="Inter">bars wrong</text></svg>'},
{t:'5. One call to action at the end',d:'A simple final frame with a single request: comment, save or click. Three requests produce zero actions.',
 svg:phoneFrame('<rect x="30" y="120" width="100" height="30" rx="8" fill="#6C7BD1" opacity=".9"/><rect x="44" y="131" width="72" height="8" rx="4" fill="#14171C" opacity=".7"/><rect x="46" y="164" width="68" height="6" rx="3" fill="var(--border)"/>','One request, centred')},
{t:'6. Export and upload',d:'Export at 1080p at the original frame rate, and upload from inside the platform app. Uploading through the share sheet compresses quality.',
 svg:'<svg viewBox="0 0 320 120" width="100%" role="img" aria-label="Export at 1080p, upload through the app rather than the share sheet" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="86" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/><text x="53" y="63" font-size="11" fill="var(--text)" text-anchor="middle" font-family="Inter">1080p</text><path d="M104 58h38" stroke="var(--text-muted)" stroke-width="2"/><path d="M136 52l8 6-8 6" fill="none" stroke="var(--text-muted)" stroke-width="2"/><rect x="150" y="30" width="72" height="56" rx="10" fill="#A8C94A" opacity=".3" stroke="#A8C94A"/><text x="186" y="63" font-size="11" fill="var(--text)" text-anchor="middle" font-family="Inter">app</text><rect x="232" y="30" width="78" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/><text x="271" y="63" font-size="11" fill="var(--text-muted)" text-anchor="middle" font-family="Inter">share sheet</text></svg>'}];

/* ---------- ad template previews ---------- */
function tplMock(kind){
 var cap='<rect x="18" y="188" width="124" height="15" rx="4" fill="#14171C" opacity=".82"/><rect x="26" y="192.5" width="90" height="6" rx="3" fill="#F1F1EE"/>';
 var cta='<rect x="34" y="228" width="92" height="26" rx="8" fill="#6C7BD1" opacity=".9"/><rect x="46" y="237" width="68" height="8" rx="4" fill="#14171C" opacity=".7"/>';
 var frame='<rect x="6" y="6" width="148" height="256" rx="18" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/><rect x="14" y="14" width="132" height="240" rx="12" fill="var(--surface)" stroke="var(--border)"/>';
 var body='';
 if(kind==='before-after'){
  body='<rect x="14" y="14" width="66" height="240" fill="#EF6FA0" opacity=".18"/><rect x="80" y="14" width="66" height="240" fill="#2FB6A6" opacity=".22"/><line x1="80" y1="14" x2="80" y2="254" stroke="var(--border)" stroke-width="2"/><rect x="24" y="24" width="42" height="14" rx="4" fill="#14171C" opacity=".7"/><rect x="90" y="24" width="42" height="14" rx="4" fill="#14171C" opacity=".7"/>'+cap;
 } else if(kind==='pov'){
  body='<rect x="22" y="30" width="116" height="24" rx="6" fill="#FF6B4A" opacity=".9"/><rect x="30" y="38" width="70" height="8" rx="4" fill="#14171C" opacity=".75"/><circle cx="80" cy="140" r="34" fill="var(--surface-2)"/>'+cap;
 } else if(kind==='mistakes'){
  body='<rect x="24" y="34" width="112" height="10" rx="5" fill="#F4B740" opacity=".9"/>'+
  ['1','2','3'].map(function(n,i){return '<circle cx="34" cy="'+(66+i*30)+'" r="9" fill="#F4B740" opacity=".8"/><text x="34" y="'+(70+i*30)+'" font-size="10" font-weight="700" fill="#14171C" text-anchor="middle" font-family=\'Inter\'>'+n+'</text><rect x="50" y="'+(60+i*30)+'" width="80" height="10" rx="4" fill="var(--surface-2)"/>';}).join('');
 } else if(kind==='day-in-life'){
  body=['7:30','14:00','21:00'].map(function(t,i){return '<rect x="20" y="'+(30+i*40)+'" width="34" height="14" rx="4" fill="#A8C94A" opacity=".85"/><text x="37" y="'+(40+i*40)+'" font-size="8.5" fill="#14171C" text-anchor="middle" font-family=\'Inter\'>'+t+'</text><rect x="60" y="'+(30+i*40)+'" width="76" height="30" rx="6" fill="var(--surface-2)"/>';}).join('')+cap;
 } else if(kind==='demo'){
  body='<circle cx="80" cy="90" r="46" fill="#4F9DDE" opacity=".2"/><circle cx="80" cy="90" r="26" fill="#4F9DDE" opacity=".55"/>'+cap+cta;
 } else if(kind==='journey'){
  body='<rect x="24" y="28" width="112" height="20" rx="10" fill="#9B8AFB" opacity=".85"/><text x="80" y="42" font-size="10" font-weight="700" fill="#14171C" text-anchor="middle" font-family=\'Inter\'>DAY 7 / 30</text>'+
  '<rect x="24" y="64" width="112" height="8" rx="4" fill="var(--surface-2)"/><rect x="24" y="64" width="30" height="8" rx="4" fill="#9B8AFB"/>'+cap;
 } else if(kind==='reply'){
  body='<rect x="24" y="30" width="112" height="46" rx="10" fill="var(--surface-2)" stroke="var(--border)"/><rect x="34" y="40" width="70" height="7" rx="3.5" fill="var(--text-muted)" opacity=".5"/><rect x="34" y="54" width="90" height="7" rx="3.5" fill="var(--text-muted)" opacity=".5"/><path d="M40 76l8 10 8-10" fill="none" stroke="var(--border)" stroke-width="2"/>'+cap;
 } else if(kind==='compare'){
  body='<rect x="14" y="14" width="66" height="240" fill="#F4B740" opacity=".14"/><rect x="80" y="14" width="66" height="240" fill="#5B69C4" opacity=".18"/><text x="47" y="40" font-size="11" font-weight="700" fill="#14171C" text-anchor="middle" font-family=\'Inter\'>A</text><text x="113" y="40" font-size="11" font-weight="700" fill="#14171C" text-anchor="middle" font-family=\'Inter\'>B</text>'+
  [0,1,2].map(function(i){return '<rect x="24" y="'+(64+i*26)+'" width="46" height="8" rx="4" fill="var(--surface)" opacity=".9"/><rect x="90" y="'+(64+i*26)+'" width="46" height="8" rx="4" fill="var(--surface)" opacity=".9"/>';}).join('');
 }
 return '<svg viewBox="0 0 160 262" width="100%" style="max-width:132px" role="img" aria-label="Rough on-screen layout for this ad format" xmlns="http://www.w3.org/2000/svg">'+frame+body+'</svg>';
}

/* ---------- state ---------- */
let progress=(function(){try{return JSON.parse(localStorage.getItem('sg_progress')||'{}');}catch(e){return {};}})();
function saveProgress(){
 try{localStorage.setItem('sg_progress',JSON.stringify(progress));}catch(e){}
 if(firestoreModule){firestoreModule.saveProgress(progress).catch(function(){});}
}
function doneCount(id){return (progress[id]||[]).length;}
let activeCat=null,activeTab='intro',selectedType=CONTENT_TYPES[0].id,chatHistory=[],quizAnswers={};

const VIEWS=['home','category','content','assistant','templates','editing','glossary','quiz','feed','leaderboard','legal','terms','access','privacy','cookies','refunds','ages','visual'];
function showView(n){VIEWS.forEach(function(v){document.getElementById('view-'+v).hidden=(v!==n);});document.getElementById('backBtn').hidden=(n==='home');window.scrollTo(0,0);}
function go(n){showView(n);if(n==='home')renderHome();}

/* ---------- auth gate (Firebase Authentication) ---------- */
let authModule=null, firestoreModule=null, workerModule=null, legalModule=null, currentUser=null, selectedCountry='';

async function loadFirestore(){
 if(!firestoreModule)firestoreModule=await import('./firestore-integration.js');
 return firestoreModule;
}
async function loadWorker(){
 if(!workerModule)workerModule=await import('./worker-client.js');
 return workerModule;
}
async function loadLegal(){
 if(!legalModule)legalModule=await import('./legal-pages.js');
 return legalModule;
}
function consentNotice(key,fallback){
 return (legalModule&&legalModule.CONSENT_TEXT&&legalModule.CONSENT_TEXT[key])||fallback;
}

/* ---------- deep chapters (per-business, JSON-backed — pilot: dropship only) ---------- */
let chaptersCache={};
async function loadChapters(bizId){
 if(chaptersCache[bizId]!==undefined)return chaptersCache[bizId];
 try{
  var res=await fetch('public/data/'+bizId+'.json');
  if(!res.ok){chaptersCache[bizId]=null;return null;}
  chaptersCache[bizId]=await res.json();
 }catch(e){chaptersCache[bizId]=null;}
 return chaptersCache[bizId];
}
function chapterTotal(chData){return chData.chapters.reduce(function(s,c){return s+c.checklist.length;},0);}
function chapterFlatStart(chData,ci){var off=0;for(var i=0;i<ci;i++){off+=chData.chapters[i].checklist.length;}return off;}
function totalStepsFor(cat){
 var ch=chaptersCache[cat.id];
 return ch?chapterTotal(ch):cat.steps.length;
}

async function syncRemoteProgress(){
 try{
  var remote=await firestoreModule.loadProgress();
  if(remote&&typeof remote==='object'&&Object.keys(remote).length){
   progress=remote;
   try{localStorage.setItem('sg_progress',JSON.stringify(progress));}catch(e){}
  }
 }catch(e){}
}

async function initAuth(){
 try{
  authModule=await import('./auth.js');
 }catch(e){
  document.getElementById('gate').innerHTML='<div class="gate-card"><p class="hint">Could not load sign-in. Check your connection and reload the page.</p></div>';
  return;
 }
 authModule.watchAuthState(async function(user){
  currentUser=user;
  if(!user){stopFeedWatch();stopLeaderboardWatch();renderGate();return;}
  var rec=null;
  try{
   await loadFirestore();
   rec=await firestoreModule.loadAgreement();
  }catch(e){}
  if(rec){selectedCountry=rec.country||'';await syncRemoteProgress();enterApp();}
  else{renderGate();}
 });
}

function countryOptions(){
 return '<option value="">Select your country...</option>'+
  Object.keys(COUNTRY_LEGAL).filter(function(k){return k!=='other';}).map(function(k){
   return '<option value="'+k+'">'+COUNTRY_LEGAL[k].name+'</option>';
  }).join('')+'<option value="other">Other / not listed</option>';
}

function renderGate(){
 var g=document.getElementById('gate');
 var signedInLine = currentUser ?
  '<p class="hint" style="margin-bottom:14px">Signed in as <b>'+esc(currentUser.displayName||currentUser.email||'your Google account')+'</b> · <span class="link" id="gateSwitch">Not you?</span></p>' : '';
 g.innerHTML=
 '<div class="gate-card">'+
  '<div class="brand-mark" style="margin:0 auto 16px">L</div>'+
  '<h1 style="font-size:24px;text-align:center;margin-bottom:8px">Launchpad</h1>'+
  '<p style="text-align:center;color:var(--text-muted);font-size:14px;margin:0 0 22px">Start a real business, one step at a time.</p>'+
  signedInLine+
  '<label class="field-label" for="gateCountry">Your country <span style="color:#E0A020">*</span></label>'+
  '<select id="gateCountry">'+countryOptions()+'</select>'+
  (currentUser ? '' :
   '<label class="field-label">Sign in with</label>'+
   '<button class="auth-btn" id="googleBtn"><span class="ai">G</span> Continue with Google</button>'
  )+
  '<label class="agree"><input type="checkbox" id="agreeBox">'+
   '<span>I confirm I am 13 or older (and, if under 18, that my parent or guardian agrees to my use of this service). '+
   'I have read and accept the <span class="link" id="gateTerms">Terms of Use</span> and the <span class="link" id="gatePrivacy">Privacy Policy</span>, '+
   'including that the guides, templates and content in this app are copyright protected and <b>may not be copied, republished, resold or used to build a competing product</b>.</span></label>'+
  '<button class="btn-primary" id="gateGo" style="margin-top:14px">'+(currentUser?'Enter Launchpad':'Sign in with Google to continue')+'</button>'+
  '<p class="hint" id="gateHint"></p>'+
 '</div>';

 if(!currentUser){
  document.getElementById('googleBtn').onclick=async function(){
   var hint=document.getElementById('gateHint');
   hint.textContent='Opening Google sign-in...';
   try{await authModule.signInWithGoogle();}
   catch(e){hint.textContent='Google sign-in was cancelled or failed. Try again.';}
  };
 } else {
  document.getElementById('gateSwitch').onclick=async function(){
   try{await authModule.logout();}catch(e){}
  };
 }
 document.getElementById('gateTerms').onclick=function(){renderTerms();document.getElementById('app').hidden=false;document.getElementById('gate').hidden=true;showView('terms');};
 document.getElementById('gatePrivacy').onclick=function(){renderPrivacy();document.getElementById('app').hidden=false;document.getElementById('gate').hidden=true;showView('privacy');};
 document.getElementById('gateGo').onclick=async function(){
  var hint=document.getElementById('gateHint');
  var country=document.getElementById('gateCountry').value;
  if(!currentUser){hint.textContent='Sign in with Google first.';return;}
  if(!country){hint.textContent='Please select your country.';return;}
  if(!document.getElementById('agreeBox').checked){hint.textContent='You need to accept the Terms of Use to continue.';return;}
  var btn=document.getElementById('gateGo');btn.disabled=true;hint.textContent='Saving...';
  selectedCountry=country;
  try{
   await loadFirestore();
   await firestoreModule.saveAgreement({country:country,acceptedAt:Date.now(),email:currentUser.email||null});
   await syncRemoteProgress();
   enterApp();
  }catch(e){
   hint.textContent='Could not save — check your connection and try again.';
   btn.disabled=false;
  }
 };
}
function enterApp(){
 document.getElementById('gate').hidden=true;
 document.getElementById('app').hidden=false;
 renderHome();
}

/* ---------- home ---------- */
function renderHome(){
 var total=DATA.reduce(function(s,c){return s+totalStepsFor(c);},0);
 var d=DATA.reduce(function(s,c){return s+doneCount(c.id);},0);
 var pct=total?Math.round(d/total*100):0,C=2*Math.PI*19;
 var tiles=[
  {k:'quiz',c:'#FF6B4A',i:I.compass,b:'Which business fits me?',s:'Five questions, three matches'},
  {k:'assistant',c:'#6C7BD1',i:I.spark,b:'AI mentor',s:'Ask anything about your business'},
  {k:'templates',c:'#2FB6A6',i:I.film,b:'Ad templates',s:'8 trending formats with scripts'},
  {k:'content',c:'#F4B740',i:I.chat,b:'AI content tool',s:'Captions, scripts, hashtags'},
  {k:'editing',c:'#EF6FA0',i:I.scissors,b:'Filming and editing',s:'Tools, rules and illustrated steps'},
  {k:'feed',c:'#4F9DDE',i:I.chat,b:'Community feed',s:'Search and filter by business type'},
  {k:'leaderboard',c:'#EF6FA0',i:I.mega,b:'Leaderboard',s:'Self-reported sales, ranked'},
  {k:'ages',c:'#A8C94A',i:I.shield,b:'What fits your age',s:'Rules and realistic options by age'},
  {k:'glossary',c:'#9B8AFB',i:I.bookmark,b:'Glossary',s:'Every term explained plainly'}];
 document.getElementById('view-home').innerHTML=
 '<div class="hero"><svg class="hero-motif" width="120" height="70" viewBox="0 0 120 70" aria-hidden="true"><circle cx="18" cy="14" r="5" fill="#FF6B4A" opacity=".55"/><circle cx="46" cy="6" r="3.5" fill="#F4B740" opacity=".55"/><circle cx="78" cy="16" r="4.5" fill="#2FB6A6" opacity=".5"/><circle cx="102" cy="30" r="3" fill="#9B8AFB" opacity=".5"/><path d="M4 40 Q60 10 116 44" fill="none" stroke="var(--border)" stroke-width="1.4" stroke-dasharray="3 5"/></svg><h1>From idea to your first business</h1><p>Nine real paths, each with a full explanation before you start, clear steps, the platforms to sign up to, and an AI tool for every stage.</p></div>'+
 '<div class="progress-strip"><svg width="46" height="46" viewBox="0 0 46 46" role="img" aria-label="'+pct+' percent of all steps complete"><circle cx="23" cy="23" r="19" fill="none" stroke="var(--surface-2)" stroke-width="5"/><circle cx="23" cy="23" r="19" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'" stroke-linecap="round" transform="rotate(-90 23 23)"/></svg>'+
 '<div class="info"><b>'+pct+'% complete</b><span>'+d+' of '+total+' steps done</span></div></div>'+
 '<div class="panel warn" id="legalCard" style="cursor:pointer"><h4>Read this before you start</h4><p class="muted-sm">Age limits, parental consent, tax, copyright and how not to get scammed. The legal groundwork for anyone starting a business under 18.</p></div>'+
 '<h2 class="section-label">Tools</h2>'+
 '<div class="nav-tiles">'+tiles.map(function(t){return '<button class="tile" data-go="'+t.k+'"><span class="g" style="background:'+t.c+'">'+svg(t.i,19)+'</span><span><b>'+t.b+'</b><span>'+t.s+'</span></span></button>';}).join('')+'</div>'+
 '<h2 class="section-label">Nine business paths</h2>'+
 '<div class="grid">'+DATA.map(function(cat){
  var dc=doneCount(cat.id),t=totalStepsFor(cat),p=Math.round(dc/t*100);
  return '<button class="card" data-cat="'+cat.id+'"><span class="card-row"><span class="badge" style="background:'+cat.color+'">'+svg(cat.icon,19)+'</span><span class="age-tag">'+cat.age+'</span></span>'+
  '<span><h3>'+cat.name+'</h3><p>'+cat.desc+'</p></span>'+
  '<span class="w"><span class="mini-progress"><i style="width:'+p+'%;background:'+cat.color+'"></i></span><span class="mini-label">'+dc+'/'+t+' steps</span></span></button>';
 }).join('')+'</div>'+
 '<p class="hint" style="margin-top:24px;text-align:center"><span class="link" id="tLink">Terms of Use</span> · <span class="link" id="pLink">Privacy Policy</span> · <span class="link" id="cLink">Cookie Policy</span> · <span class="link" id="rLink">Refund Policy</span> · <span class="link" id="aLink">Accessibility statement</span> · <span class="link" id="soLink">Sign out</span></p>'+
 copyrightNotice();

 document.getElementById('legalCard').onclick=function(){renderLegal();showView('legal');};
 document.getElementById('tLink').onclick=function(){renderTerms();showView('terms');};
 document.getElementById('pLink').onclick=function(){renderPrivacy();showView('privacy');};
 document.getElementById('cLink').onclick=function(){renderCookies();showView('cookies');};
 document.getElementById('rLink').onclick=function(){renderRefunds();showView('refunds');};
 document.getElementById('aLink').onclick=function(){renderAccess();showView('access');};
 document.getElementById('soLink').onclick=async function(){
  if(authModule){try{await authModule.logout();}catch(e){}}
  document.getElementById('app').hidden=true;
  renderGate();
  document.getElementById('gate').hidden=false;
 };
 document.querySelectorAll('[data-go]').forEach(function(el){
  el.onclick=function(){var k=el.dataset.go;
   if(k==='quiz'){renderQuiz();showView('quiz');}
   else if(k==='assistant'){renderAssistant();showView('assistant');}
   else if(k==='templates'){renderTemplates();showView('templates');}
   else if(k==='content'){renderContentTool();showView('content');}
   else if(k==='editing'){renderEditing();showView('editing');}
   else if(k==='glossary'){renderGlossary();showView('glossary');}
   else if(k==='feed'){renderFeed();showView('feed');}
   else if(k==='leaderboard'){renderLeaderboard();showView('leaderboard');}
   else if(k==='ages'){renderAges();showView('ages');}};
 });
 document.querySelectorAll('.card[data-cat]').forEach(function(el){el.onclick=function(){activeTab='intro';openCategory(el.dataset.cat);};});
}

/* ---------- category ---------- */
function openCategory(id){activeCat=DATA.find(function(c){return c.id===id;});if(!activeCat)return;renderCategory();showView('category');}
function renderCategory(){
 var cat=activeCat,dc=doneCount(cat.id),t=totalStepsFor(cat);
 var body;
 if(activeTab==='intro'){body=introHtml(cat);}
 else if(activeTab==='platforms'){body=platformsHtml(cat);}
 else{
  var chData=chaptersCache[cat.id];
  if(chData===undefined){
   body='<p class="hint">Loading...</p>';
   loadChapters(cat.id).then(function(){if(activeCat===cat&&activeTab==='steps')renderCategory();});
  }else if(chData){
   body=chaptersHtml(cat,chData);
  }else{
   body=stepsHtml(cat);
  }
 }
 document.getElementById('view-category').innerHTML=
 '<div class="cat-hero"><div class="badge badge-lg" style="background:'+cat.color+'">'+svg(cat.icon,25)+'</div>'+
 '<h1>'+cat.name+'</h1><p>'+cat.desc+'</p><p class="age-line">Typically suitable from: <b>'+cat.age+'</b></p></div>'+
 '<div class="tabs" role="tablist">'+
  '<button class="tab '+(activeTab==='intro'?'active':'')+'" data-tab="intro">What it is</button>'+
  '<button class="tab '+(activeTab==='steps'?'active':'')+'" data-tab="steps">Steps ('+dc+'/'+t+')</button>'+
  '<button class="tab '+(activeTab==='platforms'?'active':'')+'" data-tab="platforms">Platforms</button>'+
 '</div>'+body;
 document.querySelectorAll('.tab').forEach(function(el){el.onclick=function(){activeTab=el.dataset.tab;renderCategory();};});
 bindCategory();
}
function introHtml(cat){var x=cat.intro;
 return '<a class="lesson" target="_blank" rel="noopener" href="'+cat.videoUrl+'"><span class="play">'+svg('<path d="M9 7l8 5-8 5V7z"/>',17)+'</span><span><b>Watch: '+cat.name+' explained</b><span>A specific video, opens in a new tab</span></span></a>'+
 '<div class="panel"><h4>How this business actually works</h4><div class="flow">'+flowSvg(cat.id)+'</div></div>'+
 '<div class="panel"><h4>What it is</h4><p>'+x.what+'</p></div>'+
 '<div class="panel"><h4>How you make money</h4><p>'+x.money+'</p></div>'+
 '<div class="facts"><div class="fact"><span>Startup cost</span><b>'+x.cost+'</b></div><div class="fact"><span>Hours per week</span><b>'+x.time+'</b></div></div>'+
 '<div class="panel"><h4>What you can realistically earn</h4><p>'+x.income+'</p></div>'+
 '<div class="panel warn"><h4>The risk to know about</h4><p>'+x.risk+'</p></div>'+
 '<div class="panel"><h4>Legal and age notes</h4><p>'+x.legal+'</p></div>'+
 '<div class="panel"><h4>Who it suits</h4><p>'+x.fit+'</p></div>'+
 '<button class="btn-primary" id="startSteps">Start the steps</button>'+
 '<button class="btn-ghost full" id="askCat">Ask the mentor about '+cat.name+'</button>';
}
function platformsHtml(cat){
 return '<p class="muted-sm" style="margin-bottom:14px">Every link opens the official site in a new tab. Check age requirements before signing up — most payment and ad platforms require an account holder aged 18+.</p>'+
 cat.platforms.map(function(p){
  return '<div class="panel"><div class="plat-top"><h4>'+p.n+'</h4><span class="price-tag">'+p.p+'</span></div>'+
  '<p class="muted-sm">'+p.w+'</p>'+
  '<a class="pill" target="_blank" rel="noopener" href="'+p.u+'">Open '+p.n+' '+svg('<path d="M7 17L17 7M9 7h8v8"/>',13)+'</a></div>';
 }).join('');
}
function stepsHtml(cat){
 return cat.steps.map(function(s,i){
  var isDone=(progress[cat.id]||[]).indexOf(i)>-1;
  return '<div class="step" data-idx="'+i+'"><div class="step-head">'+
  '<span class="step-check '+(isDone?'done':'')+'" data-check="'+i+'" role="checkbox" aria-checked="'+isDone+'" tabindex="0" style="'+(isDone?'background:'+cat.color:'')+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>'+
  '<span class="step-num">0'+(i+1)+'</span><span class="step-title '+(isDone?'done':'')+'">'+s.title+'</span><span class="chev">'+svg('<path d="M6 9l6 6 6-6"/>',16)+'</span></div>'+
  '<div class="step-body"><p>'+s.text+'</p><div class="row-links">'+
  '<span class="pill" data-ask="'+i+'" role="button" tabindex="0">'+svg(I.spark,14)+' Ask the mentor about this step</span></div>'+
  '<div class="ai-tool"><span class="dot" style="background:'+cat.color+'"></span><span><b>AI tool for this step: '+s.tool+'</b><span>'+s.toolUse+'</span></span></div></div></div>';
 }).join('');
}
function chaptersHtml(cat,chData){
 var doneArr=progress[cat.id]||[];
 var offset=0;
 return chData.chapters.map(function(ch,ci){
  var start=offset;offset+=ch.checklist.length;
  var doneInCh=ch.checklist.filter(function(_,ii){return doneArr.indexOf(start+ii)>-1;}).length;
  var allDone=doneInCh===ch.checklist.length&&ch.checklist.length>0;
  var explanationHtml=ch.explanation.map(function(s,i){return '<div class="beat"><i>Step '+(i+1)+'</i><div>'+esc(s)+'</div></div>';}).join('');
  var mistakesHtml=ch.mistakes.map(function(m){return '<div class="beat"><i>✕</i><div>'+esc(m)+'</div></div>';}).join('');
  var checklistHtml=ch.checklist.map(function(item,ii){
   var flat=start+ii,checked=doneArr.indexOf(flat)>-1;
   return '<label class="agree" style="margin-bottom:8px"><input type="checkbox" data-check="'+flat+'" '+(checked?'checked':'')+'><span>'+esc(item)+'</span></label>';
  }).join('');
  var parentBanner=ch.parentNeeded?'<div class="panel warn"><h4>Here you need a parent</h4><p class="muted-sm">'+esc(ch.parentNote)+'</p></div>':'';
  return '<div class="step" data-idx="'+ci+'"><div class="step-head">'+
  '<span class="step-check '+(allDone?'done':'')+'" data-check-chapter="'+ci+'" role="checkbox" aria-checked="'+allDone+'" tabindex="0" style="'+(allDone?'background:'+cat.color:'')+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>'+
  '<span class="step-num">'+(ci<9?'0':'')+(ci+1)+'</span><span class="step-title '+(allDone?'done':'')+'">'+esc(ch.title)+'</span>'+
  '<span class="muted-xs" style="margin:0 8px">'+doneInCh+'/'+ch.checklist.length+'</span>'+
  '<span class="chev">'+svg('<path d="M6 9l6 6 6-6"/>',16)+'</span></div>'+
  '<div class="step-body">'+
   '<div class="ai-tool"><span class="dot" style="background:'+cat.color+'"></span><span><b>Goal</b><span>'+esc(ch.goal)+'</span></span></div>'+
   '<div class="chapter-image"><img src="'+esc(ch.imagePath)+'" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">'+
   '<div class="chapter-image-fallback" style="display:none;background:'+cat.color+'">'+svg(cat.icon,26)+'</div></div>'+
   '<h4 style="margin:14px 0 4px">Step by step</h4>'+explanationHtml+
   '<div class="panel" style="margin-top:12px"><h4>Example</h4><p>'+esc(ch.example)+'</p></div>'+
   '<h4 style="margin:14px 0 4px">Common mistakes</h4>'+mistakesHtml+
   '<h4 style="margin:14px 0 4px">Template</h4><div class="script">'+esc(ch.template)+'</div>'+
   parentBanner+
   '<h4 style="margin:14px 0 4px">Checklist</h4>'+checklistHtml+
   '<div class="row-links" style="margin-top:8px"><span class="pill" data-ask-chapter="'+ci+'" role="button" tabindex="0">'+svg(I.spark,14)+' Ask the mentor about this chapter</span></div>'+
  '</div></div>';
 }).join('');
}
function bindCategory(){
 var cat=activeCat;
 var chData=chaptersCache[cat.id];
 var b=document.getElementById('startSteps');if(b)b.onclick=function(){activeTab='steps';renderCategory();};
 var a=document.getElementById('askCat');if(a)a.onclick=function(){renderAssistant('I want to start '+cat.name+'. Where do I begin, and what is the most common mistake?');showView('assistant');};
 document.querySelectorAll('.step-head').forEach(function(el){el.onclick=function(e){if(e.target.closest('[data-check],[data-check-chapter]'))return;el.closest('.step').classList.toggle('open');};});
 document.querySelectorAll('[data-check]').forEach(function(el){
  var fn=function(e){e.stopPropagation();var i=parseInt(el.dataset.check,10);progress[cat.id]=progress[cat.id]||[];var k=progress[cat.id].indexOf(i);if(k>-1)progress[cat.id].splice(k,1);else progress[cat.id].push(i);saveProgress();renderCategory();};
  el.onclick=fn;el.onkeydown=function(e){if(e.key==='Enter'||e.key===' ')fn(e);};
 });
 document.querySelectorAll('[data-check-chapter]').forEach(function(el){
  var fn=function(e){
   e.stopPropagation();
   if(!chData)return;
   var ci=parseInt(el.dataset.checkChapter,10),start=chapterFlatStart(chData,ci),len=chData.chapters[ci].checklist.length;
   progress[cat.id]=progress[cat.id]||[];
   var allDone=true;
   for(var k=0;k<len;k++){if(progress[cat.id].indexOf(start+k)===-1){allDone=false;break;}}
   for(var k2=0;k2<len;k2++){
    var idx=progress[cat.id].indexOf(start+k2);
    if(allDone){if(idx>-1)progress[cat.id].splice(idx,1);}
    else if(idx===-1){progress[cat.id].push(start+k2);}
   }
   saveProgress();renderCategory();
  };
  el.onclick=fn;el.onkeydown=function(e){if(e.key==='Enter'||e.key===' ')fn(e);};
 });
 document.querySelectorAll('[data-ask-chapter]').forEach(function(el){
  el.onclick=function(){
   if(!chData)return;
   var ch=chData.chapters[parseInt(el.dataset.askChapter,10)];
   renderAssistant('I am doing '+cat.name+', on the chapter "'+ch.title+'". Walk me through exactly how to do it, and what a good example looks like.');
   showView('assistant');
  };
 });
 document.querySelectorAll('[data-ask]').forEach(function(el){el.onclick=function(){var s=cat.steps[parseInt(el.dataset.ask,10)];renderAssistant('I am doing '+cat.name+', on the step "'+s.title+'". Walk me through exactly how to do it.');showView('assistant');};});
}

/* ---------- ages ---------- */
function renderAges(){
 document.getElementById('view-ages').innerHTML=
 '<div class="hero"><h1 class="sm">What fits your age</h1><p>Age limits are not arbitrary — they come from contract law, tax rules and platform terms. Here is what is realistic at each stage, and what has to run through a parent.</p></div>'+
 AGE_GUIDE.map(function(a){
  return '<div class="panel"><div class="plat-top"><h4>'+a.age+' — '+a.title+'</h4></div>'+
  '<p>'+a.what+'</p>'+
  '<div class="chip-row" style="margin:12px 0 6px">'+a.fits.map(function(id){var c=DATA.find(function(x){return x.id===id;});return c?'<span class="chip" data-open="'+id+'" role="button" tabindex="0" style="border-color:'+c.color+'">'+c.name+'</span>':'';}).join('')+'</div>'+
  '<div class="ai-tool"><span class="dot" style="background:#F4B740"></span><span><b>The rules</b><span>'+a.rules+'</span></span></div></div>';
 }).join('')+
 '<button class="btn-ghost full" id="agesLegal">Read the full legal section</button>';
 document.getElementById('agesLegal').onclick=function(){renderLegal();showView('legal');};
 document.querySelectorAll('[data-open]').forEach(function(el){el.onclick=function(){activeTab='intro';openCategory(el.dataset.open);};});
}

/* ---------- static views ---------- */
function panelList(items){return items.map(function(x){return '<div class="panel"><h4>'+x.t+'</h4><p>'+x.d+'</p></div>';}).join('');}
function copyrightNotice(){return '<p class="hint" style="text-align:center;margin-top:18px">© 2026 Launchpad. All rights reserved.</p>';}
function renderLegal(){
 if(!selectedCountry) selectedCountry='other';
 var c=COUNTRY_LEGAL[selectedCountry]||COUNTRY_LEGAL.other;
 document.getElementById('view-legal').innerHTML=
 '<div class="hero"><h1 class="sm">The legal side</h1><p>What is allowed, what is required and what is risky when you start a business under 18. General explanation, not legal advice — rules change, so double-check anything important with a parent or professional.</p></div>'+
 '<label class="field-label" for="legalCountry">Showing rules for</label>'+
 '<select id="legalCountry">'+countryOptions()+'</select>'+
 '<h2 class="section-label">'+c.name+' — key rules</h2>'+
 c.rules.map(function(r){return '<div class="panel"><h4>'+r[0]+'</h4><p style="font-size:13.7px">'+r[1]+'</p></div>';}).join('')+
 '<h2 class="section-label">General principles — everywhere</h2>'+
 panelList(LEGAL)+
 '<button class="btn-ghost full" id="toTerms">Read the Terms of Use</button>'+
 copyrightNotice();
 document.getElementById('legalCountry').value=selectedCountry;
 document.getElementById('legalCountry').onchange=async function(e){
  selectedCountry=e.target.value||'other';
  if(currentUser){
   try{
    await loadFirestore();
    var rec=(await firestoreModule.loadAgreement())||{};
    rec.country=selectedCountry;
    await firestoreModule.saveAgreement(rec);
   }catch(err){}
  }
  renderLegal();
 };
 document.getElementById('toTerms').onclick=function(){renderTerms();showView('terms');};
}
function renderTerms(){
 document.getElementById('view-terms').innerHTML=
 '<div class="hero"><h1 class="sm">Terms of Use</h1><p>Last updated: September 2026</p></div>'+
 '<div class="panel warn"><p class="muted-sm">This is a working draft. Have a lawyer review and adapt it before the app goes live to the public.</p></div>'+
 panelList(TERMS)+
 copyrightNotice();
}
async function renderAccess(){
 document.getElementById('view-access').innerHTML=
 '<div class="hero"><h1 class="sm">Accessibility statement</h1><p>How this app is built to be usable by as many people as possible, and how to tell us when it is not.</p></div>'+
 '<p class="hint">Loading...</p>';
 try{
  await loadLegal();
  document.getElementById('view-access').innerHTML=
  '<div class="hero"><h1 class="sm">Accessibility statement</h1><p>Last updated: '+esc(legalModule.LAST_UPDATED)+'</p></div>'+
  panelList(legalModule.ACCESSIBILITY_STATEMENT)+
  copyrightNotice();
 }catch(e){
  document.getElementById('view-access').innerHTML=
  '<div class="hero"><h1 class="sm">Accessibility statement</h1></div><p class="hint">Could not load this page. Try again later.</p>'+
  copyrightNotice();
 }
}
async function renderPrivacy(){
 document.getElementById('view-privacy').innerHTML=
 '<div class="hero"><h1 class="sm">Privacy Policy</h1></div><p class="hint">Loading...</p>';
 try{
  await loadLegal();
  document.getElementById('view-privacy').innerHTML=
  '<div class="hero"><h1 class="sm">Privacy Policy</h1><p>Last updated: '+esc(legalModule.LAST_UPDATED)+'</p></div>'+
  '<div class="panel warn"><p class="muted-sm">This is a well-researched starting draft, not legal advice. Have a lawyer review it before this app is publicly promoted or takes payments.</p></div>'+
  panelList(legalModule.PRIVACY_POLICY)+
  copyrightNotice();
 }catch(e){
  document.getElementById('view-privacy').innerHTML=
  '<div class="hero"><h1 class="sm">Privacy Policy</h1></div><p class="hint">Could not load this page. Try again later.</p>'+
  copyrightNotice();
 }
}
async function renderCookies(){
 document.getElementById('view-cookies').innerHTML=
 '<div class="hero"><h1 class="sm">Cookie Policy</h1></div><p class="hint">Loading...</p>';
 try{
  await loadLegal();
  document.getElementById('view-cookies').innerHTML=
  '<div class="hero"><h1 class="sm">Cookie Policy</h1><p>Last updated: '+esc(legalModule.LAST_UPDATED)+'</p></div>'+
  panelList(legalModule.COOKIE_POLICY)+
  copyrightNotice();
 }catch(e){
  document.getElementById('view-cookies').innerHTML=
  '<div class="hero"><h1 class="sm">Cookie Policy</h1></div><p class="hint">Could not load this page. Try again later.</p>'+
  copyrightNotice();
 }
}
async function renderRefunds(){
 document.getElementById('view-refunds').innerHTML=
 '<div class="hero"><h1 class="sm">Refund Policy</h1></div><p class="hint">Loading...</p>';
 try{
  await loadLegal();
  document.getElementById('view-refunds').innerHTML=
  '<div class="hero"><h1 class="sm">Refund Policy</h1><p>Last updated: '+esc(legalModule.LAST_UPDATED)+'</p></div>'+
  panelList(legalModule.REFUND_POLICY)+
  copyrightNotice();
 }catch(e){
  document.getElementById('view-refunds').innerHTML=
  '<div class="hero"><h1 class="sm">Refund Policy</h1></div><p class="hint">Could not load this page. Try again later.</p>'+
  copyrightNotice();
 }
}
function renderGlossary(){
 document.getElementById('view-glossary').innerHTML=
 '<div class="hero"><h1 class="sm">Glossary</h1><p>Every term you will hear in business videos, in plain English.</p></div>'+
 GLOSSARY.map(function(g){return '<div class="glossary-item"><b>'+g[0]+'</b><span>'+g[1]+'</span></div>';}).join('');
}
function renderEditing(){
 document.getElementById('view-editing').innerHTML=
 '<div class="hero"><h1 class="sm">Filming and editing</h1><p>All on a phone, all free. These are the tools, rules and the order of operations that produce something people do not scroll past.</p></div>'+
 '<h2 class="section-label">Tools</h2>'+EDITING.tools.map(function(t){return '<div class="panel"><h4>'+t.n+'</h4><p class="muted-sm">'+t.d+'</p></div>';}).join('')+
 '<h2 class="section-label">Six rules that change everything</h2>'+EDITING.rules.map(function(r){return '<div class="panel"><h4>'+r[0]+'</h4><p class="muted-sm">'+r[1]+'</p></div>';}).join('')+
 '<h2 class="section-label">Editing workflow</h2><div class="panel">'+EDITING.flow.map(function(f,i){return '<div class="beat"><i>Step '+(i+1)+'</i><div>'+f+'</div></div>';}).join('')+'</div>'+
 '<h2 class="section-label">Common mistakes</h2><div class="panel">'+EDITING.mistakes.map(function(m){return '<div class="beat"><i>✕</i><div>'+m+'</div></div>';}).join('')+'</div>'+
 '<button class="btn-primary" id="toVisual">See what this looks like on screen</button>';
 document.getElementById('toVisual').onclick=function(){renderVisual();showView('visual');};
}
function renderVisual(){
 document.getElementById('view-visual').innerHTML=
 '<div class="hero"><h1 class="sm">What an ad looks like on screen</h1><p>Six illustrated steps showing exactly where each element goes.</p></div>'+
 VISUALS.map(function(v){return '<div class="panel"><h4>'+v.t+'</h4><div class="viz">'+v.svg+'</div><p class="muted-sm">'+v.d+'</p></div>';}).join('');
}
function renderTemplates(){
 var kinds=['before-after','pov','mistakes','day-in-life','demo','journey','reply','compare'];
 document.getElementById('view-templates').innerHTML=
 '<div class="hero"><h1 class="sm">Ad templates</h1><p>Eight formats that work on social right now. Each has a rough on-screen preview, a structure, a sample script and an editing tip — and can be rewritten for your business.</p></div>'+
 TEMPLATES.map(function(t,i){
  return '<div class="tpl" data-t="'+i+'"><div class="tpl-head"><span class="n">0'+(i+1)+'</span><div><b>'+t.name+'</b><span>'+t.platform+' · '+t.why+'</span></div></div>'+
  '<div class="tpl-body"><div class="tpl-preview">'+tplMock(kinds[i])+'</div>'+
  t.beats.map(function(b){return '<div class="beat"><i>'+b[0]+'</i><div>'+b[1]+'</div></div>';}).join('')+
  '<div class="script">'+esc(t.script)+'</div>'+
  '<div class="ai-tool"><span class="dot" style="background:var(--accent)"></span><span><b>Editing tip</b><span>'+t.tip+'</span></span></div>'+
  '<button class="btn-ghost full" data-fill="'+i+'">Rewrite this for my business</button></div></div>';
 }).join('');
 document.querySelectorAll('.tpl-head').forEach(function(el){el.onclick=function(){el.closest('.tpl').classList.toggle('open');};});
 document.querySelectorAll('[data-fill]').forEach(function(el){el.onclick=function(){
  var t=TEMPLATES[parseInt(el.dataset.fill,10)];
  renderContentTool('Write a full version of the "'+t.name+'" format for my business, following this structure: '+t.beats.map(function(b){return b[0]+' — '+b[1];}).join(' | '));
  showView('content');};});
}
function renderQuiz(){
 var html='<div class="hero"><h1 class="sm">Which business fits you?</h1><p>Five questions. No right answers — just a match to where you actually are.</p></div>';
 QUIZ.forEach(function(q,qi){
  html+='<fieldset class="quiz-q"><legend><b>'+(qi+1)+'. '+q.q+'</b></legend>'+q.opts.map(function(o,oi){
   return '<div class="quiz-opt '+(quizAnswers[qi]===oi?'sel':'')+'" data-q="'+qi+'" data-o="'+oi+'" role="button" tabindex="0">'+o.t+'</div>';}).join('')+'</fieldset>';
 });
 html+='<button class="btn-primary" id="quizGo">Find my match</button><div id="quizResult"></div>';
 document.getElementById('view-quiz').innerHTML=html;
 document.querySelectorAll('.quiz-opt').forEach(function(el){el.onclick=function(){quizAnswers[parseInt(el.dataset.q,10)]=parseInt(el.dataset.o,10);renderQuiz();};});
 document.getElementById('quizGo').onclick=function(){
  if(Object.keys(quizAnswers).length<QUIZ.length){document.getElementById('quizResult').innerHTML='<p class="hint">Answer all five questions to get a match.</p>';return;}
  var scores={};
  QUIZ.forEach(function(q,qi){var s=q.opts[quizAnswers[qi]].s;Object.keys(s).forEach(function(k){scores[k]=(scores[k]||0)+s[k];});});
  var ranked=Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];}).slice(0,3);
  document.getElementById('quizResult').innerHTML='<h2 class="section-label">Your three best matches</h2>'+ranked.map(function(id,i){
   var c=DATA.find(function(x){return x.id===id;});
   return '<button class="card" data-cat="'+id+'" style="margin-bottom:9px"><span class="card-row"><span class="badge" style="background:'+c.color+'">'+svg(c.icon,19)+'</span><span class="age-tag">'+c.age+'</span></span><span><h3>'+(i+1)+'. '+c.name+'</h3><p>'+c.desc+'</p></span></button>';}).join('');
  document.querySelectorAll('#quizResult .card').forEach(function(el){el.onclick=function(){activeTab='intro';openCategory(el.dataset.cat);};});
 };
}

/* ---------- AI content tool ---------- */
function renderContentTool(preset){
 var biz='';try{biz=localStorage.getItem('sg_biz')||'';}catch(e){}
 document.getElementById('view-content').innerHTML=
 '<div class="hero"><h1 class="sm">AI content tool</h1><p>Describe your business, pick what you need, and get a draft written for you.</p></div>'+
 '<p class="hint">'+esc(consentNotice('aiTools','What you type here is sent to an AI provider to generate a reply. Do not enter personal, financial, or confidential information. AI responses can be wrong — check anything important before acting on it.'))+'</p>'+
 '<label class="field-label" for="bizInput">What is your business?</label>'+
 '<textarea id="bizInput" placeholder="e.g. an online store selling phone accessories with original designs, aimed at 14-18 year olds">'+esc(biz)+'</textarea>'+
 (preset?'<label class="field-label" for="customTask">What to write</label><textarea id="customTask">'+esc(preset)+'</textarea>':'<span class="field-label">Content type</span><div class="chip-row" id="typeChips"></div>')+
 '<button class="btn-primary" id="genBtn">Write my draft</button>'+
 '<p class="hint">Edit the draft into your own voice before posting — content that sounds like you performs better.</p>'+
 '<div class="result-box" id="resultBox" hidden></div>';
 if(!preset)renderTypeChips();
 document.getElementById('genBtn').onclick=function(){
  var b=document.getElementById('bizInput').value.trim(),box=document.getElementById('resultBox');
  if(!b){box.hidden=false;box.textContent='Tell me about your business first.';return;}
  try{localStorage.setItem('sg_biz',b);}catch(e){}
  var task=preset?document.getElementById('customTask').value:CONTENT_TYPES.find(function(c){return c.id===selectedType;}).prompt;
  generate(b,task,box,document.getElementById('genBtn'));
 };
}
function renderTypeChips(){
 var el=document.getElementById('typeChips');if(!el)return;
 el.innerHTML=CONTENT_TYPES.map(function(c){return '<button class="chip '+(c.id===selectedType?'active':'')+'" data-id="'+c.id+'">'+c.label+'</button>';}).join('');
 el.querySelectorAll('.chip').forEach(function(c){c.onclick=function(){selectedType=c.dataset.id;renderTypeChips();};});
}
async function generate(biz,task,box,btn){
 box.hidden=false;box.textContent='Writing...';btn.disabled=true;
 try{
  await loadWorker();
  var text=await workerModule.generateContent(biz,task);
  box.textContent=text;
 }catch(e){box.textContent='Could not generate right now. Try again in a moment.';}
 btn.disabled=false;
}

/* ---------- AI mentor ---------- */
function renderAssistant(prefill){
 var sug=['How do I find my first client?','How much money do I need to start?','How do I market with no budget?','Nobody is buying — what now?'];
 document.getElementById('view-assistant').innerHTML=
 '<div class="hero"><h1 class="sm">AI mentor</h1><p>Ask anything about your business — from the first step to the first customer. Direct answers, no promises.</p></div>'+
 '<p class="hint">'+esc(consentNotice('aiTools','What you type here is sent to an AI provider to generate a reply. Do not enter personal, financial, or confidential information. AI responses can be wrong — check anything important before acting on it.'))+'</p>'+
 '<div class="chip-row" id="sugChips">'+sug.map(function(s){return '<button class="chip">'+s+'</button>';}).join('')+'</div>'+
 '<div class="chat-log" id="chatLog" aria-live="polite"></div>'+
 '<div class="chat-input-row"><textarea id="chatInput" aria-label="Message the mentor" placeholder="Ask anything...">'+esc(prefill||'')+'</textarea>'+
 '<button class="send-btn" id="sendBtn" aria-label="Send">'+svg('<path d="M4 20l16-8-16-8 3 8-3 8z"/>',18)+'</button></div>';
 renderChatLog();
 document.querySelectorAll('#sugChips .chip').forEach(function(c){c.onclick=function(){document.getElementById('chatInput').value=c.textContent;sendChat();};});
 document.getElementById('sendBtn').onclick=sendChat;
 document.getElementById('chatInput').onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}};
}
function renderChatLog(){
 var log=document.getElementById('chatLog');if(!log)return;
 log.innerHTML=chatHistory.map(function(m){return '<div class="msg '+(m.role==='user'?'user':'bot')+'">'+esc(m.content)+'</div>';}).join('');
}
async function sendChat(){
 var input=document.getElementById('chatInput'),text=input.value.trim();
 if(!text)return;input.value='';
 chatHistory.push({role:'user',content:text});chatHistory.push({role:'assistant',content:'Thinking...'});renderChatLog();
 var btn=document.getElementById('sendBtn');btn.disabled=true;
 try{
  await loadWorker();
  var turns=chatHistory.slice(0,-1).map(function(m){return {role:m.role,content:m.content};});
  var reply=await workerModule.mentorChat(turns);
  chatHistory[chatHistory.length-1].content=reply;
 }catch(e){chatHistory[chatHistory.length-1].content='Could not answer right now. Try again in a moment.';}
 renderChatLog();btn.disabled=false;
}

/* ---------- feed ---------- */
let feedPosts=[],feedFilter='all',feedSearch='',feedSort='new',feedLoaded=false,feedUnsub=null;
function stopFeedWatch(){if(feedUnsub){try{feedUnsub();}catch(e){}feedUnsub=null;}feedLoaded=false;feedPosts=[];}
async function startFeedWatch(){
 if(feedUnsub)return;
 try{
  await loadFirestore();
  feedUnsub=firestoreModule.watchFeed(function(posts){
   feedPosts=posts;feedLoaded=true;renderFeedList();
  });
 }catch(e){
  var el=document.getElementById('feedList');
  if(el)el.innerHTML='<p class="hint">The feed is not available right now. Try again later.</p>';
 }
}
function renderFeed(){
 document.getElementById('view-feed').innerHTML=
 '<div class="hero"><h1 class="sm">Community feed</h1><p>What other people are building right now. Share progress, ask when you are stuck, and see that getting stuck is normal.</p></div>'+
 '<div class="panel warn"><p class="muted-sm">'+esc(consentNotice('feedPost','Posts are visible to everyone using the app. Never post your full name, phone number, address or payment details.'))+'</p></div>'+
 '<div id="composer"></div>'+
 '<h2 class="section-label">Filter</h2>'+
 '<label class="field-label" for="feedSearch">Search posts</label>'+
 '<input type="text" id="feedSearch" placeholder="Search the feed..." value="'+esc(feedSearch)+'">'+
 '<div class="chip-row" id="feedChips"></div>'+
 '<div class="chip-row"><button class="chip '+(feedSort==='new'?'active':'')+'" data-sort="new">Newest</button><button class="chip '+(feedSort==='top'?'active':'')+'" data-sort="top">Most cheered</button></div>'+
 '<div id="feedList"><p class="hint">Loading the feed...</p></div>';
 renderComposer();renderFeedChips();renderFeedList();
 document.getElementById('feedSearch').oninput=function(e){feedSearch=e.target.value;renderFeedList();};
 document.querySelectorAll('[data-sort]').forEach(function(c){c.onclick=function(){feedSort=c.dataset.sort;renderFeed();};});
 startFeedWatch();
}
function renderFeedChips(){
 var el=document.getElementById('feedChips');
 el.innerHTML='<button class="chip '+(feedFilter==='all'?'active':'')+'" data-f="all">All</button>'+
 DATA.map(function(c){return '<button class="chip '+(feedFilter===c.id?'active':'')+'" data-f="'+c.id+'">'+c.name+'</button>';}).join('');
 el.querySelectorAll('[data-f]').forEach(function(c){c.onclick=function(){feedFilter=c.dataset.f;renderFeedChips();renderFeedList();};});
}
function renderComposer(){
 document.getElementById('composer').innerHTML=
 '<div class="panel"><h4>Share your progress</h4>'+
 '<label class="field-label" for="postBiz">Business type</label><select id="postBiz">'+DATA.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('')+'</select>'+
 '<label class="field-label" for="postMilestone">Milestone</label><select id="postMilestone">'+MILESTONES.map(function(m){return '<option>'+m+'</option>';}).join('')+'</select>'+
 '<label class="field-label" for="postText">What happened</label><textarea id="postText" placeholder="What worked this week, what did not, and where you are stuck"></textarea>'+
 '<button class="btn-primary" id="postBtn">Post to the feed</button><p class="hint" id="postHint"></p></div>';
 document.getElementById('postBtn').onclick=submitPost;
}
async function submitPost(){
 var hint=document.getElementById('postHint'),text=document.getElementById('postText').value.trim();
 if(text.length<5){hint.textContent='Write at least a sentence.';return;}
 if(text.length>600){hint.textContent='Keep it under 600 characters.';return;}
 var btn=document.getElementById('postBtn');btn.disabled=true;hint.textContent='Posting...';
 try{
  await loadFirestore();
  await firestoreModule.postToFeed({
   businessId:document.getElementById('postBiz').value,
   milestone:document.getElementById('postMilestone').value,
   text:text
  });
  document.getElementById('postText').value='';hint.textContent='Posted.';
 }catch(e){hint.textContent='Posting failed, try again.';}
 btn.disabled=false;
}
function cheerCount(p){return p.cheers?Object.keys(p.cheers).length:0;}
function renderFeedList(){
 var el=document.getElementById('feedList');if(!el)return;
 if(!feedLoaded){el.innerHTML='<p class="hint">Loading the feed...</p>';return;}
 var q=feedSearch.trim().toLowerCase();
 var list=feedPosts.filter(function(p){
  if(feedFilter!=='all'&&p.businessId!==feedFilter)return false;
  if(q&&(String(p.text)+' '+String(p.milestone)).toLowerCase().indexOf(q)===-1)return false;
  return true;});
 if(feedSort==='top')list=list.slice().sort(function(a,b){return cheerCount(b)-cheerCount(a);});
 if(!list.length){el.innerHTML='<p class="hint">No posts here yet. Be the first.</p>';return;}
 el.innerHTML=list.map(function(p){
  var cat=DATA.find(function(c){return c.id===p.businessId;})||{name:'General',color:'#6C7BD1'};
  var nm=p.authorName||'Someone in the community';
  var mine=p.cheers&&currentUser&&p.cheers[currentUser.uid];
  return '<div class="panel"><div class="post-top">'+
  '<span class="post-tag" style="background:'+cat.color+'">'+cat.name+'</span>'+
  '<span class="muted-xs">'+esc(p.milestone||'')+'</span>'+
  '<span class="muted-xs ml">'+timeAgo(p.createdAt)+'</span></div>'+
  '<p style="font-size:14px;margin:0 0 10px">'+esc(p.text)+'</p>'+
  '<div class="post-foot"><span class="muted-xs">'+esc(nm)+'</span>'+
  '<button class="pill cheer '+(mine?'on':'')+'" data-cheer="'+p._id+'">🔥 '+cheerCount(p)+'</button></div></div>';
 }).join('');
 el.querySelectorAll('[data-cheer]').forEach(function(b){b.onclick=function(){cheer(b.dataset.cheer);};});
}
async function cheer(id){
 if(!currentUser)return;
 var p=feedPosts.find(function(x){return x._id===id;});if(!p)return;
 try{
  await loadFirestore();
  await firestoreModule.toggleCheer(id,p.cheers);
 }catch(e){}
}
function timeAgo(ts){
 if(!ts)return '';var m=Math.floor((Date.now()-ts)/60000);
 if(m<1)return 'just now';if(m<60)return m+'m ago';
 var h=Math.floor(m/60);if(h<24)return h+'h ago';
 return Math.floor(h/24)+'d ago';
}

/* ---------- leaderboard ---------- */
let leaderboardModule=null,leaderboardEntries=[],leaderboardLoaded=false,leaderboardUnsub=null;
async function loadLeaderboard(){
 if(!leaderboardModule)leaderboardModule=await import('./leaderboard-integration.js');
 return leaderboardModule;
}
function stopLeaderboardWatch(){if(leaderboardUnsub){try{leaderboardUnsub();}catch(e){}leaderboardUnsub=null;}leaderboardLoaded=false;leaderboardEntries=[];}
function safeUrl(u){
 try{var p=new URL(u,window.location.href);if(p.protocol==='http:'||p.protocol==='https:')return p.href;}catch(e){}
 return null;
}
async function startLeaderboardWatch(){
 if(leaderboardUnsub)return;
 try{
  await loadLeaderboard();
  leaderboardUnsub=leaderboardModule.watchLeaderboard(function(entries){
   leaderboardEntries=entries;leaderboardLoaded=true;renderLeaderboardList();
  });
 }catch(e){
  var el=document.getElementById('lbList');
  if(el)el.innerHTML='<p class="hint">The leaderboard is not available right now. Try again later.</p>';
 }
}
function renderLeaderboardList(){
 var el=document.getElementById('lbList');if(!el)return;
 if(!leaderboardLoaded){el.innerHTML='<p class="hint">Loading...</p>';return;}
 if(!leaderboardEntries.length){el.innerHTML='<p class="hint">No entries yet. Be the first.</p>';return;}
 el.innerHTML=leaderboardEntries.map(function(e,i){
  var proof=safeUrl(e.proofUrl);
  return '<div class="panel"><div class="post-top">'+
  '<span class="post-tag" style="background:var(--accent)">#'+(i+1)+'</span>'+
  '<span class="muted-xs">'+esc(e.businessName||'')+'</span>'+
  '<span class="muted-xs ml">self-reported</span></div>'+
  '<p style="font-size:14px;margin:0 0 6px"><b>'+esc(String(e.salesCount))+'</b> sales — '+esc(e.displayName||'Someone in the community')+'</p>'+
  (proof?'<a class="pill" target="_blank" rel="noopener" href="'+esc(proof)+'">View store</a>':'')+
  '</div>';
 }).join('');
}
function renderLeaderboard(){
 document.getElementById('view-leaderboard').innerHTML=
 '<div class="hero"><h1 class="sm">Leaderboard</h1><p>Active businesses and reported sales. Every number here is <b>self-reported</b> by the person who entered it, not independently verified — treat it as a rough signal, not a certified fact.</p></div>'+
 '<div class="panel"><h4>Add or update your entry</h4>'+
  '<p class="hint">'+esc(consentNotice('leaderboard','Your entry — including your name, business type, reported sales figure and any link you provide — will be visible to all signed-in users. Sales figures are self-reported and are not verified by us.'))+'</p>'+
  '<label class="field-label" for="lbBiz">Business type</label>'+
  '<select id="lbBiz">'+DATA.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('')+'</select>'+
  '<label class="field-label" for="lbSales">Sales so far (self-reported)</label>'+
  '<input type="number" id="lbSales" placeholder="Sales so far" min="0">'+
  '<label class="field-label" for="lbProof">Link to your store (optional, adds credibility)</label>'+
  '<input type="text" id="lbProof" placeholder="https://...">'+
  '<button class="btn-primary" id="lbSubmit">Update my entry</button>'+
  '<p class="hint" id="lbHint"></p></div>'+
 '<div id="lbList"><p class="hint">Loading...</p></div>';
 document.getElementById('lbSubmit').onclick=async function(){
  var hint=document.getElementById('lbHint');
  var sales=parseInt(document.getElementById('lbSales').value,10);
  if(!Number.isFinite(sales)||sales<0){hint.textContent='Enter a sales count of 0 or more.';return;}
  var bizId=document.getElementById('lbBiz').value;
  var biz=DATA.find(function(c){return c.id===bizId;});
  hint.textContent='Saving...';
  try{
   await loadLeaderboard();
   await leaderboardModule.submitLeaderboardEntry({
    businessId:bizId,
    businessName:biz?biz.name:bizId,
    salesCount:sales,
    proofUrl:document.getElementById('lbProof').value.trim()
   });
   hint.textContent='Updated.';
  }catch(e){hint.textContent='Could not update — try again.';}
 };
 startLeaderboardWatch();
}

/* ---------- init ---------- */
document.getElementById('backBtn').onclick=function(){go('home');};
document.getElementById('brandHome').onclick=function(){go('home');};
initAuth();
loadLegal().catch(function(){});
// Businesses with a real chapters JSON at public/data/<id>.json.
DATA.map(function(c){return c.id;}).forEach(function(id){
 loadChapters(id).then(function(ch){
  if(ch&&!document.getElementById('view-home').hidden)renderHome();
 });
});
showView('home');
