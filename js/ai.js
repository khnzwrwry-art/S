let selectedType = CONTENT_TYPES[0].id;
let chatHistory = [];

/* ---------- CONTENT TOOL ---------- */
function renderContentTool(preset){
  var biz = (document.getElementById('bizInput')||{}).value || localStorage.getItem('shiguru_biz') || '';
  document.getElementById('view-content').innerHTML =
    '<div class="hero"><h1 class="sm">כלי תוכן AI</h1><p>ספר לי על העסק שלך, בחר סוג תוכן, וקבל טיוטה שנכתבת במיוחד עבורך.</p></div>'+
    '<span class="field-label">מה העסק שלך?</span>'+
    '<textarea id="bizInput" placeholder="לדוגמה: חנות אונליין לאביזרי טלפון עם עיצובים מיוחדים, קהל יעד בני 14-18">'+esc(biz)+'</textarea>'+
    (preset ? '<span class="field-label">מה לכתוב</span><textarea id="customTask">'+esc(preset)+'</textarea>' :
      '<span class="field-label">סוג התוכן</span><div class="chip-row" id="typeChips"></div>')+
    '<button class="btn-primary" id="genBtn">כתוב לי טיוטה</button>'+
    '<p class="hint">עבור על הטיוטה והתאם אותה לקול שלך לפני שאתה מפרסם — תוכן שנשמע כמוך עובד טוב יותר.</p>'+
    '<div class="result-box" id="resultBox" hidden></div>';

  if(!preset) renderTypeChips();

  document.getElementById('genBtn').onclick = function(){
    var b = document.getElementById('bizInput').value.trim();
    var box = document.getElementById('resultBox');
    if(!b){ box.hidden=false; box.textContent='ספר לי קודם בכמה מילים על העסק שלך.'; return; }
    localStorage.setItem('shiguru_biz', b);
    var task = preset ? document.getElementById('customTask').value
                      : CONTENT_TYPES.find(function(c){return c.id===selectedType;}).prompt;
    generate(b, task, box, document.getElementById('genBtn'));
  };
}
function renderTypeChips(){
  var el = document.getElementById('typeChips');
  if(!el) return;
  el.innerHTML = CONTENT_TYPES.map(function(c){
    return '<div class="chip '+(c.id===selectedType?'active':'')+'" data-id="'+c.id+'">'+c.label+'</div>';
  }).join('');
  el.querySelectorAll('.chip').forEach(function(c){
    c.onclick = function(){ selectedType = c.dataset.id; renderTypeChips(); };
  });
}
async function generate(biz, task, box, btn){
  box.hidden = false; box.textContent = 'כותב טיוטה...'; btn.disabled = true;
  try{
    var sample = await claude.use('sample');
    if(!sample){ box.textContent = 'כלי ה-AI לא זמין בתצוגה הזו כרגע.'; btn.disabled=false; return; }
    var prompt = 'אתה כותב תוכן שיווקי לבני נוער שמנהלים עסק קטן.\nהעסק: "'+biz+'".\nמשימה: '+task+
      '\nכתוב בעברית, בטון צעיר וישיר, בלי גוזמות שיווקיות ובלי הקדמות. ישר לתוכן.';
    var res = await sample(prompt, { onText: function(o){ box.textContent = o.text; } });
    box.textContent = res.text;
  }catch(e){ box.textContent = 'לא הצלחתי ליצור טיוטה כרגע. נסה שוב בעוד רגע.'; }
  btn.disabled = false;
}

/* ---------- AI MENTOR ---------- */
function renderAssistant(prefill){
  var suggestions = ['איך אני מוצא לקוח ראשון?','כמה כסף צריך כדי להתחיל?','איך מפרסמים בלי תקציב?','מה עושים אם אף אחד לא קונה?'];
  document.getElementById('view-assistant').innerHTML =
    '<div class="hero"><h1 class="sm">מנטור AI</h1><p>שאל כל שאלה על העסק שלך — מהתחלה ועד לקוח ראשון. תשובות ישירות, בלי הבטחות.</p></div>'+
    '<div class="chip-row" id="sugChips">'+suggestions.map(function(s){ return '<div class="chip">'+s+'</div>'; }).join('')+'</div>'+
    '<div class="chat-log" id="chatLog"></div>'+
    '<div class="chat-input-row">'+
      '<textarea id="chatInput" placeholder="מה בא לך לשאול?">'+esc(prefill||'')+'</textarea>'+
      '<button class="send-btn" id="sendBtn">'+svg('<path d="M20 4L3 11l7 3 3 7 7-17z"/>',18)+'</button>'+
    '</div>';

  renderChatLog();
  document.querySelectorAll('#sugChips .chip').forEach(function(c){
    c.onclick = function(){ document.getElementById('chatInput').value = c.textContent; sendChat(); };
  });
  document.getElementById('sendBtn').onclick = sendChat;
  document.getElementById('chatInput').onkeydown = function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendChat(); }
  };
}
function renderChatLog(){
  var log = document.getElementById('chatLog');
  if(!log) return;
  log.innerHTML = chatHistory.map(function(m){
    return '<div class="msg '+(m.role==='user'?'user':'bot')+'">'+esc(m.content)+'</div>';
  }).join('');
}
async function sendChat(){
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if(!text) return;
  input.value = '';
  chatHistory.push({role:'user', content:text});
  chatHistory.push({role:'assistant', content:'חושב...'});
  renderChatLog();
  var btn = document.getElementById('sendBtn'); btn.disabled = true;
  try{
    var sample = await claude.use('sample');
    if(!sample){
      chatHistory[chatHistory.length-1].content = 'המנטור לא זמין בתצוגה הזו כרגע.';
      renderChatLog(); btn.disabled=false; return;
    }
    var sys = 'אתה מנטור עסקי לבני נוער בישראל שמקימים עסק ראשון. ענה בעברית, קצר וישיר, עם צעדים מעשיים שאפשר לעשות היום. בלי הבטחות להתעשרות, בלי בולשיט. אם משהו דורש הורה, חשבון בנק או דיווח למס — תגיד את זה במפורש. אם חסר לך מידע, שאל שאלה אחת ממוקדת.';
    var turns = [{role:'user', content:sys+'\n\nהשאלה הראשונה שלי: '+chatHistory[0].content}];
    for(var i=1;i<chatHistory.length-1;i++){
      if(chatHistory[i].content==='חושב...') continue;
      turns.push({role:chatHistory[i].role==='user'?'user':'assistant', content:chatHistory[i].content});
    }
    if(turns[turns.length-1].role !== 'user') turns.push({role:'user', content:text});
    var res = await sample(turns, { onText: function(o){
      chatHistory[chatHistory.length-1].content = o.text; renderChatLog();
    }});
    chatHistory[chatHistory.length-1].content = res.text;
  }catch(e){
    chatHistory[chatHistory.length-1].content = 'לא הצלחתי לענות כרגע. נסה שוב בעוד רגע.';
  }
  renderChatLog(); btn.disabled = false;
  window.scrollTo(0, document.body.scrollHeight);
}
