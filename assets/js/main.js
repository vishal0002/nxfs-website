/* NXFS: scroll experience. No dependencies, no network requests. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- crash-point map (385 points, 0..384, 9 chunks) ---------- */
  var cmap = document.querySelector(".cmap");
  if (cmap) {
    var chunks = cmap.getAttribute("data-chunks").split(",");
    var frag = document.createDocumentFragment();
    chunks.forEach(function (c, idx) {
      var r = c.split(":"), a = +r[0], b = +r[1];
      for (var i = a; i < b; i++) {
        var cell = document.createElement("i");
        cell.className = idx === chunks.length - 1 ? "gap" : (idx % 2 ? "alt" : "");
        frag.appendChild(cell);
      }
    });
    cmap.appendChild(frag);
  }

  /* ---------- count-up (restores the exact original text when done) ---------- */
  function countUp(el) {
    if (el.__done || el.children.length) return;   // skip numbers with units/markup
    el.__done = true;
    var target = +el.getAttribute("data-count");
    var final = el.textContent;
    if (reduce || !target) return;
    var t0 = null, dur = Math.min(1600, 500 + target / 200);
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    }
    requestAnimationFrame(step);
  }

  /* ---------- light the crash map progressively ---------- */
  function lightMap(map) {
    var cells = map.querySelectorAll("i");
    if (reduce) { for (var k = 0; k < cells.length; k++) cells[k].classList.add("on"); return; }
    var i = 0, per = Math.ceil(cells.length / 60);
    (function tick() {
      for (var n = 0; n < per && i < cells.length; n++, i++) cells[i].classList.add("on");
      if (i < cells.length) requestAnimationFrame(tick);
    })();
  }

  /* ---------- typed terminal lines ---------- */
  function typeLines(pre) {
    var lines = pre.children;
    for (var i = 0; i < lines.length; i++) {
      lines[i].style.transitionDelay = reduce ? "0s" : (i * 0.11) + "s";
    }
    pre.classList.add("is-in");
  }

  function activate(el) {
    el.classList.add("is-in");
    if (el.classList.contains("cmap")) lightMap(el);
    var counts = el.matches("[data-count]") ? [el] : el.querySelectorAll("[data-count]");
    Array.prototype.forEach.call(counts, countUp);
    var typed = el.matches(".typed") ? [el] : el.querySelectorAll(".typed");
    Array.prototype.forEach.call(typed, typeLines);
  }

  var watch = document.querySelectorAll(".reveal, .typed, .cmap, .rounds, .pj, .perf, .mega[data-count]");
  if (!hasIO) {
    Array.prototype.forEach.call(watch, activate);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(watch, function (n) { io.observe(n); });
  }

  /* ---------- run clock HUD: follows the log timeline as you scroll ---------- */
  var hudTs = document.querySelector("[data-hud-ts]");
  var hudLog = document.querySelector("[data-hud-log]");
  var stages = document.querySelectorAll("[data-ts]");
  if (hasIO && hudTs && hudLog && stages.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        hudTs.textContent = en.target.getAttribute("data-ts");
        hudLog.textContent = en.target.getAttribute("data-log");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Array.prototype.forEach.call(stages, function (s) { sio.observe(s); });
  }

  /* ---------- scroll progress bar ---------- */
  var bar = document.querySelector(".progress");
  if (bar) {
    var ticking = false;
    var update = function () {
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
