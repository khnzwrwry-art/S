let activeCat = null, activeTab = 'intro', quizAnswers = {};

function showView(name){
  ['home','category','content','assistant','templates','editing','glossary','basics','quiz','feed','legal','terms','visual'].forEach(function(v){
    document.getElementById('view-'+v).hidden = (v!==name);
  });
  document.getElementById('backBtn').hidden = (name==='home');
  window.scrollTo(0,0);
}
function go(name){ showView(name); if(name==='home') renderHome(); }

/* ---------- HOME ---------- */
function renderHome(){
  var total = DATA.reduce(function(s,c){return s+c.steps.length;},0);
  var d = DATA.reduce(function(s,c){return s+done(c.id);},0);
  var pct = total ? Math.round(d/total*100) : 0;
  var C = 2*Math.PI*19;

  var tiles = [
    {k:'quiz', c:'#FF6B4A', i:I.compass, b:'איזה עסק מתאים לי?', s:'4 שאלות קצרות והמלצה אישית'},
    {k:'assistant', c:'#6C7BD1', i:I.spark, b:'מנטור AI', s:'שאל כל שאלה על העסק שלך'},
    {k:'templates', c:'#2FB6A6', i:I.film, b:'טמפלטים לפרסומות', s:'8 פורמטים טרנדיים עם תסריט מוכן'},
    {k:'content', c:'#F4B740', i:I.chat, b:'כלי תוכן AI', s:'כיתובים, תסריטים והאשטגים'},
    {k:'editing', c:'#EF6FA0', i:I.scissors, b:'איך לערוך סרטון', s:'כלים, כללים וסדר פעולות'},
    {k:'glossary', c:'#A8C94A', i:I.bookmark, b:'מילון מונחים', s:'כל המילים שלא הבנת'},
    {k:'feed', c:'#4F9DDE', i:I.chat, b:'הפיד', s:'מה אחרים בונים — עם חיפוש וסינון'},
    {k:'legal', c:'#9B8AFB', i:I.shield, b:'הצד המשפטי', s:'גיל, מס, זכויות יוצרים ותקנון'}
  ];

  document.getElementById('view-home').innerHTML =
    '<div class="hero"><h1>מהרעיון לעסק הראשון שלך</h1>'+
    '<p>שמונה מסלולים אמיתיים, עם הסבר מלא לפני שמתחילים, שלבים ברורים, שיעורי וידאו וכלי AI לכל שלב.</p></div>'+

    '<div class="progress-strip">'+
      '<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="var(--surface-2)" stroke-width="5"/>'+
      '<circle cx="23" cy="23" r="19" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'" stroke-linecap="round" transform="rotate(-90 23 23)"/></svg>'+
      '<div class="info"><b>'+pct+'% מהדרך</b><span>'+d+' מתוך '+total+' שלבים הושלמו</span></div>'+
    '</div>'+

    '<div class="panel" style="border-right:3px solid #F4B740;cursor:pointer" id="basicsCard">'+
      '<h4>לפני שמתחילים — קרא את זה</h4>'+
      '<p style="font-size:13.5px;color:var(--text-muted)">גיל, הורים, מיסים, כמה מותר להפסיד ואיך לא ליפול על הבטחות. שבע נקודות חובה לכל מי שמתחיל עסק לפני גיל 18.</p>'+
    '</div>'+

    '<p class="section-label">כלים</p>'+
    '<div class="nav-tiles">'+ tiles.map(function(t){
      return '<div class="tile" data-go="'+t.k+'"><div class="g" style="background:'+t.c+'">'+svg(t.i,19)+'</div><div><b>'+t.b+'</b><span>'+t.s+'</span></div></div>';
    }).join('') +'</div>'+

    '<p class="section-label">שמונה מסלולי עסק</p>'+
    '<div class="grid">'+ DATA.map(function(cat){
      var dc = done(cat.id), t = cat.steps.length, p = Math.round(dc/t*100);
      return '<div class="card" data-cat="'+cat.id+'">'+
        '<div class="badge" style="background:'+cat.color+'">'+svg(cat.icon,19)+'</div>'+
        '<div><h3>'+cat.name+'</h3><p>'+cat.desc+'</p></div>'+
        '<div><div class="mini-progress"><i style="width:'+p+'%;background:'+cat.color+'"></i></div>'+
        '<span class="mini-label">'+dc+'/'+t+' שלבים</span></div></div>';
    }).join('') +'</div>'+
    '<p class="hint" style="margin-top:22px;text-align:center"><span id="termsLink" style="text-decoration:underline;cursor:pointer">תקנון ותנאי שימוש</span></p>';
  document.getElementById('termsLink').onclick = function(){ renderTerms(); showView('terms'); };

  document.getElementById('basicsCard').onclick = function(){ renderBasics(); showView('basics'); };
  document.querySelectorAll('[data-go]').forEach(function(el){
    el.onclick = function(){
      var k = el.dataset.go;
      if(k==='quiz'){ renderQuiz(); showView('quiz'); }
      else if(k==='assistant'){ renderAssistant(); showView('assistant'); }
      else if(k==='templates'){ renderTemplates(); showView('templates'); }
      else if(k==='content'){ renderContentTool(); showView('content'); }
      else if(k==='editing'){ renderEditing(); showView('editing'); }
      else if(k==='glossary'){ renderGlossary(); showView('glossary'); }
      else if(k==='feed'){ renderFeed(); showView('feed'); }
      else if(k==='legal'){ renderLegal(); showView('legal'); }
    };
  });
  document.querySelectorAll('.card[data-cat]').forEach(function(el){
    el.onclick = function(){ activeTab='intro'; openCategory(el.dataset.cat); };
  });
}

