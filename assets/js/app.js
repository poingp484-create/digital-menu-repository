/* App shell: routing, page transitions, nav, menu, bag drawer, toast, cursor label, intro. */
(function () {
  "use strict";
  var S = window.SOLEMN, D = S.data, V = S.views, M = S.motion, bag = S.bag;
  var root = document.documentElement;
  var main = document.getElementById("main");
  var header = document.querySelector(".nav");
  var wipe = document.querySelector(".wipe");
  var wipeLabel = wipe.querySelector(".wipe-label");
  var current = null;
  var noop = function () {};

  /* ---------- routing ---------- */
  // Routes are plain tokens (#shop, #shop-low, #p-slug) so they survive any host.
  function parse() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!h || h === "home") return { view: "home" };
    if (h === "shop") return { view: "shop", sil: "all" };
    var m = h.match(/^shop-(low|high|boot|turf|laceup|heel)$/);
    if (m) return { view: "shop", sil: m[1] };
    if (h === "story") return { view: "story" };
    m = h.match(/^p-([a-z0-9-]+)$/);
    if (m && D.bySlug(m[1])) return { view: "product", p: D.bySlug(m[1]) };
    return { view: "404" };
  }
  function build(r) {
    if (r.view === "home") return V.home();
    if (r.view === "shop") return V.shop(r.sil);
    if (r.view === "story") return V.story();
    if (r.view === "product") return V.product(r.p);
    return V.notFound();
  }
  function routeLabel(r) {
    if (r.view === "home") return "Index";
    if (r.view === "shop") return "Shop";
    if (r.view === "story") return "Story";
    if (r.view === "product") return "N° " + r.p.no;
    return "404";
  }

  function render(first) {
    var r = parse();
    closeMenu(true);
    // Same shop, different silhouette: filter in place, no page swap.
    if (current && current.route.view === "shop" && r.view === "shop" && current.ctl && current.ctl.update) {
      current.ctl.update(r.sil); current.route = r; setActiveNav(r); return;
    }
    var v = build(r);
    var swap = function () {
      if (current) { current.destroyMotion(); current.destroyView(); }
      main.innerHTML = v.html;
      document.title = v.title;
      window.scrollTo(0, 0);
      var ctl = v.enhance ? v.enhance(main) : null;
      var destroyView = typeof ctl === "function" ? ctl : (ctl && ctl.destroy) || noop;
      current = { route: r, ctl: ctl, destroyView: destroyView, destroyMotion: M.mount(main) };
      setActiveNav(r);
      if (!first) {
        var h1 = main.querySelector("h1");
        if (h1) { if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
      }
    };
    if (first || M.reduced()) { swap(); return; }
    // Wipe: a panel rises with the destination name, the page swaps underneath, the panel lifts away.
    wipeLabel.textContent = routeLabel(r);
    wipe.classList.remove("is-out");
    wipe.classList.add("is-in");
    setTimeout(function () {
      swap();
      requestAnimationFrame(function () {
        wipe.classList.remove("is-in");
        wipe.classList.add("is-out");
      });
    }, 300);
  }
  wipe.addEventListener("transitionend", function (e) {
    if (e.target === wipe && wipe.classList.contains("is-out")) wipe.classList.remove("is-out");
  });
  window.addEventListener("hashchange", function () { render(false); });

  /* ---------- nav ---------- */
  var navLinks = header.querySelectorAll("[data-nav]");
  var dot = header.querySelector(".nav-dot");
  function setActiveNav(r) {
    var key = r.view === "product" ? "shop" : r.view;
    var active = null;
    navLinks.forEach(function (a) {
      var on = a.dataset.nav === key;
      if (on) { a.setAttribute("aria-current", "page"); active = a; } else a.removeAttribute("aria-current");
    });
    document.querySelectorAll(".menu [data-nav]").forEach(function (a) {
      if (a.dataset.nav === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    placeDot(active);
  }
  function placeDot(a) {
    if (!dot) return;
    if (!a || !a.offsetParent) { dot.style.opacity = "0"; return; }
    var box = dot.offsetParent.getBoundingClientRect(), r = a.getBoundingClientRect();
    dot.style.opacity = "1";
    dot.style.transform = "translate3d(" + (r.left - box.left + r.width / 2 - 3).toFixed(1) + "px,0,0)";
  }
  window.addEventListener("resize", function () { placeDot(header.querySelector("[data-nav][aria-current]")); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeDot(header.querySelector("[data-nav][aria-current]")); });

  // Hide on scroll down, return on scroll up. One rAF per burst of scroll events.
  var lastY = window.scrollY, navTick = false;
  window.addEventListener("scroll", function () {
    if (navTick) return;
    navTick = true;
    requestAnimationFrame(function () {
      navTick = false;
      var y = window.scrollY;
      header.classList.toggle("is-solid", y > 24);
      if (!document.body.classList.contains("has-overlay")) {
        if (y > 160 && y > lastY + 6) header.classList.add("is-hidden");
        else if (y < lastY - 6 || y < 160) header.classList.remove("is-hidden");
      }
      lastY = y;
    });
  }, { passive: true });
  header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });

  /* ---------- overlays: menu + bag ---------- */
  var menu = document.getElementById("menu");
  var menuBtn = header.querySelector("[data-menu]");
  var bagEl = document.getElementById("bag");
  var scrim = document.querySelector(".scrim");
  var opener = null;

  function setInert(on) {
    main.inert = on;
    document.querySelector(".foot").inert = on;
    document.body.classList.toggle("has-overlay", on);
  }
  function openPanel(el, from) {
    opener = from || document.activeElement;
    el.hidden = false;
    scrim.hidden = false;
    setInert(true);
    if (el === bagEl) header.inert = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      el.classList.add("is-open"); scrim.classList.add("is-open");
    }); });
    var f = el.querySelector("[data-autofocus]") || el.querySelector("button, a, input");
    if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closePanel(el, instant) {
    if (el.hidden) return;
    el.classList.remove("is-open"); scrim.classList.remove("is-open");
    var done = function () { el.hidden = true; scrim.hidden = true; };
    if (instant || M.reduced()) done(); else setTimeout(done, 480);
    setInert(false);
    header.inert = false;
    if (opener && opener.focus && !instant) opener.focus({ preventScroll: true });
  }
  function closeMenu(instant) {
    if (menu.hidden) return;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.querySelector("span").textContent = "Menu";
    menu.classList.remove("is-open");
    var done = function () { menu.hidden = true; };
    if (instant || M.reduced()) done(); else setTimeout(done, 520);
    setInert(false);
  }
  menuBtn.addEventListener("click", function () {
    if (!menu.hidden && menu.classList.contains("is-open")) { closeMenu(); return; }
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.querySelector("span").textContent = "Close";
    setInert(true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-bag-open]")) { e.preventDefault(); closeMenu(true); openPanel(bagEl, t.closest("[data-bag-open]")); return; }
    if (t.closest("[data-bag-close]") || t === scrim) { closePanel(bagEl); return; }
    var st = t.closest("[data-scrollto]");
    if (st) {
      var target = document.getElementById(st.dataset.scrollto);
      if (target) target.scrollIntoView({ behavior: M.reduced() ? "auto" : "smooth", block: "start" });
      return;
    }
    if (t.closest(".skip")) { e.preventDefault(); main.focus(); main.scrollIntoView(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!bagEl.hidden) closePanel(bagEl);
      else if (!menu.hidden) { closeMenu(); menuBtn.focus(); }
      return;
    }
    if (e.key === "Tab") {
      var trap = !bagEl.hidden ? bagEl : (!menu.hidden ? null : null);
      if (!trap) return;
      var f = trap.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- bag ---------- */
  var bagList = bagEl.querySelector(".bag-list");
  var bagEmpty = bagEl.querySelector(".bag-empty");
  var bagFoot = bagEl.querySelector(".bag-foot");
  var countEls = document.querySelectorAll("[data-bag-count]");
  function renderBag() {
    var items = bag.items();
    var n = bag.count();
    countEls.forEach(function (el) { el.textContent = n; });
    document.querySelectorAll("[data-bag-open]").forEach(function (b) { b.setAttribute("aria-label", "Bag, " + n + (n === 1 ? " item" : " items")); });
    bagEl.querySelector("[data-bag-n]").textContent = "(" + n + ")";
    bagEmpty.hidden = items.length > 0;
    bagFoot.hidden = items.length === 0;
    bagList.innerHTML = items.map(function (it) {
      var p = D.bySlug(it.slug);
      var id = it.slug + "|" + it.size;
      return '<li class="bag-item" data-id="' + V.esc(id) + '">' +
        '<a class="bag-thumb" href="#p-' + p.slug + '" data-bag-close tabindex="-1" aria-hidden="true">' + V.shoe(p, { alt: "", sizes: "96px" }) + "</a>" +
        '<div class="bag-info"><a class="bag-name" href="#p-' + p.slug + '" data-bag-close>' + V.esc(p.name) + "</a>" +
        '<p class="mono">N° ' + p.no + " · EU " + V.esc(it.size) + " · " + V.priceLabel(p) + "</p>" +
        '<div class="qty" role="group" aria-label="Quantity for ' + V.esc(p.name) + ", EU " + V.esc(it.size) + '">' +
        '<button type="button" class="qty-b" data-q="-1" aria-label="Decrease quantity">−</button>' +
        '<span class="qty-n" aria-live="polite">' + it.qty + "</span>" +
        '<button type="button" class="qty-b" data-q="1" aria-label="Increase quantity"' + (it.qty >= 9 ? " disabled" : "") + ">+</button></div></div>" +
        '<button type="button" class="link-sm bag-rm" data-rm aria-label="Remove ' + V.esc(p.name) + ", EU " + V.esc(it.size) + '">Remove</button></li>';
    }).join("");
  }
  bagList.addEventListener("click", function (e) {
    var li = e.target.closest(".bag-item");
    if (!li) return;
    var parts = li.dataset.id.split("|"), slug = parts[0], size = parts[1];
    var it = bag.items().filter(function (x) { return x.slug === slug && x.size === size; })[0];
    if (!it) return;
    var q = e.target.closest("[data-q]");
    if (q) {
      bag.setQty(slug, size, it.qty + Number(q.dataset.q));
      var again = bagList.querySelector('[data-id="' + CSS.escape(li.dataset.id) + '"] [data-q="' + q.dataset.q + '"]');
      (again && !again.disabled ? again : bagEl.querySelector("[data-autofocus]")).focus();
    }
    if (e.target.closest("[data-rm]")) { bag.remove(slug, size); bagEl.querySelector("[data-autofocus]").focus(); }
  });

  var toast = document.querySelector(".toast"), toastTimer = 0;
  function showToast(html) {
    toast.innerHTML = html;
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add("is-on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
      setTimeout(function () { toast.hidden = true; }, 400);
    }, 3600);
  }
  bag.subscribe(function (items, change) {
    renderBag();
    if (change.type === "add") {
      var p = D.bySlug(change.slug);
      showToast('<span class="mono">Added</span> ' + V.esc(p.name) + ", EU " + V.esc(change.size) +
        ' <button type="button" class="link-sm" data-bag-open>View bag</button>');
      countEls.forEach(function (el) {
        el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
      });
    }
  });

  /* ---------- cursor label (fine pointers only) ---------- */
  var cursor = document.querySelector(".cursor");
  if (M.fine() && cursor) {
    var label = cursor.querySelector("span");
    var tx = -100, ty = -100, cx = -100, cy = -100, craf = 0, on = false;
    var step = function () {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      craf = (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) ? requestAnimationFrame(step) : 0;
    };
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY;
      var t = e.target.closest && e.target.closest("[data-cursor]");
      var want = !!t && !(t.classList.contains("pdp-view") && t.classList.contains("is-zoomed"));
      if (want) label.textContent = t.dataset.cursor;
      if (want !== on) { on = want; cursor.classList.toggle("is-on", on); if (on) { cx = tx; cy = ty; } }
      if (on && !craf) craf = requestAnimationFrame(step);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { on = false; cursor.classList.remove("is-on"); });
  }

  /* ---------- grain: one static tile, painted once ---------- */
  try {
    var c = document.createElement("canvas"); c.width = c.height = 160;
    var g = c.getContext("2d"), img = g.createImageData(160, 160);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--grain", "url(" + c.toDataURL("image/png") + ")");
  } catch (e) { /* no grain, no problem */ }

  /* ---------- intro ---------- */
  var intro = document.querySelector(".intro");
  if (intro) {
    if (root.classList.contains("intro-play")) {
      var endIntro = function () {
        if (!intro.parentNode) return;
        root.classList.add("intro-done");
        setTimeout(function () { if (intro.parentNode) intro.remove(); root.classList.remove("intro-play"); }, 700);
        ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) { window.removeEventListener(ev, skip); });
      };
      var skip = function () { root.classList.add("intro-skipped"); endIntro(); };
      ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) { window.addEventListener(ev, skip, { passive: true, once: true }); });
      if (root.classList.contains("intro-calm")) {
        setTimeout(endIntro, 1500); // still brand card, then it fades
      } else {
        intro.addEventListener("animationend", function (e) { if (e.animationName === "lid-top") endIntro(); });
        setTimeout(endIntro, 2600); // safety net if animation events never fire
      }
    } else {
      intro.remove();
    }
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  renderBag();
  render(true);

  /* Always open on the hero: stop the browser (or a host page) from restoring an old scroll position.
   * Only resets if the visitor hasn't started scrolling or interacting yet. */
  (function () {
    var touched = false;
    var mark = function () { touched = true; };
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) { window.addEventListener(ev, mark, { passive: true, once: true }); });
    var toTop = function () { if (!touched && window.scrollY > 0) window.scrollTo(0, 0); };
    toTop();
    requestAnimationFrame(toTop);
    window.addEventListener("load", function () { toTop(); setTimeout(toTop, 120); });
    window.addEventListener("pageshow", function (e) { if (e.persisted) { touched = false; toTop(); } });
  })();
})();
