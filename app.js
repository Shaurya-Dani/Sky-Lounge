// ── STARS ────────────────────────────────────────────────────
(function(){
  const c = document.getElementById('stars');
  for(let i=0;i<70;i++){
    const s = document.createElement('div');
    s.className='star';
    s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;
      --d:${2+Math.random()*4}s;--dl:${Math.random()*5}s;
      width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;
      opacity:${0.2+Math.random()*0.8}`;
    c.appendChild(s);
  }
})();

// ── STATE ────────────────────────────────────────────────────
let activeMenu = null;
let activeTab  = 'all';
let searchQ    = '';

// ── ENTER MENU ───────────────────────────────────────────────
function enterMenu(type) {
  activeMenu = type;
  activeTab  = 'all';
  searchQ    = '';

  document.getElementById('landing').classList.add('hidden');
  document.getElementById('menuScreen').classList.remove('hidden');

  const icons = {dining:'🍽', bar:'🍸'};
  const titles = {dining:'Dining Menu', bar:'Bar Menu'};
  // topbar now uses logo image, no text needed

  buildTabs();
  setupSearch();
  renderMenu();
  window.scrollTo(0,0);
}

// ── BACK ─────────────────────────────────────────────────────
function goBack() {
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  activeMenu = null;
  window.scrollTo(0,0);
}

// ── TABS ─────────────────────────────────────────────────────
function buildTabs() {
  const data = activeMenu==='dining' ? DINING_MENU : BAR_MENU;
  const nav  = document.getElementById('tabNav');
  nav.innerHTML = '';
  data.tabs.forEach((t,i) => {
    const b = document.createElement('button');
    b.className = 'tab-btn' + (i===0?' active':'');
    b.textContent = t.label;
    b.onclick = () => switchTab(t.id, b);
    nav.appendChild(b);
  });
}

function switchTab(id, btn) {
  activeTab = id; searchQ = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearBtn').classList.remove('visible');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu();
  // scroll tabs into view
  btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── SEARCH ───────────────────────────────────────────────────
function setupSearch() {
  const inp = document.getElementById('searchInput');
  const fresh = inp.cloneNode(true);
  inp.parentNode.replaceChild(fresh, inp);
  fresh.addEventListener('input', e => {
    searchQ = e.target.value.toLowerCase().trim();
    document.getElementById('clearBtn').classList.toggle('visible', searchQ.length>0);
    renderMenu();
  });
}
function clearSearch() {
  document.getElementById('searchInput').value='';
  searchQ='';
  document.getElementById('clearBtn').classList.remove('visible');
  renderMenu();
}

// ── RENDER ───────────────────────────────────────────────────
function renderMenu() {
  const body = document.getElementById('menuBody');
  body.innerHTML = '';
  const data = activeMenu==='dining' ? DINING_MENU : BAR_MENU;
  const secs = data.sections.filter(s => activeTab==='all' || s.tab===activeTab);
  let count = 0;

  secs.forEach((sec, di) => {
    const el = sec.tableFormat ? renderTable(sec, di) : renderCards(sec, di);
    if(el){ body.appendChild(el); count++; }
  });

  if(!count){
    body.innerHTML=`<div class="no-results">
      <div class="nr-icon">🔍</div>
      <p>No items found${searchQ?' for "'+esc(searchQ)+'"':''}</p>
    </div>`;
  }
}

// ── CARD SECTION ─────────────────────────────────────────────
function renderCards(sec, di) {
  const items = sec.items.filter(it => hits(it.name, it.desc));
  if(!items.length) return null;

  const wrap = document.createElement('div');
  wrap.className = 'menu-section';
  wrap.style.animationDelay = di*0.05+'s';

  const head = document.createElement('div');
  head.className = 'section-head';
  const emojiWrap = document.createElement('div');
  emojiWrap.className = 'section-emoji-wrap';
  emojiWrap.textContent = sec.emoji || '';
  const h2 = document.createElement('h2');
  h2.className = 'section-label';
  h2.textContent = sec.label || '';
  const badgeSpan = document.createElement('span');
  badgeSpan.className = 'section-badge';
  badgeSpan.textContent = items.length;
  head.appendChild(emojiWrap);
  head.appendChild(h2);
  head.appendChild(badgeSpan);
  wrap.appendChild(head);

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  const frag = document.createDocumentFragment();
  items.forEach((it, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.animationDelay = (di*0.05 + i*0.03)+'s';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.appendChild(hl(it.name));
    card.appendChild(nameDiv);

    if(it.desc){
      const descP = document.createElement('p');
      descP.className = 'item-desc';
      descP.appendChild(hl(it.desc));
      card.appendChild(descP);
    }

    const footer = document.createElement('div');
    footer.className = 'item-footer';
    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = it.price2 ? `₹${it.price2}` : `₹${it.price}`;
    footer.appendChild(priceSpan);

    const badgeEl = buildBadgeElement(it);
    if(badgeEl) footer.appendChild(badgeEl);

    card.appendChild(footer);
    frag.appendChild(card);
  });

  grid.appendChild(frag);
  wrap.appendChild(grid);
  return wrap;
}

// ── TABLE SECTION ────────────────────────────────────────────
function renderTable(sec, di) {
  const rows = sec.rows.filter(r => hits(r[0], ''));
  if(!rows.length) return null;

  const wrap = document.createElement('div');
  wrap.className = 'menu-section';
  wrap.style.animationDelay = di*0.05+'s';

  const head = document.createElement('div');
  head.className = 'section-head';
  const emojiWrap = document.createElement('div');
  emojiWrap.className = 'section-emoji-wrap';
  emojiWrap.textContent = sec.emoji || '';
  const h2 = document.createElement('h2');
  h2.className = 'section-label';
  h2.textContent = sec.label || '';
  const badgeSpan = document.createElement('span');
  badgeSpan.className = 'section-badge';
  badgeSpan.textContent = rows.length;
  head.appendChild(emojiWrap);
  head.appendChild(h2);
  head.appendChild(badgeSpan);
  wrap.appendChild(head);

  const card = document.createElement('div');
  card.className = 'table-card';
  card.style.animationDelay = di*0.05+'s';

  const tbl = document.createElement('table');
  tbl.className = 'price-table';

  const thead = document.createElement('thead');
  const thr = document.createElement('tr');
  sec.columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    thr.appendChild(th);
  });
  thead.appendChild(thr);
  tbl.appendChild(thead);

  const tb = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach((c, i) => {
      const td = document.createElement('td');
      if(i===0) td.appendChild(hl(c)); else td.textContent = c;
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  tbl.appendChild(tb);
  card.appendChild(tbl);
  wrap.appendChild(card);
  return wrap;
}

// ── HELPERS ──────────────────────────────────────────────────
function buildBadge(it) {
  if(!it.badge) return '';
  const map = {
    'veg':     ['badge-veg',    '🟢 Veg'],
    'non-veg': ['badge-nonveg', '🔴 Non Veg'],
    'popular': ['badge-popular','⭐ Popular'],
    'chef':    ['badge-chef',   '👨‍🍳 Chef\'s Spl'],
  };
  const [cls, label] = map[it.badge] || map['veg'];
  return `<span class="item-badge ${cls}">${label}</span>`;
}

function buildBadgeElement(it){
  if(!it.badge) return null;
  const map = {
    'veg':     ['badge-veg',    '🟢 Veg'],
    'non-veg': ['badge-nonveg', '🔴 Non Veg'],
    'popular': ['badge-popular','⭐ Popular'],
    'chef':    ['badge-chef',   '👨‍🍳 Chef\'s Spl'],
  };
  const [cls, label] = map[it.badge] || map['veg'];
  const span = document.createElement('span');
  span.className = `item-badge ${cls}`;
  span.textContent = label;
  return span;
}

function hits(name, desc) {
  if(!searchQ) return true;
  return (name||'').toLowerCase().includes(searchQ) ||
         (desc||'').toLowerCase().includes(searchQ);
}

function hl(txt){
  const frag = document.createDocumentFragment();
  const s = txt || '';
  if(!searchQ || !s){
    frag.appendChild(document.createTextNode(s));
    return frag;
  }
  const esc = searchQ.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp(esc,'ig');
  let lastIndex = 0;
  let match;
  while((match = re.exec(s)) !== null){
    const before = s.slice(lastIndex, match.index);
    if(before) frag.appendChild(document.createTextNode(before));
    const mark = document.createElement('mark');
    mark.className = 'hl';
    mark.textContent = match[0];
    frag.appendChild(mark);
    lastIndex = re.lastIndex;
  }
  const tail = s.slice(lastIndex);
  if(tail) frag.appendChild(document.createTextNode(tail));
  return frag;
}

function esc(s) {
  return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