/* ---------- CATEGORY ---------- */
function openCategory(id){
  activeCat = DATA.find(function(c){return c.id===id;});
  if(!activeCat) return;
  renderCategory();
  showView('category');
}

function renderCategory(){
  var cat = activeCat, dc = done(cat.id), t = cat.steps.length;
  var head =
    '<div class="cat-hero">'+
      '<div class="badge badge-lg" style="background:'+cat.color+'">'+svg(cat.icon,25)+'</div>'+
      '<h2>'+cat.name+'</h2><p>'+cat.desc+'</p>'+
    '</div>'+
    '<div class="tabs">'+
      '<div class="tab '+(activeTab==='intro'?'active':'')+'" data-tab="intro">מה זה בדיוק</div>'+
      '<div class="tab '+(activeTab==='steps'?'active':'')+'" data-tab="steps">שלבים ('+dc+'/'+t+')</div>'+
    '</div>';

  var body = activeTab==='intro' ? introHtml(cat) : stepsHtml(cat);
  document.getElementById('view-category').innerHTML = head + body;

  document.querySelectorAll('.tab').forEach(function(el){
    el.onclick = function(){ activeTab = el.dataset.tab; renderCategory(); };
  });
  bindCategoryEvents();
}

function introHtml(cat){
  var x = cat.intro;
  return '<a class="lesson" target="_blank" rel="noopener" href="'+yt(cat.video)+'">'+
      '<div class="play">'+svg('<path d="M9 7l8 5-8 5V7z"/>',17)+'</div>'+
      '<div><b>שיעור וידאו: '+cat.name+' מאפס</b><span>הסבר מלא בווידאו לפני שמתחילים</span></div></a>'+

    '<div class="panel"><h4>מה זה בדיוק</h4><p>'+x.what+'</p></div>'+
    '<div class="panel"><h4>איך בדיוק מרוויחים כסף</h4><p>'+x.money+'</p></div>'+
    '<div class="facts">'+
      '<div class="fact"><span>כמה כסף צריך להתחלה</span><b>'+x.cost+'</b></div>'+
      '<div class="fact"><span>כמה זמן בשבוע</span><b>'+x.time+'</b></div>'+
    '</div>'+
    '<div class="panel"><h4>כמה באמת אפשר להרוויח</h4><p>'+x.income+'</p></div>'+
    '<div class="panel warn"><h4>הסיכון שצריך להכיר</h4><p>'+x.risk+'</p></div>'+
    '<div class="panel"><h4>למי זה מתאים</h4><p>'+x.fit+'</p></div>'+
    '<button class="btn-primary" id="startSteps" style="margin-top:6px">מתחילים — לשלבים</button>'+
    '<button class="btn-ghost" id="askAboutCat" style="width:100%;margin-top:9px">לשאול את המנטור על '+cat.name+'</button>';
}

