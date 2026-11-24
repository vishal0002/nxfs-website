/* NXFS countdown. Target: 1 January 2027, 00:00:00 Asia/Kolkata (UTC+05:30).
   Computed in UTC so it is correct in every visitor time zone. */
(function () {
  "use strict";

  var TARGET = Date.UTC(2026, 11, 31, 18, 30, 0); // = 2027-01-01T00:00:00+05:30

  var root = document.querySelector("[data-countdown]");
  if (!root) return;

  var el = {
    d: root.querySelector("[data-unit='d']"),
    h: root.querySelector("[data-unit='h']"),
    m: root.querySelector("[data-unit='m']"),
    s: root.querySelector("[data-unit='s']")
  };
  var summary = document.querySelector("[data-countdown-summary]");
  var lastSummaryMinute = -1;
  var timer = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function render() {
    var diff = TARGET - Date.now();

    if (diff <= 0) {
      el.d.textContent = "00"; el.h.textContent = "00";
      el.m.textContent = "00"; el.s.textContent = "00";
      root.setAttribute("data-state", "arrived");
      if (summary) summary.textContent = "The countdown has reached 1 January 2027, 00:00 IST.";
      if (timer) clearInterval(timer);
      return;
    }

    var total = Math.floor(diff / 1000);
    var d = Math.floor(total / 86400);
    var h = Math.floor((total % 86400) / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;

    el.d.textContent = d < 100 ? pad(d) : String(d);
    el.h.textContent = pad(h);
    el.m.textContent = pad(m);
    el.s.textContent = pad(s);

    // Screen-reader summary at most once per minute (avoids per-second noise).
    var minuteKey = Math.floor(total / 60);
    if (summary && minuteKey !== lastSummaryMinute) {
      lastSummaryMinute = minuteKey;
      summary.textContent = d + " days, " + h + " hours and " + m +
        " minutes remaining until 1 January 2027, 00:00 IST.";
    }
  }

  render();
  timer = setInterval(render, 1000);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
})();
