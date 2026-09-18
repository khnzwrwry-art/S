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
 // TODO (Stage 2): also sync `progress` to Firestore (data/users/{uid}/progress),
 // keyed by the Firebase Auth uid from auth.js, so it survives across devices.
}
function doneCount(id){return (progress[id]||[]).length;}
let activeCat=null,activeTab='intro',selectedType=CONTENT_TYPES[0].id,chatHistory=[],quizAnswers={};

const VIEWS=['home','category','content','assistant','templates','editing','glossary','quiz','feed','legal','terms','access','ages','visual'];
function showView(n){VIEWS.forEach(function(v){document.getElementById('view-'+v).hidden=(v!==n);});document.getElementById('backBtn').hidden=(n==='home');window.scrollTo(0,0);}
function go(n){showView(n);if(n==='home')renderHome();}

/* ---------- auth gate (Firebase Authentication) ---------- */
let authModule=null, currentUser=null, selectedCountry='';

function agreementKey(uid){return 'sg_agreement_'+uid;}
function getAgreement(uid){try{return JSON.parse(localStorage.getItem(agreementKey(uid))||'null');}catch(e){return null;}}
function saveAgreement(uid,rec){try{localStorage.setItem(agreementKey(uid),JSON.stringify(rec));}catch(e){}}

async function initAuth(){
 authModule=await import('./auth.js');
 authModule.watchAuthState(function(user){
  currentUser=user;
  if(!user){renderGate();return;}
  var rec=getAgreement(user.uid);
  if(rec){selectedCountry=rec.country||'';enterApp();}
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
   '<span>I have read and accept the <span class="link" id="gateTerms">Terms of Use</span>, including that the guides, templates and content in this app are copyright protected and <b>may not be copied, republished, resold or used to build a competing product</b>.</span></label>'+
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
 document.getElementById('gateGo').onclick=function(){
  var hint=document.getElementById('gateHint');
  var country=document.getElementById('gateCountry').value;
  if(!currentUser){hint.textContent='Sign in with Google first.';return;}
  if(!country){hint.textContent='Please select your country.';return;}
  if(!document.getElementById('agreeBox').checked){hint.textContent='You need to accept the Terms of Use to continue.';return;}
  selectedCountry=country;
  saveAgreement(currentUser.uid,{country:country,acceptedAt:Date.now(),email:currentUser.email||null});
  enterApp();
 };
}
function enterApp(){
 document.getElementById('gate').hidden=true;
 document.getElementById('app').hidden=false;
 renderHome();
}

/* ---------- home ---------- */
function renderHome(){
 var total=DATA.reduce(function(s,c){return s+c.steps.length;},0);
 var d=DATA.reduce(function(s,c){return s+doneCount(c.id);},0);
 var pct=total?Math.round(d/total*100):0,C=2*Math.PI*19;
 var tiles=[
  {k:'quiz',c:'#FF6B4A',i:I.compass,b:'Which business fits me?',s:'Five questions, three matches'},
  {k:'assistant',c:'#6C7BD1',i:I.spark,b:'AI mentor',s:'Ask anything about your business'},
  {k:'templates',c:'#2FB6A6',i:I.film,b:'Ad templates',s:'8 trending formats with scripts'},
  {k:'content',c:'#F4B740',i:I.chat,b:'AI content tool',s:'Captions, scripts, hashtags'},
  {k:'editing',c:'#EF6FA0',i:I.scissors,b:'Filming and editing',s:'Tools, rules and illustrated steps'},
  {k:'feed',c:'#4F9DDE',i:I.chat,b:'Community feed',s:'Search and filter by business type'},
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
  var dc=doneCount(cat.id),t=cat.steps.length,p=Math.round(dc/t*100);
  return '<button class="card" data-cat="'+cat.id+'"><span class="card-row"><span class="badge" style="background:'+cat.color+'">'+svg(cat.icon,19)+'</span><span class="age-tag">'+cat.age+'</span></span>'+
  '<span><h3>'+cat.name+'</h3><p>'+cat.desc+'</p></span>'+
  '<span class="w"><span class="mini-progress"><i style="width:'+p+'%;background:'+cat.color+'"></i></span><span class="mini-label">'+dc+'/'+t+' steps</span></span></button>';
 }).join('')+'</div>'+
 '<p class="hint" style="margin-top:24px;text-align:center"><span class="link" id="tLink">Terms of Use</span> · <span class="link" id="aLink">Accessibility statement</span> · <span class="link" id="soLink">Sign out</span></p>';

 document.getElementById('legalCard').onclick=function(){renderLegal();showView('legal');};
 document.getElementById('tLink').onclick=function(){renderTerms();showView('terms');};
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
   else if(k==='ages'){renderAges();showView('ages');}};
 });
 document.querySelectorAll('.card[data-cat]').forEach(function(el){el.onclick=function(){activeTab='intro';openCategory(el.dataset.cat);};});
}