function stepsHtml(cat){
  return cat.steps.map(function(s,i){
    var isDone = (progress[cat.id]||[]).indexOf(i)>-1;
    return '<div class="step" data-idx="'+i+'">'+
      '<div class="step-head">'+
        '<div class="step-check '+(isDone?'done':'')+'" data-check="'+i+'" style="'+(isDone?'background:'+cat.color:'')+'">'+
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'+
        '<span class="step-num">0'+(i+1)+'</span>'+
        '<span class="step-title '+(isDone?'done':'')+'">'+s.title+'</span>'+
        '<span class="chev">'+svg('<path d="M6 9l6 6 6-6"/>',16)+'</span>'+
      '</div>'+
      '<div class="step-body">'+
        '<p>'+s.text+'</p>'+
        '<div class="row-links">'+
          '<a class="pill" target="_blank" rel="noopener" href="'+yt(s.video)+'">'+svg(I.play,14)+' שיעור וידאו</a>'+
          '<span class="pill" data-ask="'+i+'">'+svg(I.spark,14)+' לשאול את המנטור</span>'+
        '</div>'+
        '<div class="ai-tool"><div class="dot" style="background:'+cat.color+'"></div>'+
          '<div><b>כלי AI לשלב הזה: '+s.tool+'</b><span>'+s.toolUse+'</span></div></div>'+
      '</div></div>';
  }).join('');
}

function bindCategoryEvents(){
  var cat = activeCat;
  var startBtn = document.getElementById('startSteps');
  if(startBtn) startBtn.onclick = function(){ activeTab='steps'; renderCategory(); };
  var askCat = document.getElementById('askAboutCat');
  if(askCat) askCat.onclick = function(){
    renderAssistant('אני רוצה להתחיל '+cat.name+'. תסביר לי מאיפה מתחילים ומה הטעות הכי נפוצה.');
    showView('assistant');
  };
  document.querySelectorAll('.step-head').forEach(function(el){
    el.onclick = function(e){
      if(e.target.closest('[data-check]')) return;
      el.closest('.step').classList.toggle('open');
    };
  });
  document.querySelectorAll('[data-check]').forEach(function(el){
    el.onclick = function(e){
      e.stopPropagation();
      var i = parseInt(el.dataset.check,10);
      progress[cat.id] = progress[cat.id]||[];
      var k = progress[cat.id].indexOf(i);
      if(k>-1) progress[cat.id].splice(k,1); else progress[cat.id].push(i);
      saveProgress(); renderCategory();
    };
  });
  document.querySelectorAll('[data-ask]').forEach(function(el){
    el.onclick = function(){
      var s = cat.steps[parseInt(el.dataset.ask,10)];
      renderAssistant('אני ב'+cat.name+', בשלב "'+s.title+'". תסביר לי בדיוק איך עושים את זה צעד אחר צעד.');
      showView('assistant');
    };
  });
}

/* ---------- BASICS ---------- */
function renderBasics(){
  document.getElementById('view-basics').innerHTML =
    '<div class="hero"><h1 class="sm">לפני שמתחילים</h1><p>הדברים שאף אחד לא מספר לך בסרטוני "תרוויח 10,000 בחודש". קרא לפני שאתה משקיע שקל או שעה.</p></div>'+
    BASICS.map(function(b){ return '<div class="panel"><h4>'+b.t+'</h4><p>'+b.d+'</p></div>'; }).join('');
}

