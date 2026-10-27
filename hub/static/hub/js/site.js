(() => {
  "use strict";
  const reduce = DSH.reduce, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const plans = JSON.parse($("#plans").textContent);
  gsap.registerPlugin(ScrollTrigger);
    /* does this phone support WebGL? if not, skip the 3D parts so the rest of the page still works */
  const gl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();

  /* menu + page curtain */
  const menu = $("#menu"), mb = $("#menuBtn"), cur = $(".curtain");
  mb.onclick = () => { const o = menu.classList.toggle("open"); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "Close" : "Menu"; document.body.classList.toggle("lock", o); };
  $$("a[href^='/']").forEach(a => a.addEventListener("click", e => {
    if (e.metaKey || e.ctrlKey || a.target || reduce) return;
    const u = new URL(a.href); if (u.pathname === location.pathname && u.hash) return;
    e.preventDefault(); cur.classList.add("go"); setTimeout(() => location.href = a.href, 520);
  }));
  addEventListener("pageshow", () => cur.classList.remove("go"));

  /* menu links that jump to a section on this page: close the menu first */
  $$("#menu a").forEach(a => a.addEventListener("click", () => {
    const u = new URL(a.href);
    if (u.pathname === location.pathname && u.hash) { menu.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.textContent = "Menu"; document.body.classList.remove("lock"); }
  }));

  /* generated floor-plan drawings */
  $$(".art[data-seed]").forEach(el => {
    let s = +el.dataset.seed * 9973; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; let out = "";
    const split = (x, y, w, h, d) => {
      if (d > 3 || w < 38 || h < 34) { out += `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`; return; }
      if (w > h) { const c = w * (.35 + r() * .3); split(x, y, c, h, d + 1); split(x + c, y, w - c, h, d + 1); }
      else { const c = h * (.35 + r() * .3); split(x, y, w, c, d + 1); split(x, y + c, w, h - c, d + 1); }
    };
    split(8, 8, 184, 124, 0);
    el.innerHTML = `<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${out}</svg>`;
  });

  /* loader, first visit to the home page only */
  const loader = $(".loader");
  if (loader) {
    if (reduce || sessionStorage.getItem("dsh")) loader.remove();
    else {
      sessionStorage.setItem("dsh", 1); const o = { v: 0 }, n = loader.querySelector(".count");
      gsap.timeline().to(o, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => n.textContent = Math.round(o.v) })
        .to(loader, { yPercent: -100, duration: .9, ease: "power3.inOut", onComplete: () => loader.remove() }, "+=.15");
    }
  }
  /* arriving on the home page with #why / #contact: start from the top so the pinned hero measures itself correctly,
     then land on the section once everything has loaded (the browser's own jump + smooth scrolling broke the pin spacing) */
  const hashTarget = ($("#stage") && location.hash.length > 1) ? location.hash : "";
  if (hashTarget) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, 0);
  }
  /* home hero: scroll drives the plan into a house */
  const hero = $("#scene");
  if (hero && gl) {
    const v = DSH.mount(hero), caps = $$(".cap");
    v.cine = [{ s: 0, p: [6, 26, 5.4], t: [6, 0, 4.5], f: 42 }, { s: .3, p: [-15, 9.5, 17], t: [5, 1.2, 3.5], f: 46 }, { s: .6, p: [-10.5, 1.7, 8], t: [0, 1.6, 2.6], f: 58 }, { s: .8, p: [-3, 1.65, 2.6], t: [4, 1.5, 2.3], f: 66 }, { s: 1, p: [1.4, 1.62, 2.5], t: [8, 1.3, 1.6], f: 70 }];
    v.load(plans.home);
    ScrollTrigger.create({ trigger: "#stage", start: "top top", end: "+=200%", pin: !reduce, scrub: true, onUpdate: s => {
      v.tp = s.progress; caps.forEach(c => c.classList.toggle("on", s.progress >= +c.dataset.a && s.progress < +c.dataset.b)); } });
  }

  /* arriving on the home page with #why / #contact: re-align once the pinned hero has set its spacing */
    if (hashTarget) {
    let touched = false;
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(ev => addEventListener(ev, () => { touched = true; }, { passive: true, once: true }));
    const land = () => {
      if (touched) return;
      ScrollTrigger.refresh();
      let t = null; try { t = document.querySelector(hashTarget); } catch (e) {}
      if (t) scrollTo(0, Math.round(t.getBoundingClientRect().top + scrollY));
      ScrollTrigger.update();
    };
    const finish = () => { land(); document.documentElement.style.scrollBehavior = ""; };
    const run = () => { land(); setTimeout(land, 350); setTimeout(finish, 900); };
    if (document.readyState === "complete") run(); else addEventListener("load", run);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(land, 60));
  }

  /* home reel: cycles the studio's projections */
  const rl = $("[data-reel]");
  if (rl && gl) {
    const keys = rl.dataset.reel.split(","), lab = $("#reelLabel"), v = DSH.mount(rl); let i = 0; v.rate = .22;
    const go = () => { v.load(plans[keys[i]]); lab.textContent = plans[keys[i]].title; i = (i + 1) % keys.length; };
    go(); setInterval(go, 16000);
  }
  /* viewer pages */
  if (gl) $$("canvas[data-viewer]").forEach(c => {
    const v = DSH.mount(c), root = c.closest("[data-vroot]"), sel = root.querySelector("select");
    DSH.controls(v, root); v.load(plans[c.dataset.viewer]);
    if (sel) sel.onchange = () => v.load(plans[sel.value]);
  });
    if (gl && $("img[data-plan]")) setTimeout(() => DSH.thumbs(plans), 60);

  /* counters */
  $$("[data-to]").forEach(b => { const o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: "top 85%", once: true, onEnter: () =>
      gsap.to(o, { v: +b.dataset.to, duration: reduce ? 0 : 1.6, ease: "power2.out", onUpdate: () => b.textContent = Math.round(o.v) }) }); });

  /* franchise model tabs (FOFO / FOCO) */
  const tabs = $$(".fr-tab");
  if (tabs.length) {
    document.documentElement.classList.add("js");
    const show = t => tabs.forEach(b => { const on = b === t; b.setAttribute("aria-selected", on); $("#" + b.getAttribute("aria-controls")).hidden = !on; });
    tabs.forEach((b, i) => { b.onclick = () => show(b);
      b.onkeydown = e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); show(n); } }; });
    const h = tabs.find(b => "#panel-" + b.id.slice(4) === location.hash); show(h || tabs[0]);
  }

    /* mail buttons (Start Your Dream, Start your journey, franchise, walkthrough...): a small "are you sure?" card first,
     with a Back to website option; Continue opens the mail app (phone) or Gmail in the same tab (computer) */
  const ua = navigator.userAgent, mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const mailBtns = $$("#startDream, [data-compose]");
  if (mailBtns.length) {
    const ask = document.createElement("div");
    ask.className = "mailask"; ask.hidden = true;
    ask.innerHTML = '<div class="mailask-box" role="dialog" aria-modal="true" aria-labelledby="maTitle">' +
      '<button type="button" class="mailask-x" aria-label="Close and go back to the website">&times;</button>' +
      '<p class="eyebrow">Almost there</p><h3 id="maTitle"></h3><p class="mailask-txt"></p>' +
      '<div class="mailask-row"><button type="button" class="btn dream" data-go>Continue to email</button><button type="button" class="btn" data-back>Back to website</button></div>' +
      '<p class="mailask-note"></p></div>';
    document.body.appendChild(ask);
    const box = ask.querySelector(".mailask-box"), ttl = ask.querySelector("#maTitle"), txt = ask.querySelector(".mailask-txt"), note = ask.querySelector(".mailask-note"),
          goBtn = ask.querySelector("[data-go]"), backBtn = ask.querySelector("[data-back]"), xBtn = ask.querySelector(".mailask-x");
    let cur = null, opener = null;
    const close = () => { ask.hidden = true; document.removeEventListener("keydown", onKey); if (opener) opener.focus(); cur = null; };
    const onKey = e => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const f = [xBtn, goBtn, backBtn], i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    };
    const open = a => {
      cur = a; opener = a;
      const m = new URL(a.href);
      ttl.textContent = a.textContent.trim();
      txt.textContent = "We will open an email to " + m.pathname + " with a few questions already written for you. Fill them in and press send. Changed your mind? Just come back to the website.";
      note.textContent = mobile ? "This opens your mail app. You can return to this page any time." : "Gmail opens in this tab. To come back without sending, press your browser\u2019s back arrow.";
      ask.hidden = false; goBtn.focus(); document.addEventListener("keydown", onKey);
    };
    goBtn.onclick = () => {
      const a = cur; if (!a) return;
      const m = new URL(a.href), to = m.pathname, su = m.searchParams.get("subject") || "", body = m.searchParams.get("body") || "";
      close();
      if (mobile) { location.href = a.href; return; }
      /* same tab on purpose: the browser's back arrow then brings the visitor straight back to the website */
      location.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) + "&su=" + encodeURIComponent(su) + "&body=" + encodeURIComponent(body);
    };
    backBtn.onclick = close; xBtn.onclick = close;
    ask.addEventListener("click", e => { if (e.target === ask) close(); });
    addEventListener("pageshow", () => { ask.hidden = true; });
    mailBtns.forEach(a => a.addEventListener("click", e => { e.preventDefault(); open(a); }));
  }
  /* enquiry form -> Django */
  const form = $("#enq");
  if (form) {
    const msg = form.querySelector(".msg");
    form.addEventListener("submit", async e => {
      e.preventDefault(); msg.className = "msg"; msg.textContent = "Sending...";
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form) }), data = await res.json();
        if (data.ok) { msg.textContent = data.message; form.reset(); }
        else { msg.className = "msg err"; msg.textContent = "Please check: " + Object.keys(data.errors).join(", ") + "."; }
      } catch { msg.className = "msg err"; msg.textContent = "Could not send. Please call +91 7799555977."; }
    });
  }
})();