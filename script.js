document.addEventListener('DOMContentLoaded', ()=>{
  /* ========================================================
     CURSOR
  ======================================================== */
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  let mx=window.innerWidth/2, my=window.innerHeight/2;
  let rx=mx, ry=my;

  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  document.addEventListener('mousedown', () => document.body.classList.add('is-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('is-click'));

  // hover detection — use event delegation so it works even on dynamically created elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.wcard,.scard,.tc,.chip,.ci,.pill,.tool-b,.btn-primary,.btn-ghost')) {
      document.body.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,.wcard,.scard,.tc,.chip,.ci,.pill,.tool-b,.btn-primary,.btn-ghost')) {
      document.body.classList.remove('is-hover');
    }
  });

  if (dot && ring) {
    function tickCursor() {
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tickCursor);
    }
    tickCursor();
  }

  /* ========================================================
     PARTICLES
  ======================================================== */
  const cv  = document.getElementById('pcv');
  const ctx = cv ? cv.getContext('2d') : null;
  let W, H;
  function resizeCv() { if (!cv) return; W=cv.width=innerWidth; H=cv.height=innerHeight; }

  if (cv && ctx) {
    resizeCv(); window.addEventListener('resize', resizeCv);

    class P {
      constructor() { this.reset(true); }
      reset(rand) {
        this.x  = rand ? Math.random()*W : (Math.random()>0.5? W+10 : -10);
        this.y  = rand ? Math.random()*H : Math.random()*H;
        this.vx = (Math.random()-.5)*.3;
        this.vy = (Math.random()-.5)*.3 - .08;
        this.r  = Math.random()*1.4+.3;
        this.a  = Math.random()*.45+.1;
        this.col= Math.random()>.5 ? '123,47,190' : '0,212,255';
      }
      step() {
        this.x+=this.vx; this.y+=this.vy;
        const dx=mx-this.x, dy=my-this.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<150){ this.vx+=(dx/d)*.012; this.vy+=(dy/d)*.012; }
        this.vx*=.99; this.vy*=.99;
        if(this.y<-12||this.x<-12||this.x>W+12) this.reset(false);
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${this.col},${this.a})`; ctx.fill();
      }
    }
    const pts = Array.from({length:80}, ()=>new P());
    function renderPts() {
      ctx.clearRect(0,0,W,H);
      for(let i=0;i<pts.length;i++){
        pts[i].step(); pts[i].draw();
        for(let j=i+1;j<pts.length;j++){
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<85){
            ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
            ctx.strokeStyle=`rgba(123,47,190,${(1-d/85)*.1})`; ctx.lineWidth=.5; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(renderPts);
    }
    renderPts();
  }

  /* ========================================================
     PARALLAX ORBS
  ======================================================== */
  document.addEventListener('mousemove', e => {
    const xn=(e.clientX/innerWidth-.5)*2, yn=(e.clientY/innerHeight-.5)*2;
    document.querySelectorAll('.orb').forEach((o,i)=>{
      const s=(i+1)*10;
      o.style.transform=`translate(${xn*s}px,${yn*s}px)`;
    });
  });

  /* ========================================================
     NAV SCROLL
  ======================================================== */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', ()=> nav.classList.toggle('scrolled', scrollY>60));
  }

  /* ========================================================
     REVEAL ON SCROLL
  ======================================================== */
  const revObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); });
  },{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

  /* ========================================================
     COUNTER ANIMATION
  ======================================================== */
  const cntObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, target=parseInt(el.dataset.n,10);
      let start=null;
      function step(ts){
        if(!start) start=ts;
        const p=Math.min((ts-start)/1600,1);
        const ease=1-Math.pow(1-p,3);
        el.textContent=Math.floor(ease*target)+(target===100?'%':'+');
        if(p<1) requestAnimationFrame(step);
        else el.textContent=target+(target===100?'%':'+');
      }
      requestAnimationFrame(step);
      cntObs.unobserve(el);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-n]').forEach(el=>cntObs.observe(el));

  /* ========================================================
     MAGNETIC BUTTONS
  ======================================================== */
  document.querySelectorAll('.btn-primary,.btn-ghost').forEach(btn=>{
    btn.addEventListener('mousemove', function(e){
      const r=this.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))*.22;
      const dy=(e.clientY-(r.top+r.height/2))*.22;
      this.style.transform=`translate(${dx}px,${dy}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', function(){ this.style.transform=''; });
  });

  /* ========================================================
     SKILLS MARQUEE  (rAF-based, pause on hover)
  ======================================================== */
  const SKILLS = {
    sr1: [
      {e:'🎨',n:'UI Design',        lv:5,c:'v'},
      {e:'✦', n:'UX Research',      lv:4,c:'c'},
      {e:'📐',n:'Wireframing',      lv:5,c:'v'},
      {e:'🖌️',n:'Visual Design',    lv:5,c:'r'},
      {e:'⚡',n:'Prototyping',      lv:4,c:'c'},
      {e:'🔷',n:'Design Systems',   lv:5,c:'v'},
      {e:'🌀',n:'Motion Design',    lv:4,c:'g'},
      {e:'🎯',n:'Brand Identity',   lv:5,c:'r'},
      {e:'📱',n:'Mobile Design',    lv:4,c:'c'},
      {e:'🖼️',n:'Art Direction',    lv:4,c:'v'},
      {e:'📊',n:'Data Viz',         lv:3,c:'g'},
      {e:'🔍',n:'Usability Testing',lv:4,c:'c'},
    ],
    sr2: [
      {e:'⚛️',n:'Vibe Codeing',           lv:4,c:'c'},
      {e:'🔺',n:'Framer',         lv:4,c:'v'},
      {e:'🟨',n:'JavaScript',      lv:5,c:'g'},
      {e:'🎨',n:'CSS / Tailwind',  lv:5,c:'c'},
      {e:'📄',n:'HTML5',           lv:5,c:'r'},
      {e:'🌐',n:'Webflow',         lv:4,c:'v'},
      {e:'⚡',n:'Framer',          lv:4,c:'c'},
      {e:'🐙',n:'Git & GitHub',    lv:4,c:'g'},
      {e:'🟢',n:'Flutterflow',         lv:3,c:'v'},
      {e:'🔷',n:'Typography',      lv:3,c:'c'},
      {e:'📦',n:'Gen AI',       lv:4,c:'r'},
      {e:'🛠️',n:'Dev Tools',       lv:5,c:'g'},
    ],
    sr3: [
      {e:'🗣️',n:'Communication',   lv:5,c:'r'},
      {e:'📋',n:'Project Mgmt',    lv:4,c:'v'},
      {e:'🧠',n:'Design Thinking', lv:5,c:'c'},
      {e:'✍️',n:'Copywriting',     lv:3,c:'g'},
      {e:'📣',n:'Creative Lead',   lv:4,c:'r'},
      {e:'🤝',n:'Collaboration',   lv:5,c:'v'},
      {e:'🎙️',n:'Presentations',   lv:4,c:'c'},
      {e:'🧩',n:'Problem Solving', lv:5,c:'g'},
      {e:'📐',n:'Systems Thinking',lv:5,c:'r'},
      {e:'🌱',n:'Fast Learning',   lv:5,c:'v'},
    ]
  };

  function makePill({e,n,lv,c}){
    const dots=[...Array(5)].map((_,i)=>`<span class="pd${i<lv?' on':''}"></span>`).join('');
    return `<div class="pill ${c}">
      <div class="pill-ico">${e}</div>
      <div>
        <div class="pill-name">${n}</div>
        <div class="pill-dots">${dots}</div>
      </div>
    </div>`;
  }

  // direction: 1=LTR, -1=RTL
  const rowCfg = [
    {id:'sr1', speed:0.55, dir:1},
    {id:'sr2', speed:0.50, dir:-1},
    {id:'sr3', speed:0.45, dir:1},
  ];
  const rowState = {};

  rowCfg.forEach(({id, speed, dir}) => {
    const el = document.getElementById(id);
    if(!el) return;
    const items = SKILLS[id];
    // Triple-duplicate for seamless loop
    el.innerHTML = [...items,...items,...items].map(makePill).join('');

    // Measure single-copy width after render
    requestAnimationFrame(()=>{
      const totalW   = el.scrollWidth;         // width of all 3 copies
      const singleW  = totalW / 3;             // width of 1 copy
      let offset = dir === -1 ? singleW : 0;   // RTL starts at singleW so it scrolls back to 0

      rowState[id] = { el, speed, dir, singleW, offset, paused: false };

      el.addEventListener('mouseenter', ()=>{ rowState[id].paused=true; });
      el.addEventListener('mouseleave', ()=>{ rowState[id].paused=false; });
    });
  });

  function tickRows() {
    Object.values(rowState).forEach(s => {
      if(s.paused) return;
      s.offset += s.speed * s.dir;
      // LTR: reset when offset reaches singleW
      if(s.dir === 1 && s.offset >= s.singleW)  s.offset -= s.singleW;
      // RTL: reset when offset goes below 0
      if(s.dir === -1 && s.offset <= 0)          s.offset += s.singleW;
      s.el.style.transform = `translateX(-${s.offset}px)`;
    });
    requestAnimationFrame(tickRows);
  }
  requestAnimationFrame(()=> requestAnimationFrame(tickRows)); // wait for widths to settle
});

/* ========================================================
   COPY TO CLIPBOARD
======================================================== */
function copyVal(e, text) {
  e.preventDefault();
  try {
    navigator.clipboard.writeText(text);
  } catch(_) {
    const t=document.createElement('textarea');
    t.value=text; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t);
  }
  const toast=document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 2000);
}

/* ========================================================
   FORM SUBMIT
======================================================== */
function formSubmit(btn) {
  const orig=btn.innerHTML;
  btn.innerHTML='Sending… ⟳'; btn.disabled=true;
  setTimeout(()=>{
    btn.innerHTML='✓ Message Sent!';
    btn.style.background='linear-gradient(135deg,#1a7a4a,#0d5c38)';
    setTimeout(()=>{ btn.innerHTML=orig; btn.style.background=''; btn.disabled=false; },3000);
  },1500);
}