/* ---------- QUIZ ---------- */
function renderQuiz(){
  var html = '<div class="hero"><h1 class="sm">איזה עסק מתאים לך?</h1><p>ארבע שאלות. אין תשובה נכונה — רק התאמה למצב שלך היום.</p></div>';
  QUIZ.forEach(function(q,qi){
    html += '<div class="quiz-q"><b>'+(qi+1)+'. '+q.q+'</b>'+
      q.opts.map(function(o,oi){
        return '<div class="quiz-opt '+(quizAnswers[qi]===oi?'sel':'')+'" data-q="'+qi+'" data-o="'+oi+'">'+o.t+'</div>';
      }).join('')+'</div>';
  });
  html += '<button class="btn-primary" id="quizSubmit">מצא לי התאמה</button><div id="quizResult"></div>';
  document.getElementById('view-quiz').innerHTML = html;

  document.querySelectorAll('.quiz-opt').forEach(function(el){
    el.onclick = function(){
      quizAnswers[parseInt(el.dataset.q,10)] = parseInt(el.dataset.o,10);
      renderQuiz();
    };
  });
  document.getElementById('quizSubmit').onclick = function(){
    if(Object.keys(quizAnswers).length < QUIZ.length){
      document.getElementById('quizResult').innerHTML = '<p class="hint">ענה על כל ארבע השאלות כדי לקבל התאמה.</p>';
      return;
    }
    var scores = {};
    QUIZ.forEach(function(q,qi){
      var s = q.opts[quizAnswers[qi]].s;
      Object.keys(s).forEach(function(k){ scores[k] = (scores[k]||0)+s[k]; });
    });
    var ranked = Object.keys(scores).sort(function(a,b){ return scores[b]-scores[a]; }).slice(0,3);
    document.getElementById('quizResult').innerHTML =
      '<p class="section-label">שלוש ההתאמות הכי טובות עבורך</p>'+
      ranked.map(function(id,i){
        var c = DATA.find(function(x){return x.id===id;});
        return '<div class="card" data-cat="'+id+'" style="margin-bottom:9px">'+
          '<div class="badge" style="background:'+c.color+'">'+svg(c.icon,19)+'</div>'+
          '<div><h3>'+(i+1)+'. '+c.name+'</h3><p>'+c.desc+'</p></div></div>';
      }).join('');
    document.querySelectorAll('#quizResult .card').forEach(function(el){
      el.onclick = function(){ activeTab='intro'; openCategory(el.dataset.cat); };
    });
    document.getElementById('quizResult').scrollIntoView({behavior:'smooth'});
  };
}

/* ---------- TEMPLATES ---------- */
function renderTemplates(){
  document.getElementById('view-templates').innerHTML =
    '<div class="hero"><h1 class="sm">טמפלטים לפרסומות</h1><p>שמונה פורמטים שעובדים ברשתות היום. לכל אחד מבנה, תסריט לדוגמה וטיפ עריכה — ואפשר לבקש גרסה מותאמת לעסק שלך.</p></div>'+
    TEMPLATES.map(function(t,i){
      return '<div class="tpl" data-t="'+i+'">'+
        '<div class="tpl-head"><span class="n">0'+(i+1)+'</span><div><b>'+t.name+'</b><span>'+t.platform+' · '+t.why+'</span></div></div>'+
        '<div class="tpl-body">'+
          t.beats.map(function(b){ return '<div class="beat"><i>'+b[0]+'</i><div>'+b[1]+'</div></div>'; }).join('')+
          '<div class="script">'+esc(t.script)+'</div>'+
          '<div class="ai-tool"><div class="dot" style="background:var(--accent)"></div><div><b>טיפ עריכה</b><span>'+t.tip+'</span></div></div>'+
          '<button class="btn-ghost" style="width:100%;margin-top:12px" data-fill="'+i+'">להתאים את הטמפלט לעסק שלי</button>'+
        '</div></div>';
    }).join('');

  document.querySelectorAll('.tpl-head').forEach(function(el){
    el.onclick = function(){ el.closest('.tpl').classList.toggle('open'); };
  });
  document.querySelectorAll('[data-fill]').forEach(function(el){
    el.onclick = function(){
      var t = TEMPLATES[parseInt(el.dataset.fill,10)];
      renderContentTool('כתוב לי גרסה מלאה של הפורמט "'+t.name+'" לעסק שלי, לפי המבנה הזה: '+t.beats.map(function(b){return b[0]+' — '+b[1];}).join(' | '));
      showView('content');
    };
  });
}

