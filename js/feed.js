let feedPosts = [], feedFilter = 'all', feedSearch = '', feedSort = 'new';
let feedDb = null, feedUser = null, myId = null, canWrite = null, nameCache = {};

async function initFeed(){
  if(feedDb !== null) return;
  feedDb = await claude.use('db');
  feedUser = await claude.use('user');
  if(feedUser){
    try{ myId = await feedUser.id(); }catch(e){}
    try{ canWrite = await feedUser.can('data.write'); }catch(e){}
  }
  if(!feedDb) return;
  try{
    feedDb.collection('posts').orderBy('createdAt','desc').limit(100).onSnapshot(function(snap){
      feedPosts = snap.docs.map(function(d){ var o = d.data()||{}; o._id = d.id; return o; });
      resolveNames();
      renderFeedList();
    }, function(){ renderFeedList(); });
  }catch(e){}
}
async function resolveNames(){
  if(!feedUser) return;
  var ids = feedPosts.map(function(p){ return p.authorId; }).filter(function(x){ return x && !(x in nameCache); });
  if(!ids.length) return;
  try{
    var ps = await feedUser.profiles(Array.from(new Set(ids)));
    Object.keys(ps||{}).forEach(function(k){ nameCache[k] = (ps[k] && ps[k].name) || ''; });
    renderFeedList();
  }catch(e){}
}

function renderFeed(){
  document.getElementById('view-feed').innerHTML =
    '<div class="hero"><h1 class="sm">הפיד</h1><p>מה אחרים בונים עכשיו. שתפו התקדמות, שאלו כשאתם תקועים, ותראו שאתם לא היחידים שנתקעים.</p></div>'+
    '<div class="panel" style="border-right:3px solid #F4B740"><p style="font-size:13.3px;color:var(--text-muted)">הפוסטים גלויים לכל מי שמשתמש באפליקציה. אל תפרסמו שם מלא, טלפון, כתובת או פרטי תשלום.</p></div>'+
    '<div id="composer"></div>'+
    '<p class="section-label">סינון</p>'+
    '<input type="text" id="feedSearch" placeholder="חיפוש חופשי בפיד..." value="'+esc(feedSearch)+'">'+
    '<div class="chip-row" id="feedChips"></div>'+
    '<div class="chip-row" id="sortChips">'+
      '<div class="chip '+(feedSort==='new'?'active':'')+'" data-sort="new">הכי חדש</div>'+
      '<div class="chip '+(feedSort==='top'?'active':'')+'" data-sort="top">הכי מעודד</div>'+
    '</div>'+
    '<div id="feedList"><p class="hint">טוען את הפיד...</p></div>';

  renderComposer(); renderFeedChips(); renderFeedList();
  document.getElementById('feedSearch').oninput = function(e){ feedSearch = e.target.value; renderFeedList(); };
  document.querySelectorAll('#sortChips .chip').forEach(function(c){
    c.onclick = function(){ feedSort = c.dataset.sort; renderFeed(); };
  });
  initFeed().then(renderFeedList);
}

function renderFeedChips(){
  var el = document.getElementById('feedChips');
  el.innerHTML = '<div class="chip '+(feedFilter==='all'?'active':'')+'" data-f="all">הכל</div>'+
    DATA.map(function(c){ return '<div class="chip '+(feedFilter===c.id?'active':'')+'" data-f="'+c.id+'">'+c.name+'</div>'; }).join('');
  el.querySelectorAll('.chip').forEach(function(c){
    c.onclick = function(){ feedFilter = c.dataset.f; renderFeedChips(); renderFeedList(); };
  });
}

function renderComposer(){
  document.getElementById('composer').innerHTML =
    '<div class="panel"><h4>לשתף התקדמות</h4>'+
    '<select id="postBiz" style="margin-bottom:10px">'+DATA.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('')+'</select>'+
    '<select id="postMilestone" style="margin-bottom:10px">'+MILESTONES.map(function(m){return '<option>'+m+'</option>';}).join('')+'</select>'+
    '<textarea id="postText" placeholder="מה קרה השבוע? מה עבד, מה לא, ואיפה אתה תקוע"></textarea>'+
    '<button class="btn-primary" id="postBtn">לפרסם בפיד</button>'+
    '<p class="hint" id="postHint"></p></div>';
  document.getElementById('postBtn').onclick = submitPost;
}