/* ---------- category ---------- */
function openCategory(id){activeCat=DATA.find(function(c){return c.id===id;});if(!activeCat)return;renderCategory();showView('category');}
function renderCategory(){
 var cat=activeCat,dc=doneCount(cat.id),t=cat.steps.length;
 var body=activeTab==='intro'?introHtml(cat):activeTab==='steps'?stepsHtml(cat):platformsHtml(cat);
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
function bindCategory(){
 var cat=activeCat;
 var b=document.getElementById('startSteps');if(b)b.onclick=function(){activeTab='steps';renderCategory();};
 var a=document.getElementById('askCat');if(a)a.onclick=function(){renderAssistant('I want to start '+cat.name+'. Where do I begin, and what is the most common mistake?');showView('assistant');};
 document.querySelectorAll('.step-head').forEach(function(el){el.onclick=function(e){if(e.target.closest('[data-check]'))return;el.closest('.step').classList.toggle('open');};});
 document.querySelectorAll('[data-check]').forEach(function(el){
  var fn=function(e){e.stopPropagation();var i=parseInt(el.dataset.check,10);progress[cat.id]=progress[cat.id]||[];var k=progress[cat.id].indexOf(i);if(k>-1)progress[cat.id].splice(k,1);else progress[cat.id].push(i);saveProgress();renderCategory();};
  el.onclick=fn;el.onkeydown=function(e){if(e.key==='Enter'||e.key===' ')fn(e);};
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
 '<button class="btn-ghost full" id="toTerms">Read the Terms of Use</button>';
 document.getElementById('legalCountry').value=selectedCountry;
 document.getElementById('legalCountry').onchange=function(e){
  selectedCountry=e.target.value||'other';
  if(currentUser){
   var rec=getAgreement(currentUser.uid)||{};
   rec.country=selectedCountry;
   saveAgreement(currentUser.uid,rec);
  }
  renderLegal();
 };
 document.getElementById('toTerms').onclick=function(){renderTerms();showView('terms');};
}
function renderTerms(){
 document.getElementById('view-terms').innerHTML=
 '<div class="hero"><h1 class="sm">Terms of Use</h1><p>Last updated: September 2026</p></div>'+
 '<div class="panel warn"><p class="muted-sm">This is a working draft. Have a lawyer review and adapt it before the app goes live to the public.</p></div>'+
 panelList(TERMS);
}
function renderAccess(){
 document.getElementById('view-access').innerHTML=
 '<div class="hero"><h1 class="sm">Accessibility statement</h1><p>How this app is built to be usable by as many people as possible, and how to tell us when it is not.</p></div>'+
 panelList(ACCESSIBILITY);
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
 // TODO (Stage 3): replace this stub with a call to a Firebase Cloud Function
 // that calls the Anthropic API server-side (API key kept as a Firebase secret).
 // Was: var sample = await claude.use('sample'); (Claude-Artifact-runtime only, not available here)
 box.textContent='The AI content tool is not available yet in this build.';
 btn.disabled=false;
}

/* ---------- AI mentor ---------- */
function renderAssistant(prefill){
 var sug=['How do I find my first client?','How much money do I need to start?','How do I market with no budget?','Nobody is buying — what now?'];
 document.getElementById('view-assistant').innerHTML=
 '<div class="hero"><h1 class="sm">AI mentor</h1><p>Ask anything about your business — from the first step to the first customer. Direct answers, no promises.</p></div>'+
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
 // TODO (Stage 3): replace this stub with a call to a Firebase Cloud Function
 // that calls the Anthropic API server-side (API key kept as a Firebase secret).
 // Was: var sample = await claude.use('sample'); (Claude-Artifact-runtime only, not available here)
 chatHistory[chatHistory.length-1].content='The AI mentor is not available yet in this build.';
 renderChatLog();btn.disabled=false;
}

/* ---------- feed ---------- */
let feedPosts=[],feedFilter='all',feedSearch='',feedSort='new',feedDb=null,feedUser=null,myId=null,nameCache={};
async function initFeed(){
 if(feedDb!==null)return;
 // TODO (Stage 2): replace this stub with Firestore, using the same Firebase
 // project as auth.js (a "posts" collection) and the current Firebase Auth user
 // (currentUser from the gate) in place of feedUser.
 // Was: feedDb = await claude.use('db'); feedUser = await claude.use('user'); (Claude-Artifact-runtime only, not available here)
 feedDb=false;
 feedUser=null;
}
async function resolveNames(){
 if(!feedUser)return;
 var ids=feedPosts.map(function(p){return p.authorId;}).filter(function(x){return x&&!(x in nameCache);});
 if(!ids.length)return;
 try{var ps=await feedUser.profiles(Array.from(new Set(ids)));
  Object.keys(ps||{}).forEach(function(k){nameCache[k]=(ps[k]&&ps[k].name)||'';});renderFeedList();}catch(e){}
}
function renderFeed(){
 document.getElementById('view-feed').innerHTML=
 '<div class="hero"><h1 class="sm">Community feed</h1><p>What other people are building right now. Share progress, ask when you are stuck, and see that getting stuck is normal.</p></div>'+
 '<div class="panel warn"><p class="muted-sm">Posts are visible to everyone using the app. Never post your full name, phone number, address or payment details.</p></div>'+
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
 initFeed().then(renderFeedList);
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
 await initFeed();
 if(!feedDb){hint.textContent='The feed is not available in this view.';btn.disabled=false;return;}
 try{
  await feedDb.collection('posts').add({authorId:myId||'anon',businessId:document.getElementById('postBiz').value,
   milestone:document.getElementById('postMilestone').value,text:text,cheers:{},createdAt:Date.now()});
  document.getElementById('postText').value='';hint.textContent='Posted.';
 }catch(e){hint.textContent=(e&&e.code==='invalid_argument')?'You do not have permission to post in this view.':'Posting failed, try again.';}
 btn.disabled=false;
}
function cheerCount(p){return p.cheers?Object.keys(p.cheers).length:0;}
function renderFeedList(){
 var el=document.getElementById('feedList');if(!el)return;
 if(feedDb===null){el.innerHTML='<p class="hint">Loading the feed...</p>';return;}
 if(!feedDb){el.innerHTML='<p class="hint">The feed is not available in this view.</p>';return;}
 var q=feedSearch.trim().toLowerCase();
 var list=feedPosts.filter(function(p){
  if(feedFilter!=='all'&&p.businessId!==feedFilter)return false;
  if(q&&(String(p.text)+' '+String(p.milestone)).toLowerCase().indexOf(q)===-1)return false;
  return true;});
 if(feedSort==='top')list=list.slice().sort(function(a,b){return cheerCount(b)-cheerCount(a);});
 if(!list.length){el.innerHTML='<p class="hint">No posts here yet. Be the first.</p>';return;}
 el.innerHTML=list.map(function(p){
  var cat=DATA.find(function(c){return c.id===p.businessId;})||{name:'General',color:'#6C7BD1'};
  var nm=nameCache[p.authorId]||'Someone in the community';
  var mine=p.cheers&&myId&&p.cheers[myId];
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
 if(!feedDb||!myId)return;
 var p=feedPosts.find(function(x){return x._id===id;});if(!p)return;
 var c=Object.assign({},p.cheers||{});
 if(c[myId])delete c[myId];else c[myId]=true;
 try{await feedDb.doc('posts/'+id).update({cheers:c});}catch(e){}
}
function timeAgo(ts){
 if(!ts)return '';var m=Math.floor((Date.now()-ts)/60000);
 if(m<1)return 'just now';if(m<60)return m+'m ago';
 var h=Math.floor(m/60);if(h<24)return h+'h ago';
 return Math.floor(h/24)+'d ago';
}

/* ---------- init ---------- */
document.getElementById('backBtn').onclick=function(){go('home');};
document.getElementById('brandHome').onclick=function(){go('home');};
initAuth();
showView('home');
