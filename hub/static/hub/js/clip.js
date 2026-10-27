/* Journey: four 5-second looping 3D clips, rendered live with the same engine (one shared renderer). */
(() => {
  const boxes = [...document.querySelectorAll(".clip")];
  if (!boxes.length || !window.DSH || !DSH._i) return;
  const { B, M, renderer, envFor, stage, fitSun, pathAt, col, clamp, ease, lerp } = DSH._i;
  const plans = JSON.parse(document.getElementById("plans").textContent), PI = Math.PI;
  const home = plans.home, build = plans["complete-construction-delivery"] || Object.values(plans).find(p => p.mode === "build");
  const DUR = 5, WD = 960, HT = 600, sofa = [["#2f4a5e", "#3b586d"], ["#8c4e3a", "#a15f49"], ["#55705f", "#668572"]], floor = ["#ffffff", "#c9b8a0", "#e9dcc6"];
  const retint = k => {                       /* step 3: sofa and floor finishes change while you watch */
    const n = 3, x = (k === null ? 0 : k) * n, i = Math.floor(x) % n, j = (i + 1) % n, e = k === null ? 0 : ease(clamp((x - Math.floor(x) - .25) / .5));
    const mix = (a, b) => new THREE.Color(a).convertSRGBToLinear().lerp(new THREE.Color(b).convertSRGBToLinear(), e);
    M.navy.color.copy(mix(sofa[i][0], sofa[j][0])); M.navy2.color.copy(mix(sofa[i][1], sofa[j][1])); M.floor.color.copy(mix(floor[i], floor[j]));
  };
  const defs = [
    { plan: Object.assign({}, home, { mode: "sketch" }), cam(k, W, o) { o.p = ease(clamp(k / .85)); o.rk = 0; o.pos = [lerp(4, 9, k), lerp(24, 15, k), lerp(9, 15, k)]; o.look = [6, 0, 4.5]; o.fov = 46; } },
    { plan: home, cam(k, W, o) { const u = lerp(.06, .17, k), [x, z] = pathAt(W.path, u), [lx, lz] = pathAt(W.path, u + .03); o.p = 1; o.rk = 1; o.pos = [x, 1.62 + Math.sin(k * 40) * .015, z]; o.look = [lx, 1.35, lz]; o.fov = 68; } },
    { plan: home, tint: true, cam(k, W, o) { o.p = 1; o.rk = 1; o.pos = [lerp(.9, 1.8, k), 1.6, lerp(2.1, 2.5, k)]; o.look = [9, 1.1, 2.2]; o.fov = 68; o.k = k; } },
    { plan: build, cam(k, W, o) { o.p = ease(clamp(k / .9)); o.rk = 0; const th = lerp(PI / 2 - .9, PI / 2 + .5, k), r = W.r * .75, ph = 1.15; o.pos = [W.c[0] + r * Math.sin(ph) * Math.cos(th), W.c[1] + r * Math.cos(ph), W.c[2] + r * Math.sin(ph) * Math.sin(th)]; o.look = W.c; o.fov = 46; } }
  ];
  let R, env, cam; const cl = boxes.map(b => { const cv = b.querySelector("canvas"); return { i: +b.dataset.i, def: defs[+b.dataset.i], cv, ctx: cv.getContext("2d"), btn: b.querySelector("[data-rec]"), vis: false, t0: 0, prev: 0, want: false, W: null, S: null }; }).filter(c => c.def && c.def.plan);
  const record = c => {
    if (!window.MediaRecorder || !c.cv.captureStream) { alert("Your browser can't record clips. Try Chrome or Edge."); c.btn.textContent = "Save clip"; return; }
    const mt = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm", ch = [], mr = new MediaRecorder(c.cv.captureStream(30), { mimeType: mt, videoBitsPerSecond: 6e6 });
    mr.ondataavailable = e => e.data.size && ch.push(e.data);
    mr.onstop = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(ch, { type: "video/webm" })); a.download = `dreamspacehub-step-${c.i + 1}.webm`; a.click(); c.btn.textContent = "Save clip"; };
    mr.start(); setTimeout(() => mr.stop(), DUR * 1000 + 80);
  };
  function frame(c, now, fixedK) {
    if (!R) { R = renderer(document.createElement("canvas")); R.setSize(WD, HT, false); env = envFor(R); cam = new THREE.PerspectiveCamera(46, WD / HT, .08, 900); }
    if (!c.W) { c.S = stage(env); c.W = B[c.def.plan.mode](c.def.plan); c.S.add(c.W.g); fitSun(c.S, c.W); }
    const t = ((now - c.t0) / 1000) % DUR, k = fixedK === undefined ? t / DUR : fixedK, o = {};
    c.def.cam(k, c.W, o); c.W.upd(o.p, t, o.rk);
    if (c.def.tint) retint(o.k);
    cam.fov = o.fov; cam.updateProjectionMatrix(); cam.position.set(...o.pos); cam.lookAt(...o.look);
    R.render(c.S, cam); if (c.def.tint) retint(null);
    c.ctx.drawImage(R.domElement, 0, 0);
    const a = Math.max(clamp((k - .94) / .06), clamp((.05 - k) / .05)); if (a > 0) { c.ctx.fillStyle = `rgba(12,26,43,${a})`; c.ctx.fillRect(0, 0, WD, HT); }
    if (c.want && k < c.prev) { c.want = false; record(c); } c.prev = k;
  }
  cl.forEach(c => {
    new IntersectionObserver(e => { c.vis = e[0].isIntersecting; if (c.vis) { c.t0 = performance.now(); if (DSH.reduce) frame(c, c.t0, .8); } }).observe(c.cv);
    if (c.btn) c.btn.onclick = () => { c.want = true; c.btn.textContent = "Recording 5 s…"; };
  });
  if (!DSH.reduce) (function loop(now) { requestAnimationFrame(loop); cl.forEach(c => { if (c.vis) frame(c, now); }); })(performance.now());
})();