/* ---------- EDITING GUIDE ---------- */
function renderEditing(){
  document.getElementById('view-editing').innerHTML =
    '<div class="hero"><h1 class="sm">איך לערוך וליצור</h1><p>הכל בטלפון, בחינם. אלה הכלים, הכללים וסדר הפעולות שמייצרים סרטון שאנשים לא מדלגים עליו.</p></div>'+

    '<p class="section-label">הכלים</p>'+
    EDITING.tools.map(function(t){ return '<div class="panel"><h4>'+t.n+'</h4><p style="font-size:13.6px">'+t.d+'</p></div>'; }).join('')+

    '<p class="section-label">שישה כללים שמשנים הכל</p>'+
    EDITING.rules.map(function(r){ return '<div class="panel"><h4>'+r[0]+'</h4><p style="font-size:13.6px">'+r[1]+'</p></div>'; }).join('')+

    '<p class="section-label">סדר עבודה לעריכת סרטון</p>'+
    '<div class="panel">'+EDITING.flow.map(function(f,i){
      return '<div class="beat"><i>שלב '+(i+1)+'</i><div>'+f+'</div></div>';
    }).join('')+'</div>'+

    '<p class="section-label">טעויות נפוצות</p>'+
    '<div class="panel">'+EDITING.mistakes.map(function(m){
      return '<div class="beat"><i>✕</i><div>'+m+'</div></div>';
    }).join('')+'</div>'+
    '<button class="btn-primary" id="toVisual" style="margin-top:12px">לראות איך זה נראה על המסך</button>';
  document.getElementById('toVisual').onclick = function(){ renderVisualGuide(); showView('visual'); };
}

/* ---------- GLOSSARY ---------- */
function renderGlossary(){
  document.getElementById('view-glossary').innerHTML =
    '<div class="hero"><h1 class="sm">מילון מונחים</h1><p>כל מילה שתשמע בסרטונים על עסקים — בעברית פשוטה.</p></div>'+
    GLOSSARY.map(function(g){ return '<div class="glossary-item"><b>'+g[0]+'</b><span>'+g[1]+'</span></div>'; }).join('');
}

