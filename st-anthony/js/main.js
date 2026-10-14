/* St. Anthony's Bakery: interactions and motion. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var calm = root.classList.contains("calm");
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Split headings into words ---------- */
  function splitWords(el) {
    var index = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.className = "w";
            var wi = document.createElement("span");
            wi.className = "wi";
            wi.style.setProperty("--d", (index++ * 0.07).toFixed(2));
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    }
    walk(el);
  }
  $$("[data-split]").forEach(function (el) {
    splitWords(el);
  });
  // Hero title words start a beat after the eyebrow
  $$(".hero-title .wi").forEach(function (wi, i) { wi.style.setProperty("--d", (0.25 + i * 0.08).toFixed(2)); });

  /* ---------- Stagger siblings that reveal together ---------- */
  var groups = new Map();
  $$("[data-reveal]").forEach(function (el) {
    var p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach(function (list) {
    list.forEach(function (el, i) { el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s"); });
  });

  /* ---------- Counters ---------- */
  function formatNum(v, el) {
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (el.hasAttribute("data-plain")) return String(Math.round(v));
    return v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    if (calm) { el.textContent = formatNum(to, el); return; }
    var dur = 1800, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = formatNum(from + (to - from) * e, el);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(to, el);
    }
    requestAnimationFrame(step);
  }
  // Start counters from their "from" value so the climb is visible
  if (!calm) $$("[data-count]").forEach(function (el) { el.textContent = formatNum(parseFloat(el.getAttribute("data-from") || "0"), el); });

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = $$("[data-reveal], [data-split]:not(.hero-title), [data-count], .score, .foot-big");
  if ("IntersectionObserver" in window && !calm) {
    // A fully clipped element never reports as intersecting, so clip reveals
    // are watched through their parent instead.
    var proxies = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var list = proxies.get(en.target) || [en.target];
        list.forEach(function (el) {
          el.classList.add("is-in");
          if (el.hasAttribute("data-count")) runCounter(el);
        });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) {
      if (el.getAttribute("data-reveal") === "clip") {
        var proxy = el.parentElement;
        if (!proxies.has(proxy)) proxies.set(proxy, []);
        proxies.get(proxy).push(el);
        io.observe(proxy);
      } else {
        io.observe(el);
      }
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); if (el.hasAttribute("data-count")) runCounter(el); });
  }

  /* ---------- Loader, then hero entrance ---------- */
  var loader = $(".loader");
  function startHero() { root.classList.add("hero-go"); }
  if (calm || !loader) {
    if (loader) loader.remove();
    startHero();
  } else {
    root.classList.add("is-loading");
    if (!location.hash) window.scrollTo(0, 0);
    var yearEl = $(".loader-year", loader);
    var y0 = null;
    (function countYear(t) {
      if (y0 === null) y0 = t;
      var p = clamp((t - y0 - 500) / 1300, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      yearEl.textContent = String(Math.round(1900 + 40 * e));
      if (p < 1) requestAnimationFrame(countYear);
    })(performance.now());

    var left = false;
    var leave = function () {
      if (left) return;
      left = true;
      root.classList.add("is-leaving");
      root.classList.remove("is-loading");
      setTimeout(startHero, 380);
      setTimeout(function () { loader.remove(); }, 1300);
      window.removeEventListener("keydown", leave);
      loader.removeEventListener("click", leave);
    };
    var minTime = 2300;
    var t0 = performance.now();
    var ready = function () { setTimeout(leave, Math.max(0, minTime - (performance.now() - t0))); };
    if (document.readyState === "complete") ready(); else window.addEventListener("load", ready);
    setTimeout(leave, 4500); // never wait longer than this
    window.addEventListener("keydown", leave);
    loader.addEventListener("click", leave);
  }

  /* ---------- Nav: scrolled, hide on scroll down, active link ---------- */
  var nav = $("[data-nav]");
  var bar = $(".progress span");
  var lastY = window.scrollY;
  var heroMedia = $(".hero-media");
  var heroIn = $(".hero-in");
  var hero = $(".hero");
  var parallaxEls = $$("[data-parallax]");
  var marqueeVel = 0;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 24);
      if (!root.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > lastY && y > 480);
    }
    marqueeVel += (y - lastY);
    lastY = y;

    if (calm) return;
    // Hero parallax and gentle fade as it leaves
    if (hero && y < hero.offsetHeight * 1.2) {
      if (heroMedia) heroMedia.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0)";
      if (heroIn) {
        var p = clamp(y / (hero.offsetHeight * 0.7), 0, 1);
        heroIn.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)";
        heroIn.style.opacity = String(1 - p * 0.9);
      }
    }
    // Image parallax inside frames
    var vh = window.innerHeight;
    parallaxEls.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var speed = parseFloat(img.getAttribute("data-parallax")) || 0.1;
      var room = r.height * 0.04 - 1; // scale(1.08) leaves 4% spare on each side
      var off = clamp(((r.top + r.height / 2) - vh / 2) * -speed, -room, room);
      img.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.08)";
    });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Active section in nav
  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        // Back on the hero, no section link is highlighted
        var a = byId[en.target.id] || null;
        links.forEach(function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
        if (a) {
          a.classList.add("is-active");
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) secIO.observe(s); });
    if (hero) secIO.observe(hero);
  }

  /* ---------- Mobile menu ---------- */
  var burger = $(".burger");
  var menu = $("#menu");
  var menuTimer = null;
  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    root.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
    var first = $("a", menu);
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 300);
  }
  function closeMenu(returnFocus) {
    menu.classList.remove("is-open");
    root.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    menuTimer = setTimeout(function () { menu.hidden = true; }, calm ? 0 : 800);
    if (returnFocus) burger.focus({ preventScroll: true });
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      if (burger.getAttribute("aria-expanded") === "true") closeMenu(true); else openMenu();
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("menu-open")) closeMenu(true);
      // Keep Tab inside the open menu (burger + menu links)
      if (e.key === "Tab" && root.classList.contains("menu-open")) {
        var items = [burger].concat($$("a", menu));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080 && root.classList.contains("menu-open")) closeMenu(false);
    });
  }

  /* ---------- Marquee (speeds up with scroll velocity) ---------- */
  var track = $(".marquee-track");
  if (track && !calm) {
    var group = $(".marquee-group", track);
    function fill() {
      // Enough copies to cover twice the viewport width
      $$(".marquee-group", track).slice(1).forEach(function (g) { g.remove(); });
      var w = group.getBoundingClientRect().width || 1;
      var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / w) + 1);
      for (var i = 1; i < copies; i++) track.appendChild(group.cloneNode(true));
      return w;
    }
    var gw = fill();
    var x = 0, dir = -1, boost = 0, mqVisible = true;
    window.addEventListener("resize", function () { gw = fill(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { mqVisible = en[0].isIntersecting; }).observe(track.parentElement);
    }
    (function frame() {
      if (mqVisible && !document.hidden) {
        var v = marqueeVel; marqueeVel = 0;
        if (v !== 0) dir = v > 0 ? -1 : 1;
        boost = lerp(boost, clamp(Math.abs(v) * 0.35, 0, 18), 0.12);
        x += dir * (0.6 + boost);
        if (x <= -gw) x += gw;
        if (x > 0) x -= gw;
        track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      } else {
        marqueeVel = 0;
      }
      requestAnimationFrame(frame);
    })();
  }

  /* ---------- Reviews carousel ---------- */
  var qWrap = $(".quotes");
  if (qWrap) {
    var slides = $$(".quote", qWrap);
    var dots = $$(".qdots button", qWrap);
    var cur = 0, qTimer = null, paused = false, inView = false;
    var DUR = 6500;
    qWrap.style.setProperty("--q-dur", DUR + "ms");
    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === cur;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dots.forEach(function (d, i) {
        if (i === cur) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
        // restart the progress fill
        var dot = d.querySelector("i");
        dot.style.animation = "none"; void dot.offsetWidth; dot.style.animation = "";
      });
      schedule();
    }
    function schedule() {
      clearTimeout(qTimer);
      var play = !calm && !paused && inView;
      qWrap.classList.toggle("is-playing", play);
      qWrap.classList.toggle("is-paused", !play);
      if (play) qTimer = setTimeout(function () { show(cur + 1); }, DUR);
    }
    $("[data-q=prev]", qWrap).addEventListener("click", function () { show(cur - 1); });
    $("[data-q=next]", qWrap).addEventListener("click", function () { show(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); }); });
    qWrap.addEventListener("mouseenter", function () { paused = true; schedule(); });
    qWrap.addEventListener("mouseleave", function () { paused = false; show(cur); });
    qWrap.addEventListener("focusin", function () { paused = true; schedule(); });
    qWrap.addEventListener("focusout", function (e) { if (!qWrap.contains(e.relatedTarget)) { paused = false; show(cur); } });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; show(cur); }, { threshold: 0.3 }).observe(qWrap);
    }
    show(0);
  }

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !calm) {
    // Magnetic buttons
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
        el.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px";
      });
      el.addEventListener("pointerleave", function () { el.style.translate = ""; });
    });

    // Tilt cards
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * 8).toFixed(2) + "deg) rotateY(" + (px * 10).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    // Cursor ring
    var cursor = $(".cursor");
    if (cursor) {
      var ring = $(".cursor-ring", cursor), dot = $(".cursor-dot", cursor);
      var mx = -100, my = -100, rx = -100, ry = -100, moving = false;
      window.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        mx = e.clientX; my = e.clientY;
        cursor.classList.add("is-on");
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
        if (!moving) { moving = true; requestAnimationFrame(follow); }
      }, { passive: true });
      document.addEventListener("pointerleave", function () { cursor.classList.remove("is-on"); });
      window.addEventListener("pointerdown", function () { cursor.classList.add("is-down"); });
      window.addEventListener("pointerup", function () { cursor.classList.remove("is-down"); });
      document.addEventListener("pointerover", function (e) {
        var t = e.target.closest && e.target.closest("a, button, [data-tilt], .bake-list li");
        cursor.classList.toggle("is-hover", !!t);
      });
      function follow() {
        rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
        ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
        if (Math.abs(rx - mx) > 0.1 || Math.abs(ry - my) > 0.1) requestAnimationFrame(follow);
        else moving = false;
      }
    }
  }

  /* ---------- Hero: drifting flour and warm sparks ---------- */
  var canvas = $(".hero-dust");
  if (canvas && canvas.getContext && !calm) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], heroVisible = true, px = 0, py = 0, tpx = 0, tpy = 0;
    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(clamp(W * H / 16000, 30, 90));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(true));
    }
    function spawn(anywhere) {
      var depth = Math.random();
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 10,
        r: 0.5 + depth * 1.9,
        vy: 0.12 + depth * 0.42,
        amp: 0.2 + Math.random() * 0.6,
        ph: Math.random() * Math.PI * 2,
        tw: 0.5 + Math.random() * 1.5,
        warm: Math.random() < 0.38,
        d: depth
      };
    }
    size();
    window.addEventListener("resize", size);
    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        tpx = (e.clientX / window.innerWidth - 0.5) * 2;
        tpy = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(canvas);
    }
    var tPrev = performance.now();
    (function draw(t) {
      requestAnimationFrame(draw);
      if (!heroVisible || document.hidden) { tPrev = t; return; }
      var dt = clamp((t - tPrev) / 16.67, 0, 3); tPrev = t;
      px = lerp(px, tpx, 0.04); py = lerp(py, tpy, 0.04);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy * dt;
        p.ph += 0.012 * dt;
        var x = p.x + Math.sin(p.ph) * 18 * p.amp - px * 14 * p.d;
        var y = p.y - py * 10 * p.d;
        if (p.y < -12) { parts[i] = spawn(false); continue; }
        var fadeTop = clamp(p.y / (H * 0.35), 0, 1);
        var a = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * p.tw + p.ph))) * fadeTop * (0.45 + p.d * 0.55);
        ctx.beginPath();
        ctx.fillStyle = p.warm ? "rgba(228,204,152," + a.toFixed(3) + ")" : "rgba(244,238,226," + (a * 0.75).toFixed(3) + ")";
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    })(tPrev);
  }

  window.__saReady = true;
})();
