/* Real-footage slots. Any element with data-video="name" is replaced by
   /static/hub/video/name.mp4 if that file exists. If it doesn't, the 3D version stays. */
(() => {
  "use strict";
  const base = document.body.dataset.video || "/static/hub/video/";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mkVideo = (src, poster) => {
    const v = document.createElement("video");
    v.className = "rv"; v.src = src; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.preload = "metadata";
    if (poster) v.poster = poster;
    v.setAttribute("aria-hidden", "true");
    return v;
  };

  const attach = (el, src) => {
    const v = mkVideo(src, el.dataset.poster);
    const host = el.tagName === "IMG" ? el.parentElement : el.parentElement;
    el.after(v);
    v.addEventListener("loadeddata", () => {
      el.style.visibility = "hidden";                     /* hide 3D / generated image */
      if (el.tagName === "IMG") el.style.display = "none";
      const root = el.closest(".viewer, .reel, #stage, .clip, .cards li");
      if (root) root.classList.add("hasvideo");
      /* play only while on screen, saves battery and bandwidth */
      if (reduce) { v.pause(); return; }
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: .15 }).observe(v);
      /* journey clips: "Save clip" downloads the real file instead of recording the canvas */
      const clip = el.closest(".clip"), btn = clip && clip.querySelector("[data-rec]");
      if (btn) {
        const a = document.createElement("a");
        a.className = btn.className; a.textContent = "Save clip"; a.href = src; a.download = src.split("/").pop();
        btn.replaceWith(a);
      }
    }, { once: true });
    v.addEventListener("error", () => v.remove(), { once: true });
  };

  document.querySelectorAll("[data-video]").forEach(el => {
    const src = base + el.dataset.video + ".mp4";
    fetch(src, { method: "HEAD" }).then(r => { if (r.ok) attach(el, src); }).catch(() => {});
  });
})();