/* ---- visual guides (SVG illustrations) ---- */
function phoneFrame(inner, label){
  return '<svg viewBox="0 0 160 300" width="100%" style="max-width:150px" xmlns="http://www.w3.org/2000/svg">'+
    '<rect x="6" y="6" width="148" height="288" rx="20" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/>'+
    '<rect x="14" y="16" width="132" height="268" rx="14" fill="var(--surface)" stroke="var(--border)"/>'+
    '<rect x="62" y="20" width="36" height="5" rx="2.5" fill="var(--border)"/>'+ inner +'</svg>'+
    (label?'<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;text-align:center">'+label+'</div>':'');
}
const VISUALS = [
  {t:'1. הוק על המסך בשנייה הראשונה',
   d:'הטקסט הכי חשוב יושב בשליש העליון, גדול, קריא ב-2 שניות. לא בתחתית — שם הממשק של הרשת מכסה אותו.',
   svg:phoneFrame(
     '<rect x="22" y="60" width="116" height="40" rx="8" fill="#FF6B4A" opacity=".9"/>'+
     '<rect x="32" y="72" width="80" height="6" rx="3" fill="#14171C" opacity=".75"/>'+
     '<rect x="32" y="84" width="54" height="6" rx="3" fill="#14171C" opacity=".75"/>'+
     '<circle cx="80" cy="170" r="26" fill="var(--surface-2)"/>'+
     '<rect x="24" y="250" width="70" height="5" rx="2.5" fill="var(--border)"/>'+
     '<rect x="24" y="262" width="46" height="5" rx="2.5" fill="var(--border)"/>'+
     '<rect x="118" y="160" width="20" height="90" rx="6" fill="var(--surface-2)"/>', 'שליש עליון = אזור ההוק')},
  {t:'2. חיתוכים כל 2–3 שניות',
   d:'בציר הזמן: כל מלבן הוא קטע קצר. סרטון טוב מורכב מהרבה קטעים קצרים, לא מטייק ארוך אחד.',
   svg:'<svg viewBox="0 0 320 110" width="100%" xmlns="http://www.w3.org/2000/svg">'+
     '<rect x="0" y="20" width="320" height="34" rx="6" fill="var(--surface-2)"/>'+
     [0,1,2,3,4,5].map(function(i){ return '<rect x="'+(4+i*52)+'" y="24" width="46" height="26" rx="4" fill="#2FB6A6" opacity="'+(0.55+i*0.06)+'"/>'; }).join('')+
     '<rect x="0" y="62" width="320" height="18" rx="5" fill="var(--surface-2)"/>'+
     '<rect x="4" y="65" width="312" height="12" rx="4" fill="#9B8AFB" opacity=".45"/>'+
     '<text x="316" y="14" font-size="10" fill="var(--text-muted)" text-anchor="end" font-family="Inter">וידאו</text>'+
     '<text x="316" y="95" font-size="10" fill="var(--text-muted)" text-anchor="end" font-family="Inter">מוזיקה — 20% עוצמה</text></svg>'},
  {t:'3. כתוביות במרכז-תחתון',
   d:'שתי שורות לכל היותר, גופן עבה, רקע כהה מאחורי הטקסט. בלי זה רוב הצופים לא מבינים כלום כי הם גוללים בלי סאונד.',
   svg:phoneFrame(
     '<circle cx="80" cy="120" r="30" fill="var(--surface-2)"/>'+
     '<rect x="26" y="196" width="108" height="16" rx="5" fill="#14171C" opacity=".82"/>'+
     '<rect x="34" y="201" width="92" height="6" rx="3" fill="#F1F1EE"/>'+
     '<rect x="42" y="216" width="76" height="16" rx="5" fill="#14171C" opacity=".82"/>'+
     '<rect x="50" y="221" width="60" height="6" rx="3" fill="#F1F1EE"/>', 'אזור בטוח לכתוביות')},
  {t:'4. פורמט מלא מסך 9:16',
   d:'משמאל נכון, מימין טעות. סרטון מרובע עם פסים שחורים נראה מיד כמו העתקה מפלטפורמה אחרת ומקבל פחות הפצה.',
   svg:'<svg viewBox="0 0 320 180" width="100%" xmlns="http://www.w3.org/2000/svg">'+
     '<rect x="14" y="10" width="92" height="160" rx="10" fill="#2FB6A6" opacity=".25" stroke="#2FB6A6" stroke-width="2"/>'+
     '<text x="60" y="95" font-size="12" fill="var(--text)" text-anchor="middle" font-family="Inter">9:16 ✓</text>'+
     '<rect x="200" y="10" width="92" height="160" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/>'+
     '<rect x="200" y="56" width="92" height="68" fill="#EF6FA0" opacity=".3"/>'+
     '<text x="246" y="95" font-size="12" fill="var(--text)" text-anchor="middle" font-family="Inter">פסים ✕</text></svg>'},
  {t:'5. קריאה לפעולה אחת בסוף',
   d:'מסך אחרון פשוט עם בקשה אחת בלבד: תגובה, שמירה או קליק. שלוש בקשות = אפס פעולות.',
   svg:phoneFrame(
     '<rect x="30" y="120" width="100" height="30" rx="8" fill="#6C7BD1" opacity=".9"/>'+
     '<rect x="44" y="131" width="72" height="8" rx="4" fill="#14171C" opacity=".7"/>'+
     '<rect x="46" y="164" width="68" height="6" rx="3" fill="var(--border)"/>', 'בקשה אחת, במרכז')},
  {t:'6. ייצוא והעלאה',
   d:'לייצא ב-1080p ובקצב פריימים מקורי, ולהעלות דרך האפליקציה של הרשת עצמה. העלאה דרך "שיתוף" מכווצת את האיכות.',
   svg:'<svg viewBox="0 0 320 120" width="100%" xmlns="http://www.w3.org/2000/svg">'+
     '<rect x="10" y="30" width="86" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>'+
     '<text x="53" y="63" font-size="11" fill="var(--text)" text-anchor="middle" font-family="Inter">1080p</text>'+
     '<path d="M104 58h38" stroke="var(--text-muted)" stroke-width="2"/><path d="M136 52l8 6-8 6" fill="none" stroke="var(--text-muted)" stroke-width="2"/>'+
     '<rect x="150" y="30" width="72" height="56" rx="10" fill="#A8C94A" opacity=".3" stroke="#A8C94A"/>'+
     '<text x="186" y="63" font-size="11" fill="var(--text)" text-anchor="middle" font-family="Inter">אפליקציה ✓</text>'+
     '<rect x="232" y="30" width="78" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>'+
     '<text x="271" y="63" font-size="11" fill="var(--text-muted)" text-anchor="middle" font-family="Inter">שיתוף ✕</text></svg>'}
];

