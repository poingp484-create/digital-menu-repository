/* Melvet & Rockson · envelope, reveal, countdown and sparkles */
(function () {
  "use strict";

  // Holy Mass, Saturday 28 November 2026, 4:30 PM India time. Change here if the countdown should target another moment.
  var WEDDING = new Date("2026-11-28T16:30:00+05:30").getTime();
  var VENUE = "Infant Jesus Church, Dombivli";
  var MAP_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(VENUE);
  var CAL_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent("Melvet & Rockson's Wedding") +
    "&dates=20261128T110000Z/20261128T170000Z" +
    "&location=" + encodeURIComponent(VENUE) +
    "&details=" + encodeURIComponent("Holy Mass at 4:30 PM, " + VENUE + ". Join us in celebrating our love!");

  var body = document.body;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var stage = $("[data-stage]");
  var env = $("[data-env]");
  var flap = $("[data-flap]");
  var flapFront = $(".flap-face--front");
  var flapBack = $(".flap-face--back");
  var pocketCard = $("[data-pocket-card]");
  var margin = $("[data-margin]");
  var openBtn = $("[data-open]");
  var reveal = $("[data-reveal]");
  var invite = $("[data-invite]");
  var inviteImg = invite.querySelector("img");
  var replayBtn = $("[data-replay]");

  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return !!(reduceMotion && reduceMotion.matches); };
  var canAnimate = typeof Element.prototype.animate === "function";
  var state = "loading";

  $$("[data-map]").forEach(function (a) { a.href = MAP_URL; });
  $$("[data-calendar]").forEach(function (a) { a.href = CAL_URL; });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function finished(anim) { return anim && anim.finished ? anim.finished.catch(function () {}) : Promise.resolve(); }

  /* ---------- Load: show the cover once every layer is decoded, so nothing pops in mid-animation ---------- */

  var imgs = $$("img");
  var ready = Promise.all(imgs.map(function (img) {
    if (img.decode) return img.decode().catch(function () {});
    return img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = img.onerror = r; });
  }));
  Promise.race([ready, wait(5000)]).then(function () {
    requestAnimationFrame(function () {
      body.classList.remove("is-loading");
      state = "closed";
    });
  });

  /* ---------- Gentle tilt on desktop while the envelope waits ---------- */

  var tilt = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
  function tiltLoop() {
    tilt.x += (tilt.tx - tilt.x) * 0.08;
    tilt.y += (tilt.ty - tilt.y) * 0.08;
    stage.style.setProperty("--tilt-x", tilt.x.toFixed(3) + "deg");
    stage.style.setProperty("--tilt-y", tilt.y.toFixed(3) + "deg");
    if (Math.abs(tilt.tx - tilt.x) > 0.01 || Math.abs(tilt.ty - tilt.y) > 0.01) tilt.raf = requestAnimationFrame(tiltLoop);
    else tilt.raf = 0;
  }
  function setTilt(x, y) {
    tilt.tx = x; tilt.ty = y;
    if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltLoop);
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || state !== "closed" || reduced()) return;
    var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    setTilt(-ny * 5, nx * 6);
  });
  document.addEventListener("pointerleave", function () { setTilt(0, 0); });
  function clearTilt() {
    cancelAnimationFrame(tilt.raf); tilt.raf = 0;
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    stage.style.setProperty("--tilt-x", "0deg");
    stage.style.setProperty("--tilt-y", "0deg");
  }

  /* ---------- Opening ---------- */

  openBtn.addEventListener("click", open);

  function sealPoint() {
    var r = env.getBoundingClientRect();
    return { x: r.left + r.width * ((239.5 - 63) / 359), y: r.top + r.height * ((382 - 203) / 255) };
  }

  function open() {
    if (state !== "closed") return;
    state = "opening";
    clearTilt();

    if (reduced() || !canAnimate) return openQuietly();

    body.classList.add("is-opening");
    var seal = sealPoint();
    sparkles.burst(seal.x, seal.y, 18, 0.7);

    var flapTiming = { duration: 1300, delay: 220, easing: "cubic-bezier(.55,.06,.28,1)", fill: "forwards" };
    var flapAnim = flap.animate([
      { transform: "perspective(1100px) rotateX(0deg)" },
      { transform: "perspective(1100px) rotateX(180deg)" }
    ], flapTiming);
    // light falls off as the flap turns edge-on, then the paper inside catches it
    flapFront.animate([{ filter: "brightness(1)" }, { filter: "brightness(.8)", offset: 0.5 }, { filter: "brightness(.7)" }], flapTiming);
    flapBack.animate([{ filter: "brightness(.7)" }, { filter: "brightness(.84)", offset: 0.5 }, { filter: "brightness(1)" }], flapTiming);
    // the lace's shadow on the envelope lifts with it
    margin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 220, easing: "ease-out", fill: "forwards" });

    finished(flapAnim).then(function () {
      if (state !== "opening") return;
      body.classList.add("flap-open");
      var rise = pocketCard.animate([
        { transform: "translateY(0)" },
        { transform: "translateY(-35%)" }
      ], { duration: 1400, delay: 80, easing: "cubic-bezier(.33,.08,.2,1)", fill: "forwards" });
      return finished(rise);
    }).then(function () {
      if (state !== "opening") return;
      return wait(160).then(popOut);
    });
  }

  // The card leaves the envelope and settles in front, while the envelope sinks away
  function popOut() {
    if (state !== "opening") return;
    reveal.hidden = false;
    reveal.scrollTop = 0;

    var first = pocketCard.getBoundingClientRect();
    var last = invite.getBoundingClientRect();
    var envBox = env.getBoundingClientRect();
    var mouth = envBox.top + envBox.height * (2 / 255);
    var hidden = Math.max(0, Math.min(100, (first.bottom - mouth) / first.height * 100));
    var s = first.width / last.width;
    var dx = first.left - last.left;
    var dy = first.top - last.top;

    var fly = invite.animate([
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")" },
      { transform: "translate(" + dx * 0.55 + "px," + (dy * 0.55 - 30) + "px) scale(" + (s + (1 - s) * 0.62) + ")", offset: 0.45 },
      { transform: "none" }
    ], { duration: 1500, easing: "cubic-bezier(.3,.7,.2,1)" });
    inviteImg.animate([
      { clipPath: "inset(0 0 " + hidden + "% 0)" },
      { clipPath: "inset(0 0 0% 0)" }
    ], { duration: 780, easing: "cubic-bezier(.45,0,.2,1)" });
    stage.animate([
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(8%) scale(.9)" }
    ], { duration: 1150, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });

    sparkles.burst(first.left + first.width / 2, mouth, 46, 1);
    setTimeout(function () { body.classList.add("is-revealed"); }, 650);

    finished(fly).then(function () {
      if (state !== "opening") return;
      var r = invite.getBoundingClientRect();
      sparkles.burst(r.left + r.width / 2, r.top + r.height * 0.42, 26, 0.55, r.width * 0.45);
      state = "open";
      body.classList.remove("is-opening");
      tickCountdown(true);
    });
  }

  function openQuietly() {
    reveal.hidden = false;
    reveal.scrollTop = 0;
    if (canAnimate) stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" });
    else stage.style.opacity = "0";
    body.classList.add("is-revealed");
    state = "open";
    tickCountdown(true);
  }

  /* ---------- Replay ---------- */

  replayBtn.addEventListener("click", function () {
    if (state !== "open") return;
    state = "closing";
    var out = canAnimate ? reveal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-in", fill: "forwards" }) : null;
    finished(out).then(function () {
      body.classList.add("is-loading");
      body.classList.remove("is-revealed", "is-opening", "flap-open");
      [flap, flapFront, flapBack, margin, pocketCard, stage, invite, inviteImg, reveal].forEach(function (el) {
        if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); });
      });
      stage.style.opacity = "";
      reveal.hidden = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          body.classList.remove("is-loading");
          state = "closed";
          openBtn.focus({ preventScroll: true });
        });
      });
    });
  });

  /* ---------- Countdown ---------- */

  var units = {
    days: $('[data-unit="days"]'),
    hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'),
    seconds: $('[data-unit="seconds"]')
  };
  var title = $("[data-count-title]");

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function setUnit(el, value, animate) {
    if (el.textContent === value) return;
    el.textContent = value;
    if (animate && !reduced()) {
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }

  function tickCountdown(animate) {
    var diff = WEDDING - Date.now();
    var live = animate !== false && state === "open";
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(function (k) { setUnit(units[k], "00", false); });
      title.textContent = diff > -86400000 ? "Today we say I do" : "Happily ever after";
      return;
    }
    var s = Math.floor(diff / 1000);
    setUnit(units.days, pad(Math.floor(s / 86400)), live);
    setUnit(units.hours, pad(Math.floor(s / 3600) % 24), live);
    setUnit(units.minutes, pad(Math.floor(s / 60) % 60), live);
    setUnit(units.seconds, pad(s % 60), live);
  }
  function scheduleTick() {
    tickCountdown();
    setTimeout(scheduleTick, 1000 - (Date.now() % 1000) + 5);
  }
  tickCountdown(false);
  scheduleTick();

  /* ---------- Sparkles: floating motes plus bursts when the envelope opens ---------- */

  var sparkles = (function () {
    var canvas = $("[data-sparkle]");
    var ctx = canvas.getContext && canvas.getContext("2d");
    var noop = { burst: function () {} };
    if (!ctx) return noop;

    var dpr = 1, W = 0, H = 0, motes = [], bits = [], raf = 0, last = 0;

    function sprite(size, draw) {
      var c = document.createElement("canvas");
      c.width = c.height = size;
      draw(c.getContext("2d"), size);
      return c;
    }
    var dot = sprite(64, function (g, n) {
      var gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.35, "rgba(240,247,251,.55)");
      gr.addColorStop(1, "rgba(240,247,251,0)");
      g.fillStyle = gr; g.fillRect(0, 0, n, n);
    });
    var star = sprite(64, function (g, n) {
      var c = n / 2;
      var gr = g.createRadialGradient(c, c, 0, c, c, c * 0.5);
      gr.addColorStop(0, "rgba(255,255,255,.9)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, n, n);
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(c, 2); g.quadraticCurveTo(c, c, n - 2, c); g.quadraticCurveTo(c, c, c, n - 2);
      g.quadraticCurveTo(c, c, 2, c); g.quadraticCurveTo(c, c, c, 2);
      g.fill();
    });

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = Math.round(Math.min(34, (W * H) / 26000));
      while (motes.length < want) motes.push(mote(true));
      motes.length = want;
    }
    function mote(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 20,
        r: 2 + Math.random() * 5,
        vy: -(4 + Math.random() * 10),
        sway: 6 + Math.random() * 14,
        ph: Math.random() * Math.PI * 2,
        a: 0.18 + Math.random() * 0.32
      };
    }

    function burst(x, y, count, power, spread) {
      if (reduced()) return;
      for (var i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var sp = (60 + Math.random() * 220) * power;
        var ox = spread ? (Math.random() - 0.5) * spread * 2 : 0;
        var oy = spread ? (Math.random() - 0.5) * spread * 2.4 : 0;
        bits.push({
          x: x + ox, y: y + oy,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 60 * power,
          life: 0, max: 0.9 + Math.random() * 1.1,
          s: 6 + Math.random() * 12,
          rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 3,
          star: Math.random() < 0.55
        });
      }
      start();
    }

    function frame(t) {
      var dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      ctx.clearRect(0, 0, W, H);

      if (!reduced()) {
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          m.y += m.vy * dt;
          m.ph += dt * 0.6;
          if (m.y < -20) motes[i] = m = mote(false);
          var tw = 0.65 + 0.35 * Math.sin(m.ph * 2.3);
          ctx.globalAlpha = m.a * tw;
          ctx.drawImage(dot, m.x + Math.sin(m.ph) * m.sway - m.r, m.y - m.r, m.r * 2, m.r * 2);
        }
      }

      for (var j = bits.length - 1; j >= 0; j--) {
        var b = bits[j];
        b.life += dt;
        if (b.life >= b.max) { bits.splice(j, 1); continue; }
        b.vx *= 1 - 1.8 * dt; b.vy = b.vy * (1 - 1.8 * dt) + 40 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        var k = b.life / b.max;
        var alpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        var size = b.s * (b.star ? 0.6 + 0.4 * Math.sin(k * Math.PI) : 0.5);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.drawImage(b.star ? star : dot, -size, -size, size * 2, size * 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (document.hidden || (reduced() && !bits.length)) { raf = 0; last = 0; ctx.clearRect(0, 0, W, H); return; }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    if (reduceMotion && reduceMotion.addEventListener) reduceMotion.addEventListener("change", start);
    start();
    return { burst: burst };
  })();
})();
