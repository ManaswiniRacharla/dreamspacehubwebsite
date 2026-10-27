/* DreamSpaceHub 3D engine v2. First-person walkthroughs, PBR materials, sun shadows, procedural textures.
   No external models or images. Brightness knobs are in LOOK. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOOK = { exposure: 1.0, sun: 2.1, hemi: .6, env: .55 };
  const V3 = THREE.Vector3, PI = Math.PI;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b), ease = k => k * k * (3 - 2 * k), lerp = (a, b, k) => a + (b - a) * k, rad = d => d * PI / 180;
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = c => new THREE.Color(c).convertSRGBToLinear();
  const SUN = new V3(-.78, .5, .38).normalize();
  let HH = 2.8;

  /* ---------- procedural textures ---------- */
  function speck(x, s, r, base, amp, n) {
    x.fillStyle = base; x.fillRect(0, 0, s, s);
    for (let i = 0; i < n; i++) { const v = (r() - .5) * amp / 255; x.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; x.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 3); }
  }
  const facade = (wall, g1, g2) => (x, s, r) => {
    speck(x, s, r, wall, 36, 6000); const n = 4, c = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const wx = i * c + c * .17, wy = j * c + c * .2, ww = c * .66, wh = c * .6;
      x.fillStyle = "rgba(0,0,0,.28)"; x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
      const gr = x.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, g1); gr.addColorStop(1, g2); x.fillStyle = gr; x.fillRect(wx, wy, ww, wh);
      x.fillStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.moveTo(wx, wy + wh); x.lineTo(wx + ww * .45, wy); x.lineTo(wx + ww * .7, wy); x.lineTo(wx + ww * .25, wy + wh); x.fill();
      x.fillStyle = "#2a2f35"; x.fillRect(wx + ww / 2 - 1.5, wy, 3, wh);
      x.fillStyle = "rgba(255,255,255,.55)"; x.fillRect(wx - 4, wy + wh + 3, ww + 8, 4);
    }
  };
  const TS = { plaster: 2, wood: 2.4, tile: 1.2, concrete: 3, grass: 5, paving: 2.4, asphalt: 4, facA: 12.8, facB: 12.8, facC: 12.8, facD: 12.8 };
  const DRAW = {
    plaster: (x, s, r) => speck(x, s, r, "#f6f4f0", 50, 9000),
    concrete: (x, s, r) => { speck(x, s, r, "#a4a4a1", 70, 16000); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(60,60,58,${.03 + r() * .05})`; x.beginPath(); x.arc(r() * s, r() * s, 12 + r() * 40, 0, 7); x.fill(); } },
    asphalt: (x, s, r) => speck(x, s, r, "#34373c", 60, 20000),
    grass: (x, s, r) => { speck(x, s, r, "#5d7b3e", 60, 14000); for (let i = 0; i < 3500; i++) { x.strokeStyle = `rgba(${60 + r() * 50},${100 + r() * 60},${40 + r() * 30},.55)`; const px = r() * s, py = r() * s; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 5, py - 3 - r() * 6); x.stroke(); } },
    wood: (x, s, r) => {
      const n = 16, w = s / n;
      for (let i = 0; i < n; i++) {
        const j = r() * s;
        [[0, j], [j, s]].forEach(([a, b]) => {
          const t = (r() - .5) * 26; x.fillStyle = `rgb(${210 + t},${172 + t},${124 + t})`; x.fillRect(i * w, a, w, b - a);
          for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(110,70,35,${.04 + r() * .08})`; x.fillRect(i * w + r() * w, a, .8 + r(), b - a); }
          x.fillStyle = "rgba(60,38,20,.35)"; x.fillRect(i * w, a, 1.2, b - a); x.fillRect(i * w, a, w, 1.2);
        });
      }
    },
    tile: (x, s, r) => { x.fillStyle = "#bfbab0"; x.fillRect(0, 0, s, s); const n = 4, w = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const t = (r() - .5) * 10; x.fillStyle = `rgb(${236 + t},${233 + t},${226 + t})`; x.fillRect(i * w + 2, j * w + 2, w - 4, w - 4); } },
    paving: (x, s, r) => { x.fillStyle = "#7d766b"; x.fillRect(0, 0, s, s); const rows = 8, h = s / rows, cols = 4, w = s / cols; for (let j = 0; j < rows; j++) { const off = j % 2 ? w / 2 : 0; for (let i = -1; i < cols; i++) { const t = (r() - .5) * 22; x.fillStyle = `rgb(${176 + t},${166 + t},${150 + t})`; x.fillRect(i * w + off + 2, j * h + 2, w - 4, h - 4); } } },
    facA: facade("#e5dccd", "#6f8ea5", "#23384a"), facB: facade("#cdbba2", "#88a3a8", "#2c4448"),
    facC: facade("#8f9ca8", "#9bb7c9", "#2d4156"), facD: facade("#ecebe6", "#7692a8", "#1e3040")
  };
  const TC = {};
  function T(name) {
    return TC[name] || (TC[name] = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 512; DRAW[name](c.getContext("2d"), 512, rng(name.length * 977 + 13));
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
    })());
  }
  const mat = (c, o = {}, tex) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .8, metalness: 0, envMapIntensity: LOOK.env }, o));
    m.color.convertSRGBToLinear(); m.emissive.convertSRGBToLinear();
    if (tex) { m.map = T(tex); m.userData.ts = TS[tex]; } return m;
  };
  const C = { wall: "#efe9df", navy: "#2f4a5e", navy2: "#3b586d", copper: "#c9763f", sage: "#6f8a78", linen: "#d8cdbb" };
  const M = {
    wall: mat(C.wall, {}, "plaster"), white: mat("#f7f5f1", {}, "plaster"), concrete: mat("#b9b7b2", { roughness: .9 }, "concrete"),
    floor: mat("#ffffff", { roughness: .5 }, "wood"), tile: mat("#ffffff", { roughness: .3 }, "tile"),
    grass: mat("#ffffff", { roughness: 1, envMapIntensity: .2 }, "grass"), paving: mat("#ffffff", { roughness: .85 }, "paving"), asphalt: mat("#ffffff", { roughness: .95, envMapIntensity: .2 }, "asphalt"),
    navy: mat(C.navy, { roughness: .95 }), navy2: mat(C.navy2, { roughness: .95 }), copperF: mat(C.copper, { roughness: .9 }), sageF: mat(C.sage, { roughness: .95 }),
    linen: mat(C.linen, { roughness: .95 }), sheet: mat("#f3efe8", { roughness: .95 }), rugA: mat("#cbbfa9", { roughness: 1 }), rugB: mat("#8fa1ab", { roughness: 1 }),
    walnut: mat("#8a6044", { roughness: .5 }, "wood"), oak: mat("#e8d3b4", { roughness: .55 }, "wood"), door: mat("#7b5538", { roughness: .5 }, "wood"),
    cabinet: mat("#4f6b66", { roughness: .45 }), cabinetU: mat("#e4dfd4", { roughness: .5 }),
    quartz: mat("#f0ece4", { roughness: .22, envMapIntensity: .9 }), steel: mat("#b9bec3", { roughness: .3, metalness: .9, envMapIntensity: 1 }),
    black: mat("#16181b", { roughness: .4 }), charcoalP: mat("#2b3138", { roughness: .8 }), screen: mat("#07090c", { roughness: .15, metalness: .4, emissive: "#0d2236", envMapIntensity: 1 }),
    brass: mat("#b98d4b", { roughness: .3, metalness: .9, envMapIntensity: 1 }), ceramic: mat("#f6f6f3", { roughness: .2, envMapIntensity: .9 }),
    pot: mat("#a85d3b", { roughness: .8 }), leaf: mat("#4f7a4a", { roughness: .7, side: THREE.DoubleSide }), leafBox: mat("#5b8a4e", { roughness: .9 }),
    mirror: mat("#dbe8ee", { roughness: .03, metalness: 1, envMapIntensity: 1.6 }),
    glass: mat("#a9c9d8", { roughness: .04, metalness: .15, transparent: true, opacity: .26, envMapIntensity: 1.6, depthWrite: false }),
    frame: mat("#25292e", { roughness: .45, metalness: .6 }),
    glow: new THREE.MeshBasicMaterial({ color: col("#ffeccc") }),
    shade: mat("#f3e2c4", { roughness: 1, emissive: "#f0c98a", emissiveIntensity: .9, side: THREE.DoubleSide }),
    warm: mat("#3b2a1a", { roughness: 1, emissive: "#ffb866", emissiveIntensity: .85 }), warmHi: mat("#3b2a1a", { roughness: 1, emissive: "#ffd27a", emissiveIntensity: 2 }),
    trunk: mat("#5a4636"), skin: mat("#c99a76"), sand: mat("#b9a583", { roughness: 1, envMapIntensity: .2 }), brick: mat("#a4523a", { roughness: .9 }),
    crane: mat("#e0a82e", { roughness: .5, metalness: .3 }), line: mat("#e8e4d8", { roughness: .8 }), roof: mat("#8a8d90", { roughness: .9 }, "concrete"),
    foliage: [mat("#5d7d44", { flatShading: true }), mat("#4e7048", { flatShading: true }), mat("#6b8c4c", { flatShading: true })],
    facA: mat("#ffffff", { roughness: .5 }, "facA"), facB: mat("#ffffff", { roughness: .5 }, "facB"), facC: mat("#ffffff", { roughness: .5 }, "facC"), facD: mat("#ffffff", { roughness: .5 }, "facD")
  };

  /* ---------- geometry helpers ---------- */
  const LEAF_G = new THREE.SphereGeometry(1, 8, 6); LEAF_G.userData.keep = true;
  function bx(w, h, d, m, x = 0, y = 0, z = 0) {
    const m0 = Array.isArray(m) ? m[0] : m, g = new THREE.BoxGeometry(w, h, d), ts = m0.userData.ts;
    if (ts) { const uv = g.attributes.uv, f = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let i = 0; i < uv.count; i++) { const q = f[i >> 2]; uv.setXY(i, uv.getX(i) * q[0] / ts, uv.getY(i) * q[1] / ts); } }
    const o = new THREE.Mesh(g, m); o.position.set(x, y + h / 2, z); o.castShadow = !m0.transparent; o.receiveShadow = true; return o;
  }
  const cy = (rt, rb, h, m, x = 0, y = 0, z = 0, s = 20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m); o.position.set(x, y + h / 2, z); o.castShadow = true; o.receiveShadow = true; return o; };
  const grp = (...c) => { const g = new THREE.Group(); c.forEach(k => g.add(k)); return g; };
  function plane(w, d, m, x, y, z) {
    const g = new THREE.PlaneGeometry(w, d), ts = m.userData.ts;
    if (ts) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / ts, uv.getY(i) * d / ts); }
    const o = new THREE.Mesh(g, m); o.rotation.x = -PI / 2; o.position.set(x, y, z); o.receiveShadow = true; return o;
  }
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

  /* ---------- furniture (all built facing +z, base on y=0) ---------- */
  const F = {};
  const seat = (L, D, body, cush, pil) => {
    const g = grp(bx(L, .3, D, body, 0, .1), bx(.2, .46, D, body, -L / 2 + .1, .1), bx(.2, .46, D, body, L / 2 - .1, .1), bx(L - .4, .5, .22, body, 0, .1, -D / 2 + .11));
    const n = L > 1.3 ? Math.round((L - .4) / .7) : 1, cw = (L - .4) / n;
    for (let i = 0; i < n; i++) { const x = -L / 2 + .2 + cw * (i + .5); g.add(bx(cw - .02, .16, D - .3, cush, x, .4, .1)); const b = bx(cw - .04, .42, .16, cush, x, .5, -D / 2 + .3); b.rotation.x = -.16; g.add(b); }
    corners.forEach(([a, b]) => g.add(cy(.025, .02, .1, M.walnut, a * (L / 2 - .1), 0, b * (D / 2 - .1), 8)));
    pil.forEach(([x, m, ry]) => { const p = bx(.42, .4, .12, m, x, .5, -.1); p.rotation.set(-.2, ry, 0); g.add(p); }); return g;
  };
  F.sofa = L => seat(L || 2.2, .92, M.navy, M.navy2, [[-.75, M.copperF, .25], [-.45, M.linen, -.2], [.8, M.sageF, .2]]);
  F.armchair = () => seat(.86, .84, M.linen, M.linen, [[.05, M.copperF, .3]]);
  F.coffee = L => {
    L = L || 1.1; const g = grp(bx(L, .04, .6, M.walnut, 0, .38), bx(L - .1, .02, .5, M.walnut, 0, .16));
    corners.forEach(([a, b]) => g.add(bx(.04, .38, .04, M.black, a * (L / 2 - .05), 0, b * .25)));
    g.add(cy(.05, .04, .18, M.ceramic, -.25, .42, 0, 14), bx(.22, .04, .16, M.copperF, .2, .42, .05), bx(.2, .03, .14, M.navy, .2, .46, .05)); return g;
  };
  F.tv = L => { L = L || 1.8; const g = grp(bx(L, .42, .4, M.walnut, 0, .12), bx(.3, .06, .18, M.black, 0, .54), bx(1.25, .72, .04, M.screen, 0, .6)); [-1, 1].forEach(a => g.add(cy(.03, .025, .12, M.black, a * (L / 2 - .1), 0, 0, 8))); return g; };
  F.rug = (w, d) => grp(bx(w, .015, d, M.rugA), bx(w - .3, .018, d - .3, M.rugB));
  F.plant = h => {
    h = h || 1.3; const g = grp(cy(.2, .15, .36, M.pot, 0, 0), cy(.19, .19, .02, M.trunk, 0, .34)), r = rng(h * 100 | 0); g.userData.nb = true;
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.283 + r(), ph = .25 + r() * .5, hl = (h - .4) / 2 * (.7 + r() * .3), p = new THREE.Group(), l = new THREE.Mesh(LEAF_G, M.leaf);
      l.scale.set(.09, hl, .03); l.position.set(Math.sin(ph) * hl, .36 + Math.cos(ph) * hl, 0); l.rotation.z = -ph; l.castShadow = true; p.add(l); p.rotation.y = -a; g.add(p);
    } return g;
  };
  F.lamp = () => { const g = grp(cy(.14, .14, .025, M.black, 0, 0), cy(.012, .012, 1.45, M.black, 0, .02), cy(.17, .22, .3, M.shade, 0, 1.4, 0, 20)); g.userData.nb = true; return g; };
  F.bed = W => {
    W = W || 1.6;
    return grp(bx(W + .1, .26, 2.08, M.walnut, 0, .08), bx(W, .24, 2, M.sheet, 0, .34), bx(W + .24, 1.05, .12, M.navy, 0, .05, -1.04), bx(W + .02, .05, .95, M.copperF, 0, .57, .5),
      bx(.56, .14, .36, M.sheet, -W * .25, .58, -.75), bx(.56, .14, .36, M.sheet, W * .25, .58, -.75));
  };
  F.nstand = () => grp(bx(.46, .5, .4, M.walnut), cy(.07, .08, .03, M.brass, 0, .5, 0, 12), cy(.012, .012, .12, M.brass, 0, .53, 0, 8), cy(.1, .13, .17, M.shade, 0, .62, 0, 16));
  F.wardrobe = L => {
    L = L || 1.8; const n = Math.max(2, Math.round(L / .6)), g = grp(bx(L, 2.1, .6, M.cabinetU));
    for (let i = 1; i < n; i++) g.add(bx(.012, 2, .01, M.black, -L / 2 + i * L / n, .05, .3));
    for (let i = 0; i < n; i++) g.add(bx(.02, .28, .02, M.brass, -L / 2 + (i + (i % 2 ? .12 : .88)) * L / n, .95, .32)); return g;
  };
  const chair = () => { const g = grp(bx(.44, .05, .42, M.linen, 0, .43), bx(.42, .46, .04, M.linen, 0, .48, -.2)); corners.forEach(([a, b]) => g.add(cy(.018, .015, .43, M.black, a * .19, 0, b * .18, 6))); return g; };
  F.dining = L => {
    L = L || 1.6; const g = grp(bx(L, .05, .9, M.walnut, 0, .72)); corners.forEach(([a, b]) => g.add(bx(.07, .72, .07, M.black, a * (L / 2 - .08), 0, b * .37)));
    [-1, 1].forEach(a => [-1, 1].forEach(b => { const c = chair(); c.position.set(a * L * .25, 0, b * .66); if (b > 0) c.rotation.y = PI; g.add(c); }));
    g.add(cy(.06, .04, .22, M.ceramic, 0, .77, 0, 12), cy(.005, .005, HH - 1.8, M.black, 0, 1.8, 0, 6), cy(.06, .32, .24, M.shade, 0, 1.56, 0, 24), cy(.04, .04, .05, M.glow, 0, 1.52, 0, 10)); return g;
  };
  F.kitchen = L => {
    L = L || 3.6; const g = grp(bx(L, .88, .6, M.cabinet), bx(L + .02, .04, .64, M.quartz, 0, .88, .01), bx(L, .5, .02, M.tile, 0, .92, -.29)), n = Math.round(L / .6);
    for (let i = 1; i < n; i++) g.add(bx(.01, .7, .01, M.black, -L / 2 + i * L / n, .1, .3));
    for (let i = 0; i < n; i++) g.add(bx(.14, .015, .015, M.brass, -L / 2 + (i + .5) * L / n, .8, .31));
    const up = L * .25; g.add(bx(up, .7, .34, M.cabinetU, -L / 2 + up / 2, 1.5, -.13));
    g.add(bx(.6, .015, .4, M.steel, L * .2, .915, 0), cy(.012, .012, .26, M.steel, L * .2, .92, -.2, 8), bx(.6, .015, .5, M.black, -L * .2, .925, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(cy(.06, .06, .01, M.steel, -L * .2 + a * .14, .94, b * .11, 14)));
    g.add(bx(.8, .12, .5, M.steel, -L * .2, 1.72, -.1), bx(.3, HH - 1.84, .26, M.steel, -L * .2, 1.84, -.17)); return g;
  };
  F.island = L => {
    L = L || 2.2; const g = grp(bx(L, .9, .85, M.cabinet), bx(L + .1, .05, .95, M.quartz, 0, .9, .03));
    [-1, 0, 1].forEach(a => { const s = grp(cy(.17, .17, .05, M.linen, 0, .62, 0, 14), cy(.02, .02, .62, M.black, 0, 0, 0, 6), cy(.14, .14, .02, M.black, 0, 0, 0, 12)); s.position.set(a * L * .3, 0, .78); g.add(s); }); return g;
  };
  F.fridge = () => grp(bx(.76, 1.82, .7, M.steel), bx(.74, .012, .02, M.black, 0, 1.2, .35), bx(.025, .55, .035, M.steel, -.3, 1.25, .38), bx(.025, .4, .035, M.steel, -.3, .6, .38));
  F.vanity = () => grp(bx(.8, .5, .45, M.oak, 0, .3), bx(.84, .04, .48, M.ceramic, 0, .8), cy(.2, .16, .12, M.ceramic, 0, .84, 0, 24), cy(.012, .012, .2, M.steel, 0, .84, -.15, 8),
    bx(.7, .9, .02, M.mirror, 0, 1.2, -.22), bx(.72, .03, .03, M.glow, 0, 2.12, -.2));
  F.toilet = () => { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M.ceramic); b.scale.set(.2, .18, .3); b.position.set(0, .27, .08); b.castShadow = true; return grp(b, bx(.38, .42, .18, M.ceramic, 0, .3, -.28), bx(.4, .03, .46, M.ceramic, 0, .44, .05)); };
  F.shower = () => grp(bx(.95, .04, .95, M.ceramic), bx(.02, 2, .95, M.glass, .48, .04, 0), bx(.95, 2, .02, M.glass, 0, .04, .48), cy(.01, .01, 2.1, M.steel, -.4, 0, -.4, 6), cy(.1, .1, .02, M.steel, -.4, 2.1, -.3, 16));
  F.desk = L => {
    L = L || 1.4; const g = grp(bx(L, .04, .7, M.oak, 0, .72), bx(.04, .72, .66, M.black, -L / 2 + .04), bx(.04, .72, .66, M.black, L / 2 - .04), bx(.34, .01, .24, M.steel, .2, .76, .05), bx(.34, .22, .01, M.screen, .2, .77, -.07));
    const ch = grp(cy(.22, .22, .06, M.charcoalP, 0, .44, 0, 16), bx(.4, .5, .05, M.charcoalP, 0, .48, .2), cy(.03, .03, .44, M.black, 0, 0, 0, 6), cy(.25, .25, .03, M.black, 0, 0, 0, 5)); ch.position.z = .72; g.add(ch); return g;
  };
  const books = [M.navy, M.copperF, M.sageF, M.linen, M.black, M.navy2];
  F.shelf = (L, Hh) => {
    L = L || 1.2; Hh = Hh || 2; const r = rng(L * 100 | 0), g = grp(bx(.03, Hh, .32, M.walnut, -L / 2), bx(.03, Hh, .32, M.walnut, L / 2), bx(L, Hh, .01, M.walnut, 0, 0, -.16)), n = 5;
    for (let i = 0; i <= n; i++) { const y = i * (Hh - .03) / n; g.add(bx(L, .03, .32, M.walnut, 0, y)); if (i < n) { let x = -L / 2 + .06; while (x < L / 2 - .12) { const w = .03 + r() * .03, h = .2 + r() * .09; if (r() < .85) g.add(bx(w, h, .22, books[(r() * books.length) | 0], x + w / 2, y + .03, 0)); x += w + .004; } } } return g;
  };
  F.sideboard = L => {
    L = L || 1.8; const g = grp(bx(L, .62, .4, M.walnut, 0, .14)), n = Math.round(L / .6);
    corners.forEach(([a, b]) => g.add(cy(.02, .015, .14, M.black, a * (L / 2 - .08), 0, b * .15, 6)));
    for (let i = 1; i < n; i++) g.add(bx(.01, .55, .01, M.black, -L / 2 + i * L / n, .17, .2));
    g.add(cy(.07, .05, .3, M.ceramic, -L * .3, .76, 0, 12), bx(.3, .04, .2, M.copperF, L * .2, .76, 0)); return g;
  };
  F.gond = L => {
    L = L || 5; const r = rng(L * 31 | 0), g = grp(bx(L, .15, .62, M.black), bx(L, 1.7, .03, M.cabinetU, 0, .15)), pr = [M.navy, M.copperF, M.sageF, M.linen, M.navy2, M.sheet];
    for (let i = 0; i < 3; i++) {
      const y = .15 + i * .5; if (i) [-1, 1].forEach(s => g.add(bx(L, .025, .28, M.steel, 0, y, s * .16)));
      [-1, 1].forEach(s => { let x = -L / 2 + .1; while (x < L / 2 - .3) { const w = .2 + r() * .14, h = .18 + r() * .14; g.add(bx(w, h, .18, pr[(r() * pr.length) | 0], x + w / 2, y + .025, s * .16)); x += w + .03; } });
    }
    [-1, 1].forEach(a => g.add(bx(.04, 1.85, .62, M.black, a * L / 2))); return g;
  };
  F.billing = L => {
    L = L || 3; const hang = grp(bx(1.6, .4, .05, M.copperF, 0, 2.3), cy(.004, .004, HH - 2.7, M.black, -.7, 2.7, 0, 4), cy(.004, .004, HH - 2.7, M.black, .7, 2.7, 0, 4));
    return grp(bx(L, 1, .7, M.navy2), bx(L + .06, .05, .8, M.quartz, 0, 1), bx(.3, .22, .015, M.screen, -L * .25, 1.1, 0), bx(.14, .02, .1, M.black, L * .1, 1.05), hang);
  };
  F.round = () => {
    const g = grp(cy(.7, .7, .76, M.navy2, 0, 0, 0, 28), cy(.74, .74, .04, M.quartz, 0, .76, 0, 28)), r = rng(5), pr = [M.copperF, M.sageF, M.linen, M.navy];
    for (let i = 0; i < 9; i++) { const a = i * .7, d = i ? .35 + r() * .15 : 0; g.add(cy(.07 + r() * .05, .07, .18 + r() * .16, pr[i % 4], Math.cos(a) * d, .8, Math.sin(a) * d, 14)); } return g;
  };
  F.wallshelf = L => {
    L = L || 6; const r = rng((L | 0) + 3), g = grp(bx(L, 2.3, .06, M.cabinetU, 0, 0, -.2));
    for (let i = 0; i < 5; i++) { const y = .35 + i * .45; g.add(bx(L, .035, .38, M.walnut, 0, y, -.01)); let x = -L / 2 + .1; while (x < L / 2 - .3) { const w = .15 + r() * .12, h = .15 + r() * .15; g.add(bx(w, h, .2, books[(r() * books.length) | 0], x + w / 2, y + .035, -.05)); x += w + .05; } } return g;
  };
  function person(m) {
    const g = grp(cy(.075, .075, .82, M.charcoalP, -.09, 0, 0, 8), cy(.075, .075, .82, M.charcoalP, .09, 0, 0, 8), cy(.19, .15, .62, m, 0, .8, 0, 12));
    const h = new THREE.Mesh(new THREE.SphereGeometry(.115, 12, 10), M.skin); h.position.y = 1.56; h.castShadow = true; g.add(h); return g;
  }

  /* ---------- paths, labels, world ---------- */
  const pathLen = pts => pts.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);
  function pathAt(pts, u) {
    const seg = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
    let d = clamp(u) * L;
    for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(d / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= seg[i]; }
  }
  function label(text) {
    const c = document.createElement("canvas"); c.width = 320; c.height = 72; const x = c.getContext("2d");
    x.fillStyle = "rgba(244,239,230,.94)"; x.fillRect(0, 0, 320, 72); x.fillStyle = "#0C1A2B"; x.font = "600 30px Manrope, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 160, 38);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(2.8, .63, 1); s.renderOrder = 5; return s;
  }
  function world() {
    const g = new THREE.Group(), items = [];
    const rise = (o, a, b) => { g.add(o); items.push({ o, a, b }); o.scale.y = .001; return o; };
    const step = p => items.forEach(i => { const k = ease(clamp((p - i.a) / (i.b - i.a))); i.o.scale.y = Math.max(.001, k); i.o.visible = k > .002; });
    return { g, rise, step };
  }
  function tree(x, z, s) {
    const t = grp(cy(.1 * s, .16 * s, 2.4 * s, M.trunk, 0, 0, 0, 8));
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry((1.5 - i * .25) * s, 1), M.foliage[i]); c.position.set((i - 1) * .5 * s, (3.1 + i * .7) * s, (i % 2 - .5) * .6 * s); c.castShadow = true; t.add(c); }
    t.position.set(x, -.3, z); return t;
  }
  function surround(g, cx, cz, R, o = {}) {
    g.add(plane(260, 260, o.ground || M.grass, cx, -.3, cz));
    const r = rng(Math.round(R * 31) + 5), n = o.trees === undefined ? 16 : o.trees;
    for (let i = 0; i < n; i++) {
      const a = r() * 2 * PI, d = R + 4 + r() * 16, s = .8 + r() * .6;
      if (o.avoid !== undefined && Math.abs(Math.atan2(Math.sin(a - o.avoid), Math.cos(a - o.avoid))) < .55) continue;
      g.add(tree(cx + Math.cos(a) * d, cz + Math.sin(a) * d, s));
    }
  }
  const arc = (cx, cz, R0, angs) => angs.map(a => [cx + R0 * Math.cos(PI / 2 + a), cz + R0 * Math.sin(PI / 2 + a)]);

  /* ---------- builders ---------- */
  const B = {};
  function interior(P) {
    const { g, rise, step } = world(), H = HH = P.h || 2.8, W = P.w, D = P.d, outer = P.outer || 4, ctr = [W / 2, D / 2], blk = [];
    g.add(plane(W, D, M.floor, W / 2, .006, D / 2));
    (P.zones || []).forEach(([x, z, w, d, k]) => g.add(plane(w, d, M[k], x + w / 2, .012, z + d / 2)));
    g.add(bx(W + .8, .3, D + .8, M.concrete, W / 2, -.3, D / 2));
    const bb = new THREE.Box3(), nf = (P.furn || []).length;
    (P.furn || []).forEach(([t, x, z, r, a, b], i) => {
      const o = F[t](a, b); o.position.set(x, 0, z); o.rotation.y = rad(r || 0); o.updateMatrixWorld(true);
      (function walk(n) { if (n.userData.nb) return; if (n.isMesh) { bb.setFromObject(n); if (bb.max.y > 1.2 && bb.min.y < 2) blk.push(bb.clone()); } n.children.forEach(walk); })(o);
      const s = .3 + i * (.16 / nf); rise(o, s, s + .12);
    });
    const blocked = (ax, az, cx, cz) => { for (let k = 0; k <= 6; k++) { const px = lerp(ax, cx, k / 6), pz = lerp(az, cz, k / 6); if (blk.some(b => px > b.min.x - .1 && px < b.max.x + .1 && pz > b.min.z - .1 && pz < b.max.z + .1)) return true; } return false; };
    let entry = null; const nw = P.walls.length;
    P.walls.forEach((w, i) => {
      const [x1, z1, x2, z2, dr = []] = w, L = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / L, uz = (z2 - z1) / L, ext = i < outer, T = ext ? .24 : .14, ops = [];
      const inw = ((ctr[0] - x1) * -uz + (ctr[1] - z1) * ux) > 0 ? 1 : -1;
      dr.forEach(([t, wd, main]) => ops.push({ a: t - wd / 2, b: t + wd / 2, y0: 0, y1: 2.1, door: 1, main, wd, t }));
      if (ext) {
        const jn = []; P.walls.forEach((o, j) => { if (j === i) return; [[o[0], o[1]], [o[2], o[3]]].forEach(([ex, ez]) => { const t = (ex - x1) * ux + (ez - z1) * uz, pr = Math.abs((ex - x1) * uz - (ez - z1) * ux); if (pr < .3 && t > 0 && t < L) jn.push(t); }); });
        const n = Math.round((L - 1.2) / 3.2);
        for (let k = 0; k < n; k++) {
          const c = L * (k + .5) / n, wd = Math.min(1.7, L / n - 1.3), a = c - wd / 2, b = c + wd / 2;
          if (wd < .7 || ops.some(o => a < o.b + .5 && b > o.a - .5) || jn.some(t => a < t + .35 && b > t - .35) || blocked(x1 + ux * a, z1 + uz * a, x1 + ux * b, z1 + uz * b)) continue;
          ops.push({ a, b, y0: .9, y1: 2.15 });
        }
      }
      const wg = new THREE.Group(); wg.position.set(x1, 0, z1); wg.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      const pc = (a, b, y0, y1) => { if (b - a > .01 && y1 - y0 > .01) wg.add(bx(b - a, y1 - y0, T, M.wall, (a + b) / 2, y0, 0)); };
      ops.sort((p, q) => p.a - q.a); let cur = -T / 2;
      ops.forEach(o => {
        pc(cur, o.a, 0, H); pc(o.a, o.b, 0, o.y0); pc(o.a, o.b, o.y1, H); cur = o.b;
        const gw = o.b - o.a, gh = o.y1 - o.y0, cx = (o.a + o.b) / 2;
        if (!o.door) {
          wg.add(bx(gw, gh, .02, M.glass, cx, o.y0), bx(gw, .06, .1, M.frame, cx, o.y0), bx(gw, .06, .1, M.frame, cx, o.y1 - .06), bx(.06, gh, .1, M.frame, o.a + .03, o.y0), bx(.06, gh, .1, M.frame, o.b - .03, o.y0), bx(.04, gh, .08, M.frame, cx, o.y0), bx(gw + .2, .04, T + .12, M.white, cx, o.y0 - .04));
        } else {
          wg.add(bx(.07, 2.1, T + .04, M.door, o.a + .035), bx(.07, 2.1, T + .04, M.door, o.b - .035), bx(gw, .07, T + .04, M.door, cx, 2.03));
          if (o.main) {
            const pv = new THREE.Group(); pv.position.set(o.a + .04, 0, 0); pv.rotation.y = inw > 0 ? -rad(78) : rad(78);
            pv.add(bx(o.wd - .08, 2.02, .05, M.door, (o.wd - .08) / 2), bx(.12, .025, .03, M.brass, o.wd - .22, 1, .04)); wg.add(pv);
            entry = { x: x1 + ux * o.t, z: z1 + uz * o.t, nx: inw * uz, nz: -inw * ux };
          }
        }
      });
      pc(cur, L + T / 2, 0, H);
      const a = .03 + i / nw * .14; rise(wg, a, a + .14);
    });
    if (entry) {
      const eg = new THREE.Group(); eg.position.set(entry.x, 0, entry.z); eg.rotation.y = -Math.atan2(entry.nz, entry.nx);
      eg.add(bx(1, .3, 2, M.concrete, .62, -.3), bx(.5, .15, 2, M.concrete, 1.37, -.3), bx(8, .08, 1.8, M.paving, 5.62, -.3)); g.add(eg);
    }
    surround(g, ctr[0], ctr[1], Math.max(W, D) * .75, { avoid: entry ? Math.atan2(entry.nz, entry.nx) : undefined });
    /* roof / ceiling with downlights */
    const roof = new THREE.Group();
    roof.add(bx(W + .8, .3, D + .8, [M.wall, M.wall, M.concrete, M.white, M.wall, M.wall], W / 2, 0, D / 2),
      bx(W + .8, .3, .12, M.wall, W / 2, .3, -.34), bx(W + .8, .3, .12, M.wall, W / 2, .3, D + .34), bx(.12, .3, D + .8, M.wall, -.34, .3, D / 2), bx(.12, .3, D + .8, M.wall, W + .34, .3, D / 2));
    const labs = (P.rooms || []).map(([t, x, z]) => {
      roof.add(cy(.09, .09, .02, M.glow, x, -.02, z, 16));
      const L = new THREE.PointLight(col("#ffd9a8"), .9, 7, 2); L.position.set(x, H - .4, z); g.add(L);
      const s = label(t); s.position.set(x, H + .6, z); g.add(s); return s;
    });
    roof.position.y = H; g.add(roof);
    const cp = P.crowd || P.path, wk = [];
    if (P.mode === "flow") { const cs = [M.navy, M.copperF, M.sageF, M.linen, M.navy2, M.sheet]; for (let i = 0; i < 8; i++) { const s = person(cs[i % cs.length]); g.add(s); wk.push(s); } }
    return {
      g, interior: true, c: [W / 2, 1, D / 2], r: Math.max(W, D) * 1.55 + 3, ext: Math.max(W, D) * .85 + 5, path: P.path, speed: .95,
      shot: P.shot || { p: [W / 2 - 14, 4, D + 12], t: [W / 2, 1.5, D / 2], fov: 50 },
      upd(p, t, rk) {
        step(p); M.wall.wireframe = P.mode === "sketch" && p < .6; const ek = ease(clamp(rk));
        roof.visible = ek > .001; roof.position.y = H + (1 - ek) * 5;
        labs.forEach(s => { s.material.opacity = clamp((p - .55) * 4) * (1 - ek); s.visible = s.material.opacity > .01; });
        wk.forEach((s, i) => { const u = (t * .04 + i / wk.length) % 1, [x, z] = pathAt(cp, u); s.position.set(x + Math.sin(i * 7) * .35, Math.abs(Math.sin(t * 6 + i)) * .02, z + Math.cos(i * 5) * .35); s.visible = p > .7; });
      }
    };
  }
  B.house = B.room = B.sketch = B.vr = B.flow = interior;

  B.facade = P => {
    const { g, rise, step } = world(), F_ = P.floors, W = P.w, D = P.d, fh = 3.2, gw = W - 2.6;
    surround(g, 0, 0, Math.max(W, D) * .8 + 4, { avoid: PI / 2 });
    g.add(plane(34, 15, M.paving, 0, -.28, D / 2 + 7.5), plane(120, 9, M.asphalt, 0, -.29, D / 2 + 20), bx(120, .16, .3, M.concrete, 0, -.3, D / 2 + 15.5));
    for (let f = 0; f < F_; f++) {
      const fg = new THREE.Group(); fg.position.y = f * fh;
      fg.add(bx(W + .4, .3, D + .4, M.concrete), bx(1.3, fh - .3, D, M.wall, -W / 2 + .65, .3), bx(1.3, fh - .3, D, M.wall, W / 2 - .65, .3), bx(gw, fh - .3, .3, M.wall, 0, .3, -D / 2 + .15), bx(gw, fh - .3, .05, M.glass, 0, .3, D / 2 - .1));
      for (let m = 0; m <= 4; m++) fg.add(bx(.06, fh - .3, .1, M.frame, -gw / 2 + m * gw / 4, .3, D / 2 - .1));
      fg.add(bx(gw, .06, .1, M.frame, 0, .3 + (fh - .3) * .72, D / 2 - .1));
      if (f === 0 || (f * 7 + 3) % 5 !== 0) fg.add(bx(gw - .2, fh - .8, .02, M.warm, 0, .45, D / 2 - .6));
      if (f > 0) {
        fg.add(bx(gw + .8, .18, 1.5, M.concrete, 0, 0, D / 2 + .55), bx(gw + .8, 1, .03, M.glass, 0, .18, D / 2 + 1.28), bx(gw + .8, .05, .06, M.frame, 0, 1.14, D / 2 + 1.28),
          bx(1.6, .32, .34, M.concrete, -gw / 2 + 1, .18, D / 2 + 1), bx(1.5, .2, .3, M.leafBox, -gw / 2 + 1, .5, D / 2 + 1));
        if (f % 2) fg.add(bx(1.3, fh - .3, .06, M.oak, W / 2 - .65, .3, D / 2 + .03));
      } else fg.add(bx(gw + .8, .14, 2.2, M.concrete, 0, fh - .14, D / 2 + .9), bx(.05, 2.3, .07, M.brass, 0, .3, D / 2 - .06));
      const a = f / F_ * .55; rise(fg, a, a + .17);
    }
    const rf = grp(bx(W + .4, .3, D + .4, M.concrete), bx(W + .4, .5, .15, M.wall, 0, .3, D / 2 + .125), bx(W + .4, .5, .15, M.wall, 0, .3, -D / 2 - .125), bx(.15, .5, D, M.wall, -W / 2 - .125, .3), bx(.15, .5, D, M.wall, W / 2 + .125, .3),
      cy(.8, .8, 1.3, M.steel, -W / 4, .3, -D / 4, 18), bx(2, 1.4, 2, M.wall, W / 4, .3, -D / 4));
    rf.position.y = F_ * fh; rise(rf, .7, .88);
    return { g, c: [0, F_ * fh * .45, 0], r: F_ * fh * 1.7 + 12, ext: Math.max(F_ * fh, 20) * .8 + 8, path: [[-17, D / 2 + 13], [-6, D / 2 + 11.5], [6, D / 2 + 11.5], [17, D / 2 + 13]], face: [0, F_ * fh * .42, 0], speed: 1.4,
      shot: { p: [-12, 1.65, D / 2 + 13], t: [0, F_ * fh * .42, 0], fov: 62 }, upd: p => step(p) };
  };

  B.build = P => {
    const { g, rise, step } = world(), Fl = P.floors, Cc = P.cols, Rr = P.rows, bay = 3.4, fh = 3, w = (Cc - 1) * bay, d = (Rr - 1) * bay, top = Fl * fh + 5;
    surround(g, w / 2, d / 2, Math.max(w, d) * .75 + 6, { trees: 12, avoid: PI / 2 });
    g.add(plane(w + 14, d + 14, M.sand, w / 2, -.28, d / 2));
    rise(bx(w + 3, .35, d + 3, M.concrete, w / 2, -.3, d / 2), 0, .08);
    const baySide = (cx, cz, ry) => {
      const b = new THREE.Group(); b.position.set(cx, 0, cz); b.rotation.y = ry;
      b.add(bx(bay - .4, .9, .2, M.wall), bx(bay - .6, 1.4, .04, M.glass, 0, .9), bx(bay - .6, .04, .08, M.frame, 0, .9), bx(bay - .6, .04, .08, M.frame, 0, 2.26), bx(bay - .4, fh - .28 - 2.3, .2, M.wall, 0, 2.3)); return b;
    };
    for (let f = 0; f < Fl; f++) {
      const s = .08 + f * (.62 / Fl), cg = new THREE.Group(); cg.position.y = f * fh;
      for (let i = 0; i < Cc; i++) for (let j = 0; j < Rr; j++) cg.add(bx(.4, fh - .28, .4, M.concrete, i * bay, 0, j * bay));
      rise(cg, s, s + .1);
      const sg = new THREE.Group(); sg.position.y = (f + 1) * fh - .28; sg.add(bx(w + 1.2, .28, d + 1.2, M.concrete, w / 2, 0, d / 2)); rise(sg, s + .09, s + .17);
      const ig = new THREE.Group(); ig.position.y = f * fh;
      for (let i = 0; i < Cc - 1; i++) { ig.add(baySide(i * bay + bay / 2, 0, 0), baySide(i * bay + bay / 2, d, 0)); }
      for (let j = 0; j < Rr - 1; j++) { ig.add(baySide(0, j * bay + bay / 2, PI / 2), baySide(w, j * bay + bay / 2, PI / 2)); }
      const a = .72 + f * .05; rise(ig, a, a + .12);
    }
    const crane = new THREE.Group(), jibG = new THREE.Group(); crane.add(bx(.5, top, .5, M.crane)); jibG.position.y = top;
    jibG.add(bx(14, .35, .45, M.crane, 3, 0), bx(4, .3, .45, M.crane, -5, 0), bx(1.4, 1.2, .8, M.concrete, -6, -.6), bx(.9, .9, .9, M.crane, .8, .35), cy(.02, .02, 5, M.black, 8, -5, 0, 6), bx(.4, .4, .3, M.steel, 8, -5.4));
    crane.add(jibG); crane.position.set(-3.5, 0, -3.5); g.add(crane);
    const pile = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 14), M.sand); pile.position.set(w + 4, .3, d + 3); pile.castShadow = true; g.add(pile);
    g.add(bx(1.2, .8, .9, M.brick, -3, -.3, d + 3), bx(1.2, .8, .9, M.brick, -1.6, -.3, d + 3.4));
    const R0 = Math.max(w, d) / 2 + 12, path = arc(w / 2, d / 2, R0, [-.75, -.35, 0, .35, .75]);
    return { g, c: [w / 2, Fl * fh / 2, d / 2], r: Math.max(w, d, Fl * fh) * 2.3 + 6, ext: Math.max(w, d) * .75 + 12, path, face: [w / 2, Fl * fh * .4, d / 2], speed: 1.3,
      shot: { p: [path[1][0], 1.65, path[1][1]], t: [w / 2, Fl * fh * .45, d / 2], fov: 62 },
      upd(p, t) { step(p); jibG.rotation.y = t * .35; crane.visible = p < .95; } };
  };

  B.tower = P => {
    const { g, rise, step } = world(), Fl = P.floors, fh = 3.2, S = 12, panels = [];
    surround(g, 0, 0, 20, { avoid: PI / 2 });
    g.add(plane(46, 46, M.paving, 0, -.28, 0), plane(120, 9, M.asphalt, 0, -.29, 36), bx(120, .16, .3, M.concrete, 0, -.3, 31.5));
    rise(bx(4, Fl * fh + 2, 4, M.concrete, 0, 0, 0), 0, .45);
    for (let f = 0; f < Fl; f++) {
      const fg = new THREE.Group(); fg.position.y = f * fh; fg.add(bx(S + .6, .3, S + .6, M.concrete));
      corners.forEach(([a, b]) => fg.add(bx(.5, fh - .3, .5, M.white, a * S / 2, .3, b * S / 2)));
      for (let s = 0; s < 4; s++) {
        const sg = new THREE.Group(); sg.rotation.y = s * PI / 2; sg.add(bx(S - .5, fh - .3, .05, M.glass, 0, .3, S / 2));
        for (let m = 0; m < 5; m++) sg.add(bx(.06, fh - .3, .1, M.frame, -S / 2 + .25 + m * (S - .5) / 4, .3, S / 2));
        if ((f * 5 + s * 3) % 7 > 2) { const pn = bx(S - 1.2, fh - 1, .02, M.warm, 0, .5, S / 2 - .6); sg.add(pn); panels.push(pn); }
        if ((f + s) % 3 === 0) sg.add(bx(4, .14, 1.5, M.concrete, 0, 0, S / 2 + .6), bx(4, 1, .03, M.glass, 0, .14, S / 2 + 1.33));
        fg.add(sg);
      }
      const a = f / Fl * .7; rise(fg, a, a + .14);
    }
    const crown = grp(bx(S + .6, .5, S + .6, M.concrete), cy(.1, .15, 6, M.steel, 0, .5, 0, 8), cy(.18, .18, .2, M.glow, 0, 6.5, 0, 10)); crown.position.y = Fl * fh; rise(crown, .8, .95);
    return { g, c: [0, Fl * fh / 2, 0], r: Fl * fh * 2 + 10, ext: 26, path: arc(0, 0, 26, [-.65, -.2, .2, .65]), face: [0, Fl * fh * .4, 0], speed: 1.4,
      shot: { p: arc(0, 0, 26, [-.5])[0].flatMap((q, i) => i ? [1.65, q] : [q]).slice(0, 3), t: [0, Fl * fh * .4, 0], fov: 62 },
      upd(p, t) { step(p); const k = Math.floor(t * 1.2) % panels.length; panels.forEach((m, i) => m.material = (i === k && p > .9) ? M.warmHi : M.warm); } };
  };

  B.massing = P => {
    const { g, rise, step } = world(), r = rng(P.seed), cell = 15, cols = 4, kinds = [M.facA, M.facB, M.facC, M.facD];
    g.add(plane(180, 150, M.asphalt, 0, -.3, 0));
    for (let z = -37.5; z <= 37.5; z += 15) for (let x = -50; x < 50; x += 5) g.add(bx(1.6, .02, .18, M.line, x, -.3, z));
    for (let x = -30; x <= 30; x += 15) for (let z = -35; z < 35; z += 5) g.add(bx(.18, .02, 1.6, M.line, x, -.3, z));
    for (let i = 0; i < P.n; i++) {
      const cx = ((i % cols) - 1.5) * cell, cz = (Math.floor(i / cols) - 1) * cell, w = r() < .5 ? 6.4 : 9.6, d = r() < .5 ? 6.4 : 9.6, fl = 3 + Math.floor(r() * 6) + (i === 5 ? 6 : 0), fm = kinds[i % 4], h = fl * 3.2;
      g.add(bx(11, .12, 11, M.concrete, cx, -.3, cz), tree(cx + 5, cz + 5, .5), tree(cx - 5, cz + 5, .5));
      const b = new THREE.Group(); b.position.set(cx, -.18, cz); b.add(bx(w, h, d, [fm, fm, M.roof, M.roof, fm, fm])); b.add(bx(1.6, .9, 1.6, M.steel, w / 4, h, d / 4));
      const a = i * .04; rise(b, a, a + .3);
    }
    return { g, c: [0, 6, 0], r: 58, ext: 40, path: [[-30, 7.5], [30, 7.5]], speed: 2.2, pitch: .1, shot: { p: [-18, 1.7, 7.5], t: [8, 6, 7.5], fov: 66 }, upd: p => step(p) };
  };

  /* ---------- scene, sky, renderer ---------- */
  function skyGroup() {
    const g = new THREE.Group(), geo = new THREE.SphereGeometry(400, 32, 20), p = geo.attributes.position, cs = [];
    const top = col("#4b7bb4"), mid = col("#a8c7e0"), hor = col("#f7dcb2"), low = col("#bba98a");
    for (let i = 0; i < p.count; i++) { const h = p.getY(i) / 400, c = h >= 0 ? (h < .3 ? hor.clone().lerp(mid, h / .3) : mid.clone().lerp(top, (h - .3) / .7)) : hor.clone().lerp(low, clamp(-h * 4)); cs.push(c.r, c.g, c.b); }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 12), new THREE.MeshBasicMaterial({ color: col("#fff4dc"), fog: false })); sun.position.copy(SUN).multiplyScalar(380); g.add(sun); return g;
  }
  function renderer(canvas, keep) {
    const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!keep });
    R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = LOOK.exposure;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; return R;
  }
  function envFor(R) { const pm = new THREE.PMREMGenerator(R), sc = new THREE.Scene(); sc.add(skyGroup()); const rt = pm.fromScene(sc, 0, .1, 1000); pm.dispose(); return rt.texture; }
  function stage(env) {
    const S = new THREE.Scene(); S.environment = env; S.fog = new THREE.Fog(col("#f4dab2"), 55, 185);
    S.add(skyGroup(), new THREE.HemisphereLight(col("#cfe1f2"), col("#9a8b72"), LOOK.hemi));
    const d = new THREE.DirectionalLight(col("#ffe2b8"), LOOK.sun); d.castShadow = true; d.shadow.mapSize.set(2048, 2048); d.shadow.bias = -.0005; d.shadow.normalBias = .04;
    S.add(d, d.target); S.userData.sun = d; return S;
  }
  function fitSun(S, W) {
    const d = S.userData.sun, e = W.ext || 20, k = e * 2.4 + 30, c = d.shadow.camera;
    d.target.position.set(W.c[0], 0, W.c[2]); d.position.set(W.c[0] + SUN.x * k, SUN.y * k, W.c[2] + SUN.z * k);
    c.left = c.bottom = -e; c.right = c.top = e; c.near = 1; c.far = e * 5 + 80; c.updateProjectionMatrix(); d.target.updateMatrixWorld();
  }
  const dispose = o => o.traverse(c => { if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose(); });

  /* ---------- viewer ---------- */
  function walkPose(v, W, dt) {
    const L = W.len, s = (v.wt * W.speed / L) % 2, tri = s < 1 ? s : 2 - s, dir = s < 1 ? 1 : -1, u = clamp(tri * 1.14 - .07);
    const [x, z] = pathAt(W.path, u), [lx, lz] = pathAt(W.path, clamp(u + dir * 1.6 / L));
    let tx = lx - x, tz = lz - z, pit = W.pitch || -.03;
    if (W.face) { tx = W.face[0] - x; tz = W.face[2] - z; pit = Math.atan2(W.face[1] - 1.65, Math.hypot(tx, tz)) * .9; }
    if (Math.hypot(tx, tz) > .05) { let dy = Math.atan2(tz, tx) - v.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); v.yaw += dy * Math.min(1, dt * 3); }
    const yaw = v.yaw + v.lyaw, pt = pit + v.lpit, y = 1.64 + (W.interior ? Math.sin(v.wt * 7.2) * .015 : 0);
    return { p: new V3(x, y, z), l: new V3(x + Math.cos(yaw) * Math.cos(pt) * 3, y + Math.sin(pt) * 3, z + Math.sin(yaw) * Math.cos(pt) * 3) };
  }
  function mount(canvas) {
    const R = renderer(canvas); R.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    const S = stage(envFor(R)), cam = new THREE.PerspectiveCamera(46, 1, .08, 900);
    const v = { p: 0, tp: 0, play: false, walk: true, mix: 0, rk: 0, wt: 0, yaw: 0, lyaw: 0, lpit: 0, th: .8, ph: 1.05, zm: 1, rate: .11, cine: null, W: null, vis: true, onp: null, onload: null };
    let last = performance.now(), t0 = last, grp_ = null, drag = null, mx = 0, my = 0; const lk = new V3();
    v.load = P => {
      if (grp_) { S.remove(grp_); dispose(grp_); }
      const W = B[P.mode](P); W.len = W.path ? pathLen(W.path) : 1; grp_ = W.g; S.add(grp_); v.W = W; fitSun(S, W);
      if (W.path) v.yaw = Math.atan2(W.path[1][1] - W.path[0][1], W.path[1][0] - W.path[0][0]);
      v.wt = 0; v.mix = 0; v.rk = 0; v.lyaw = v.lpit = 0; v.walk = !reduce;
      v.p = v.tp = reduce ? 1 : 0; v.play = !reduce && !v.cine; v.onp && v.onp(v.tp); v.onload && v.onload(v);
    };
    const rs = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(rs).observe(canvas); rs();
    new IntersectionObserver(e => v.vis = e[0].isIntersecting).observe(canvas);
    canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (v.mix > .5) { v.lyaw -= dx * .005; v.lpit = clamp(v.lpit + dy * .004, -.6, .6); } else { v.th -= dx * .006; v.ph = clamp(v.ph - dy * .005, .25, 1.45); }
        drag = { x: e.clientX, y: e.clientY };
      }
      mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
    });
    ["pointerup", "pointercancel"].forEach(n => canvas.addEventListener(n, () => drag = null));
    (function loop(now) {
      requestAnimationFrame(loop); const W = v.W; if (!W || !v.vis) return;
      const dt = Math.min((now - last) / 1000, .05), t = (now - t0) / 1000; last = now;
      if (v.play) { v.tp = Math.min(1, v.tp + dt * v.rate); if (v.tp >= 1) v.play = false; v.onp && v.onp(v.tp); }
      v.p += (v.tp - v.p) * Math.min(1, dt * 6);
      const go = !v.cine && v.walk && !!W.path && v.p > .9;
      v.mix += ((go ? 1 : 0) - v.mix) * Math.min(1, dt * 1.5);
      if (v.cine) v.rk = ease(clamp((v.p - .6) / .14)); else v.rk += ((go ? 1 : 0) - v.rk) * Math.min(1, dt * 1.6);
      W.upd(v.p, t, clamp(v.rk)); if (go) v.wt += dt;
      if (!drag) { v.lyaw *= Math.max(0, 1 - dt * .6); v.lpit *= Math.max(0, 1 - dt * .6); }
      let fov = 46;
      if (v.cine) {
        const K = v.cine; let i = 0; while (i < K.length - 2 && v.p > K[i + 1].s) i++;
        const a = K[i], b = K[i + 1], k = ease(clamp((v.p - a.s) / (b.s - a.s)));
        cam.position.set(...a.p.map((q, j) => lerp(q, b.p[j], k))); lk.set(...a.t.map((q, j) => lerp(q, b.t[j], k)));
        lk.x += mx * .8; lk.y -= my * .5; fov = lerp(a.f || 50, b.f || 50, k); cam.lookAt(lk);
      } else {
        if (!drag && !reduce && v.mix < .5) v.th += dt * .12;
        const r = W.r * v.zm, ox = W.c[0] + r * Math.sin(v.ph) * Math.cos(v.th), oy = W.c[1] + r * Math.cos(v.ph), oz = W.c[2] + r * Math.sin(v.ph) * Math.sin(v.th);
        if (v.mix > .001 && W.path) {
          const w = walkPose(v, W, dt), e = ease(v.mix);
          cam.position.set(lerp(ox, w.p.x, e), lerp(oy, w.p.y, e), lerp(oz, w.p.z, e)); lk.set(lerp(W.c[0], w.l.x, e), lerp(W.c[1], w.l.y, e), lerp(W.c[2], w.l.z, e)); fov = lerp(46, 66, e);
        } else { cam.position.set(ox, oy, oz); lk.set(W.c[0], W.c[1], W.c[2]); }
        cam.lookAt(lk);
      }
      if (Math.abs(cam.fov - fov) > .05) { cam.fov = fov; cam.updateProjectionMatrix(); }
      R.render(S, cam);
    })(last);
    return v;
  }

  function controls(v, root) {
    const q = s => root.querySelector(s), rg = q("input[type=range]"), wb = q("[data-act=walk]");
    q("[data-act=replay]").onclick = () => { v.tp = v.p = 0; v.rk = 0; v.wt = 0; v.play = true; };
    wb.onclick = () => { v.walk = !v.walk; wb.setAttribute("aria-pressed", v.walk); };
    rg.oninput = () => { v.play = false; v.tp = +rg.value; };
    v.onp = p => rg.value = p;
    v.onload = () => { wb.hidden = !v.W.path; wb.setAttribute("aria-pressed", v.walk); };
  }

  /* renders each plan once to a JPEG from a first-person vantage, so cards get generated "photos" */
  function thumbs(plans) {
    const c = document.createElement("canvas"), R = renderer(c, true); R.setSize(720, 450, false);
    const S = stage(envFor(R)), cam = new THREE.PerspectiveCamera(60, 720 / 450, .08, 900);
    document.querySelectorAll("img[data-plan]").forEach(img => {
      const P = plans[img.dataset.plan]; if (!P) return;
      const W = B[P.mode](P); S.add(W.g); fitSun(S, W); W.upd(P.thumbP || 1, 2, 1);
      const sh = P.shot || W.shot; cam.fov = sh.fov || 62; cam.updateProjectionMatrix(); cam.position.set(...sh.p); cam.lookAt(...sh.t);
      R.render(S, cam); img.src = c.toDataURL("image/jpeg", .9); S.remove(W.g); dispose(W.g);
    });
    R.dispose();
  }
  window.DSH = { mount, controls, thumbs, reduce, _i: { B, M, renderer, envFor, stage, fitSun, pathAt, col, clamp, ease, lerp } };
})();
