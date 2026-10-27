/* Frosted-glass dropdown that wraps the native <select> inside .pick (select stays as the source of truth). */
(() => {
  "use strict";
  document.querySelectorAll(".pick select").forEach(sel => {
    const wrap = sel.closest(".selwrap") || sel.parentElement;
    wrap.classList.add("dd-on"); sel.classList.add("dd-native"); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");

    const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; };
    const dd = el("div", "dd"), btn = el("button", "dd-btn"), panel = el("div", "dd-panel");
    btn.type = "button"; btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
    panel.setAttribute("role", "listbox"); panel.tabIndex = -1;
    const label = el("span", "dd-label"); btn.append(label, el("i", "dd-chev"));

    const opts = [];
    const add = (o, parent) => {
      const b = el("div", "dd-opt", o.textContent); b.setAttribute("role", "option"); b.dataset.v = o.value; opts.push(b); parent.append(b);
    };
    [...sel.children].forEach(ch => {
      if (ch.tagName === "OPTGROUP") {
        const g = el("div", "dd-group"); g.setAttribute("role", "group");
        g.append(el("div", "dd-head", ch.label)); [...ch.children].forEach(o => add(o, g)); panel.append(g);
      } else add(ch, panel);
    });
    dd.append(btn, panel); wrap.append(dd);

    let cur = -1;
    const sync = () => {
      opts.forEach((b, i) => { const on = b.dataset.v === sel.value; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); if (on) label.textContent = b.textContent; });
    };
    const hi = i => {
      cur = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach((b, j) => b.classList.toggle("hi", j === cur));
      opts[cur].scrollIntoView({ block: "nearest" });
    };
    const open = () => {
      const r = btn.getBoundingClientRect(), below = innerHeight - r.bottom, above = r.top;
      dd.classList.toggle("up", below < 300 && above > below);
      const bar = document.querySelector(".bar"), top = (bar ? bar.getBoundingClientRect().bottom : 0) + 16;
      const room = dd.classList.contains("up") ? r.top - top : below - 24;   /* never run under the header */
      panel.style.maxHeight = Math.max(160, Math.min(420, room)) + "px";
      dd.classList.add("open"); btn.setAttribute("aria-expanded", "true");
      hi(opts.findIndex(b => b.classList.contains("on")));
    };
    const close = () => { dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
    const pick = i => {
      const v = opts[i].dataset.v;
      if (sel.value !== v) { sel.value = v; sel.dispatchEvent(new Event("change", { bubbles: true })); }
      sync(); close(); btn.focus();
    };

    btn.onclick = () => dd.classList.contains("open") ? close() : open();
    opts.forEach((b, i) => { b.onmouseenter = () => hi(i); b.onclick = () => pick(i); });
    dd.addEventListener("keydown", e => {
      const isOpen = dd.classList.contains("open");
      if (e.key === "Escape") { close(); btn.focus(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!isOpen) open(); else hi(cur + (e.key === "ArrowDown" ? 1 : -1)); }
      else if ((e.key === "Enter" || e.key === " ") && isOpen) { e.preventDefault(); pick(cur); }
      else if (e.key === "Home" && isOpen) { e.preventDefault(); hi(0); }
      else if (e.key === "End" && isOpen) { e.preventDefault(); hi(opts.length - 1); }
    });
    document.addEventListener("pointerdown", e => { if (!dd.contains(e.target)) close(); });
    sync();
  });
})();