async function submitPost(){
  var hint = document.getElementById('postHint');
  var text = document.getElementById('postText').value.trim();
  if(text.length < 5){ hint.textContent = 'תכתוב לפחות משפט אחד.'; return; }
  if(text.length > 600){ hint.textContent = 'קצר מדי טוב יותר — עד 600 תווים.'; return; }
  var btn = document.getElementById('postBtn'); btn.disabled = true; hint.textContent = 'מפרסם...';
  await initFeed();
  if(!feedDb){ hint.textContent = 'הפיד לא זמין בתצוגה הזו.'; btn.disabled=false; return; }
  try{
    await feedDb.collection('posts').add({
      authorId: myId || 'anon',
      businessId: document.getElementById('postBiz').value,
      milestone: document.getElementById('postMilestone').value,
      text: text,
      cheers: {},
      createdAt: Date.now()
    });
    document.getElementById('postText').value = '';
    hint.textContent = 'פורסם.';
  }catch(e){
    hint.textContent = (e && e.code==='invalid_argument') ? 'אין לך הרשאת כתיבה לפיד בתצוגה הזו.' : 'הפרסום נכשל, נסה שוב.';
  }
  btn.disabled = false;
}

function renderFeedList(){
  var el = document.getElementById('feedList');
  if(!el) return;
  if(feedDb === null){ el.innerHTML = '<p class="hint">טוען את הפיד...</p>'; return; }
  if(!feedDb){ el.innerHTML = '<p class="hint">הפיד לא זמין בתצוגה הזו.</p>'; return; }

  var q = feedSearch.trim();
  var list = feedPosts.filter(function(p){
    if(feedFilter!=='all' && p.businessId!==feedFilter) return false;
    if(q && (String(p.text)+' '+String(p.milestone)).indexOf(q) === -1) return false;
    return true;
  });
  if(feedSort==='top') list = list.slice().sort(function(a,b){ return cheerCount(b)-cheerCount(a); });

  if(!list.length){ el.innerHTML = '<p class="hint">אין עדיין פוסטים כאן. תהיה הראשון.</p>'; return; }

  el.innerHTML = list.map(function(p){
    var cat = DATA.find(function(c){return c.id===p.businessId;}) || {name:'כללי', color:'#6C7BD1'};
    var nm = nameCache[p.authorId] || 'מישהו מהקהילה';
    var mine = p.cheers && myId && p.cheers[myId];
    return '<div class="panel">'+
      '<div style="display:flex;align-items:center;gap:9px;margin-bottom:9px;flex-wrap:wrap">'+
        '<span style="background:'+cat.color+';color:#14171C;font-size:11.5px;font-weight:700;padding:4px 9px;border-radius:9px">'+cat.name+'</span>'+
        '<span style="font-size:12px;color:var(--text-muted)">'+esc(p.milestone||'')+'</span>'+
        '<span style="font-size:11.5px;color:var(--text-muted);margin-right:auto">'+timeAgo(p.createdAt)+'</span>'+
      '</div>'+
      '<p style="font-size:14px;margin-bottom:10px">'+esc(p.text)+'</p>'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<span style="font-size:12.3px;color:var(--text-muted)">'+esc(nm)+'</span>'+
        '<span class="pill" data-cheer="'+p._id+'" style="margin-right:auto;padding:6px 11px;font-size:12.5px;'+(mine?'border-color:var(--text)':'')+'">🔥 '+cheerCount(p)+'</span>'+
      '</div></div>';
  }).join('');

  el.querySelectorAll('[data-cheer]').forEach(function(b){
    b.onclick = function(){ cheer(b.dataset.cheer); };
  });
}
function cheerCount(p){ return p.cheers ? Object.keys(p.cheers).length : 0; }
async function cheer(id){
  if(!feedDb || !myId) return;
  var p = feedPosts.find(function(x){return x._id===id;});
  if(!p) return;
  var c = Object.assign({}, p.cheers||{});
  if(c[myId]) delete c[myId]; else c[myId] = true;
  try{ await feedDb.doc('posts/'+id).update({cheers:c}); }catch(e){}
}
function timeAgo(ts){
  if(!ts) return '';
  var m = Math.floor((Date.now()-ts)/60000);
  if(m < 1) return 'עכשיו';
  if(m < 60) return 'לפני '+m+' דק׳';
  var h = Math.floor(m/60); if(h < 24) return 'לפני '+h+' שע׳';
  var d = Math.floor(h/24); return 'לפני '+d+' ימים';
}
