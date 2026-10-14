/* Melvet & Rockson · hand-built envelope, card, countdown and sparkles */
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

  var SVGNS = "http://www.w3.org/2000/svg";
  var body = document.body;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var stage = $("[data-stage]");
  var env = $("[data-env]");
  var flap = $("[data-flap]");
  var flapFront = $(".flap-face--front");
  var flapBack = $(".flap-face--back");
  var pocketCard = $("[data-pocket-card]");
  var openBtn = $("[data-open]");
  var reveal = $("[data-reveal]");
  var invite = $("[data-invite]");
  var card = $("[data-card]");
  var replayBtn = $("[data-replay]");

  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return !!(reduceMotion && reduceMotion.matches); };
  var canAnimate = typeof Element.prototype.animate === "function";
  var state = "loading";

  $$("[data-map]").forEach(function (a) { a.href = MAP_URL; });
  $$("[data-calendar]").forEach(function (a) { a.href = CAL_URL; });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function finished(anim) { return anim && anim.finished ? anim.finished.catch(function () {}) : Promise.resolve(); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* =====================================================================
     Artwork, drawn in code so it stays sharp at any size
     ===================================================================== */

  // Paper grain: a small tile of soft speckle
  (function grain() {
    var c = document.createElement("canvas");
    var n = 220;
    c.width = c.height = n;
    var g = c.getContext("2d");
    if (!g) return;
    var img = g.createImageData(n, n), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.random();
      var dark = v < 0.5;
      d[i] = d[i + 1] = d[i + 2] = dark ? 70 : 255;
      d[i + 2] = dark ? 50 : 255;
      d[i + 3] = Math.round(Math.pow(Math.abs(v - 0.5) * 2, 3) * (dark ? 34 : 40));
    }
    g.putImageData(img, 0, 0);
    var url = c.toDataURL("image/png");
    $$("[data-grain]").forEach(function (im) { im.setAttribute("href", url); });
  })();

  // Damask for the envelope lining, taken from the same tile the CSS uses
  (function damask() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue("--damask").trim();
    var m = /^url\(\s*["']?([\s\S]*?)["']?\s*\)$/.exec(raw);
    if (m) $$("[data-damask]").forEach(function (im) { im.setAttribute("href", m[1]); });
  })();

  // Draped ivory silk: a height field of soft folds, lit from the upper left
  function paintSatin(canvas) {
    var W = 450, H = 800;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var img = ctx.createImageData(W, H), d = img.data;
    var hgt = new Float32Array(W * H);
    // folds fall in long diagonals, swaying as they go down
    var folds = [
      { a: 1.0, f: 9, ang: 0.42, ph: 0.3, w: 1.0 },
      { a: 0.6, f: 13, ang: 0.62, ph: 1.7, w: 0.8 },
      { a: 0.38, f: 19, ang: 0.3, ph: 2.9, w: 1.2 },
      { a: 0.22, f: 28, ang: 0.55, ph: 0.8, w: 0.9 },
      { a: 0.3, f: 4, ang: 1.3, ph: 2.2, w: 0.3 }
    ];
    folds.forEach(function (f) { f.c = Math.cos(f.ang); f.s = Math.sin(f.ang); });
    var x, y, i, X, Y, h, warp, k;
    for (y = 0; y < H; y++) {
      Y = y / W;
      for (x = 0; x < W; x++) {
        X = x / W;
        warp = 0.9 * Math.sin(Y * 2.2 + 0.6) + 0.35 * Math.sin(X * 3.3 + Y * 1.4 + 2.1);
        h = 0;
        for (k = 0; k < folds.length; k++) {
          var f = folds[k];
          h += f.a * Math.sin(f.f * (X * f.c + Y * f.s) + f.ph + warp * f.w);
        }
        hgt[y * W + x] = h;
      }
    }
    var L = [-0.42, -0.58, 0.7], ll = Math.hypot(L[0], L[1], L[2]);
    L = [L[0] / ll, L[1] / ll, L[2] / ll];
    var Hv = [L[0], L[1], L[2] + 1], hl = Math.hypot(Hv[0], Hv[1], Hv[2]);
    Hv = [Hv[0] / hl, Hv[1] / hl, Hv[2] / hl];
    var K = 9;
    var lite = [252, 251, 248], shade = [204, 210, 219];
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var hx = (hgt[i + (x < W - 1 ? 1 : 0)] - hgt[i - (x > 0 ? 1 : 0)]) * 0.5 * K;
        var hy = (hgt[i + (y < H - 1 ? W : 0)] - hgt[i - (y > 0 ? W : 0)]) * 0.5 * K;
        var nl = Math.hypot(hx, hy, 1);
        var nx = -hx / nl, ny = -hy / nl, nz = 1 / nl;
        var diff = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        var spec = Math.pow(Math.max(0, nx * Hv[0] + ny * Hv[1] + nz * Hv[2]), 26);
        var t = Math.min(1, Math.pow(diff * 1.18, 1.3)) * (0.94 + 0.03 * hgt[i]);
        var n = (Math.random() - 0.5) * 4;
        for (var c = 0; c < 3; c++) {
          var v = shade[c] + (lite[c] - shade[c]) * t;
          v += spec * 0.6 * (255 - v);
          d[i * 4 + c] = v + n;
        }
        d[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // Lace trim along an edge: a solid band, scallops on the outer side, and pierced eyelets (even-odd holes)
  function laceEdge(p0, p1, side, o) {
    o = Object.assign({ step: 24, r: 11, band: 42, start: 0, end: 0 }, o);
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy);
    var ux = dx / len, uy = dy / len, nx = -uy * side, ny = ux * side;
    var P = function (t, dd) { return f1(p0[0] + ux * t + nx * dd) + " " + f1(p0[1] + uy * t + ny * dd); };
    var Pt = function (t, dd) { return [p0[0] + ux * t + nx * dd, p0[1] + uy * t + ny * dd]; };
    var count = Math.floor((len - o.start - o.end) / o.step);
    var t0 = o.start, tE = t0 + count * o.step, s = o.step, r = o.r, i;
    var dPath = "M" + P(t0, -o.band) + " L" + P(tE, -o.band) + " L" + P(tE, 0);
    for (i = count - 1; i >= 0; i--) {
      var a = t0 + i * s;
      dPath += " C" + P(a + s * 0.94, r * 1.36) + " " + P(a + s * 0.06, r * 1.36) + " " + P(a, 0);
    }
    dPath += " Z";
    var ang = Math.atan2(uy, ux) * 180 / Math.PI;
    var circ = function (q, rr) { return " M" + f1(q[0] - rr) + " " + f1(q[1]) + " a" + rr + " " + rr + " 0 1 0 " + f1(2 * rr) + " 0 a" + rr + " " + rr + " 0 1 0 " + f1(-2 * rr) + " 0"; };
    var slot = function (q, rx, ry) {
      var sx = q[0] - ux * rx, sy = q[1] - uy * rx;
      return " M" + f1(sx) + " " + f1(sy) + " a" + rx + " " + ry + " " + f1(ang) + " 1 0 " + f1(2 * rx * ux) + " " + f1(2 * rx * uy) +
        " a" + rx + " " + ry + " " + f1(ang) + " 1 0 " + f1(-2 * rx * ux) + " " + f1(-2 * rx * uy);
    };
    var holes = "";
    for (i = 0; i < count; i++) {
      var m = t0 + i * s + s / 2;
      holes += circ(Pt(m, r * 0.5), r * 0.24);
      holes += circ(Pt(m - s * 0.3, r * 0.98), r * 0.09) + circ(Pt(m, r * 1.12), r * 0.09) + circ(Pt(m + s * 0.3, r * 0.98), r * 0.09);
      holes += slot(Pt(m - s / 4, -o.band * 0.2), s * 0.15, r * 0.13) + slot(Pt(m + s / 4, -o.band * 0.2), s * 0.15, r * 0.13);
      holes += circ(Pt(m, -o.band * 0.46), r * 0.16);
      holes += slot(Pt(m - s / 4, -o.band * 0.72), s * 0.15, r * 0.13) + slot(Pt(m + s / 4, -o.band * 0.72), s * 0.15, r * 0.13);
    }
    var cords = "M" + P(t0, -o.band * 0.06) + " L" + P(tE, -o.band * 0.06) +
      " M" + P(t0, -o.band * 0.6) + " L" + P(tE, -o.band * 0.6) +
      " M" + P(t0, -o.band * 0.93) + " L" + P(tE, -o.band * 0.93);
    return { lace: dPath + holes, cords: cords };
  }

  function drawLace(group, parts) {
    parts.forEach(function (p) {
      el("path", { d: p.lace, fill: "#fdfcf8", "fill-rule": "evenodd", stroke: "#d8d2c2", "stroke-width": "0.8" }, group);
      el("path", { d: p.cords, fill: "none", stroke: "#e3ddcd", "stroke-width": "0.9" }, group);
    });
  }

  // Envelope flap: lace down both slanted edges, to just under the seal
  (function flapLace() {
    var parts = [
      laceEdge([0, 0], [500, 522], 1, { end: 70 }),
      laceEdge([1000, 0], [500, 522], -1, { end: 70 })
    ];
    $$("[data-lace]").forEach(function (g) { drawLace(g, parts); });
  })();

  // Lace trims down both edges of the damask band
  (function bandLace() {
    var g = $("[data-band-lace]");
    var grp = el("g", { filter: "url(#f-lace)" }, g);
    drawLace(grp, [
      laceEdge([60, -20], [60, 1800], 1, { step: 30, r: 13, band: 38 }),
      laceEdge([440, -20], [440, 1800], -1, { step: 30, r: 13, band: 38 })
    ]);
  })();

  // Lace rosettes scattered on the silk
  (function rosettes() {
    var g = $("[data-rosettes]");
    var grp = el("g", { filter: "url(#f-lace)", opacity: "0.82" }, g);
    function rosette(cx, cy, R, rot) {
      var N = 18, dd = "", i, a, b;
      var pt = function (ang, rad) { return f1(cx + Math.cos(ang) * rad) + " " + f1(cy + Math.sin(ang) * rad); };
      for (i = 0; i < N; i++) {
        a = rot + i / N * Math.PI * 2; b = rot + (i + 1) / N * Math.PI * 2;
        if (i === 0) dd += "M" + pt(a, R * 0.86);
        dd += " C" + pt(a + (b - a) * 0.2, R * 1.1) + " " + pt(a + (b - a) * 0.8, R * 1.1) + " " + pt(b, R * 0.86);
      }
      dd += " Z";
      var circ = function (x, y, rr) { return " M" + f1(x - rr) + " " + f1(y) + " a" + f1(rr) + " " + f1(rr) + " 0 1 0 " + f1(2 * rr) + " 0 a" + f1(rr) + " " + f1(rr) + " 0 1 0 " + f1(-2 * rr) + " 0"; };
      for (i = 0; i < N; i++) {
        a = rot + (i + 0.5) / N * Math.PI * 2;
        dd += circ(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86, R * 0.045);
      }
      for (i = 0; i < 8; i++) {
        a = rot + i / 8 * Math.PI * 2;
        var px = cx + Math.cos(a) * R * 0.5, py = cy + Math.sin(a) * R * 0.5;
        var rx = R * 0.15, ry = R * 0.06, deg = a * 180 / Math.PI;
        dd += " M" + f1(px - Math.cos(a) * rx) + " " + f1(py - Math.sin(a) * rx) +
          " a" + f1(rx) + " " + f1(ry) + " " + f1(deg) + " 1 0 " + f1(2 * rx * Math.cos(a)) + " " + f1(2 * rx * Math.sin(a)) +
          " a" + f1(rx) + " " + f1(ry) + " " + f1(deg) + " 1 0 " + f1(-2 * rx * Math.cos(a)) + " " + f1(-2 * rx * Math.sin(a));
        var a2 = a + Math.PI / 8;
        dd += circ(cx + Math.cos(a2) * R * 0.66, cy + Math.sin(a2) * R * 0.66, R * 0.035);
      }
      dd += circ(cx, cy, R * 0.09);
      for (i = 0; i < 6; i++) { a = rot + i / 6 * Math.PI * 2; dd += circ(cx + Math.cos(a) * R * 0.2, cy + Math.sin(a) * R * 0.2, R * 0.03); }
      el("path", { d: dd, fill: "#fdfcf8", "fill-rule": "evenodd", stroke: "#d8d2c2", "stroke-width": "0.9" }, grp);
      el("circle", { cx: cx, cy: cy, r: f1(R * 0.75), fill: "none", stroke: "#e3ddcd", "stroke-width": "1" }, grp);
      el("circle", { cx: cx, cy: cy, r: f1(R * 0.3), fill: "none", stroke: "#e3ddcd", "stroke-width": "1" }, grp);
    }
    rosette(985, 190, 92, 0.2);
    rosette(1012, 1010, 64, 0.5);
    rosette(930, 1735, 105, 0.1);
  })();

  // Navy wax seal with a silver RM monogram, fixed to the tip of the flap
  (function seal() {
    var g = $("[data-seal]");
    var cx = 500, cy = 505, R = 100, i;
    var pts = [], N = 90;
    for (i = 0; i < N; i++) {
      var a = i / N * Math.PI * 2;
      var r = R * (1 + 0.03 * Math.sin(5 * a + 0.4) + 0.022 * Math.sin(8 * a + 1.3) + 0.014 * Math.sin(13 * a + 2.2));
      [0.6, 1.9, 3.1, 4.4, 5.5].forEach(function (b) { var q = Math.atan2(Math.sin(a - b), Math.cos(a - b)); r += R * 0.05 * Math.exp(-q * q * 40); });
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    var dd = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
    for (i = 0; i < N; i++) {
      var p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      dd += " C" + f1(p1[0] + (p2[0] - p0[0]) / 6) + " " + f1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        f1(p2[0] - (p3[0] - p1[0]) / 6) + " " + f1(p2[1] - (p3[1] - p1[1]) / 6) + " " + f1(p2[0]) + " " + f1(p2[1]);
    }
    dd += " Z";
    el("ellipse", { cx: cx + 7, cy: cy + 12, rx: R * 1.02, ry: R * 0.97, fill: "#1a1608", opacity: ".42", filter: "url(#f-blur)" }, g);
    el("path", { d: dd, fill: "url(#g-seal)" }, g);
    el("path", { d: dd, fill: "none", stroke: "url(#g-seal-rim)", "stroke-width": "4" }, g);
    el("circle", { cx: cx, cy: cy, r: R * 0.7, fill: "url(#g-seal-in)" }, g);
    el("circle", { cx: cx, cy: cy, r: R * 0.7, fill: "none", stroke: "url(#g-seal-lip)", "stroke-width": "5" }, g);
    el("circle", { cx: cx, cy: cy, r: R * 0.6, fill: "none", stroke: "url(#g-silver)", "stroke-width": "2.6", "stroke-dasharray": "0.1 7.2", "stroke-linecap": "round", opacity: ".85" }, g);
    function mono(dx, dy, fill, op) {
      var t = el("text", { x: cx + dx, y: cy + dy, "text-anchor": "middle", fill: fill, opacity: op, style: "font: 400 " + R * 0.78 + "px var(--script)" }, g);
      var r1 = el("tspan", { x: cx - R * 0.17 + dx, y: cy - R * 0.02 + dy }, t); r1.textContent = "R";
      var r2 = el("tspan", { x: cx + R * 0.2 + dx, y: cy + R * 0.36 + dy }, t); r2.textContent = "M";
    }
    mono(1.6, 2.2, "#020a1c", ".85");
    mono(-0.8, -1, "#ffffff", ".35");
    mono(0, 0, "url(#g-silver)", "1");
    el("ellipse", { cx: cx - R * 0.42, cy: cy - R * 0.5, rx: R * 0.32, ry: R * 0.12, transform: "rotate(-38 " + f1(cx - R * 0.42) + " " + f1(cy - R * 0.5) + ")", fill: "#fff", opacity: ".3", filter: "url(#f-blur-s)" }, g);
  })();

  // The card waiting inside the envelope is a copy of the real one
  (function pocketCopy() {
    var copy = card.cloneNode(true);
    copy.removeAttribute("data-card");
    copy.setAttribute("aria-hidden", "true");
    $$("a, button", copy).forEach(function (a) { a.setAttribute("tabindex", "-1"); a.removeAttribute("href"); });
    pocketCard.appendChild(copy);
  })();

  /* ---------- Load: show the cover once the silk is painted and fonts are in ---------- */

  paintSatin($("[data-satin]"));
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, wait(3000)]).then(function () {
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
    return { x: r.left + r.width * 0.5, y: r.top + r.height * (505 / 704) };
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
    // light falls off as the flap turns edge-on, then the lining catches it
    flapFront.animate([{ filter: "brightness(1)" }, { filter: "brightness(.82)", offset: 0.5 }, { filter: "brightness(.72)" }], flapTiming);
    flapBack.animate([{ filter: "brightness(.72)" }, { filter: "brightness(.86)", offset: 0.5 }, { filter: "brightness(1)" }], flapTiming);

    finished(flapAnim).then(function () {
      if (state !== "opening") return;
      body.classList.add("flap-open");
      var rise = pocketCard.animate([
        { transform: "translateY(0)" },
        { transform: "translateY(-36%)" }
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
    var mouth = env.getBoundingClientRect().top;
    var hidden = Math.max(0, Math.min(100, (first.bottom - mouth) / first.height * 100));
    var s = first.width / last.width;
    var dx = first.left - last.left;
    var dy = first.top - last.top;

    var fly = invite.animate([
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")" },
      { transform: "translate(" + dx * 0.55 + "px," + (dy * 0.55 - 30) + "px) scale(" + (s + (1 - s) * 0.62) + ")", offset: 0.45 },
      { transform: "none" }
    ], { duration: 1500, easing: "cubic-bezier(.3,.7,.2,1)" });
    card.animate([
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
      [flap, flapFront, flapBack, pocketCard, stage, invite, card, reveal].forEach(function (e) {
        if (e.getAnimations) e.getAnimations().forEach(function (a) { a.cancel(); });
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

  function setUnit(e, value, animate) {
    if (e.textContent === value) return;
    e.textContent = value;
    if (animate && !reduced()) {
      e.classList.remove("tick");
      void e.offsetWidth;
      e.classList.add("tick");
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
    if (!ctx) return { burst: function () {} };

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