/* ---------- LEGAL / TERMS / VISUAL GUIDE VIEWS ---------- */
function renderLegal(){
  document.getElementById('view-legal').innerHTML =
    '<div class="hero"><h1 class="sm">הצד המשפטי</h1><p>מה מותר, מה חייבים ומה מסוכן כשמקימים עסק לפני גיל 18 בישראל. הסבר כללי — לא ייעוץ משפטי.</p></div>'+
    LEGAL.map(function(l){ return '<div class="panel"><h4>'+l.t+'</h4><p style="font-size:13.7px">'+l.d+'</p></div>'; }).join('')+
    '<button class="btn-ghost" id="toTerms" style="width:100%;margin-top:10px">לקרוא את התקנון של האפליקציה</button>';
  document.getElementById('toTerms').onclick = function(){ renderTerms(); showView('terms'); };
}
function renderTerms(){
  document.getElementById('view-terms').innerHTML =
    '<div class="hero"><h1 class="sm">תקנון ותנאי שימוש</h1><p>עודכן לאחרונה: ספטמבר 2026</p></div>'+
    '<div class="panel" style="border-right:3px solid #F4B740"><p style="font-size:13.3px;color:var(--text-muted)">זו טיוטת בסיס. לפני שהאפליקציה עולה לאוויר לציבור — כדאי שעורך דין יעבור עליה ויתאים אותה.</p></div>'+
    TERMS.map(function(t){ return '<div class="panel"><h4>'+t.t+'</h4><p style="font-size:13.6px">'+t.d+'</p></div>'; }).join('');
}
function renderVisualGuide(){
  document.getElementById('view-visual').innerHTML =
    '<div class="hero"><h1 class="sm">איך פרסומת נראית בפועל</h1><p>שישה שלבים עם הדגמה ויזואלית — איפה בדיוק לשים כל דבר על המסך.</p></div>'+
    VISUALS.map(function(v){
      return '<div class="panel"><h4>'+v.t+'</h4>'+
        '<div style="display:flex;justify-content:center;margin:12px 0 14px">'+v.svg+'</div>'+
        '<p style="font-size:13.6px">'+v.d+'</p></div>';
    }).join('');
}

/* ---------- INIT ---------- */
document.getElementById('backBtn').onclick = function(){ go('home'); };
document.getElementById('brandHome').onclick = function(){ go('home'); };
renderHome();
showView('home');
