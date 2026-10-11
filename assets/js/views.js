/* Views: each returns { title, html, enhance(root) -> cleanup }. */
(function () {
  "use strict";
  var D = window.SOLEMN.data;
  var P = D.PRODUCTS;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function priceLabel(p) { return p.price == null ? "Price TBC" : "£" + p.price; }
  function finishLabel(id) {
    for (var i = 0; i < D.FINISHES.length; i++) if (D.FINISHES[i].id === id) return D.FINISHES[i].label;
    return id;
  }
  function silLabel(id) {
    for (var i = 0; i < D.SILHOUETTES.length; i++) if (D.SILHOUETTES[i].id === id) return D.SILHOUETTES[i].label;
    return id;
  }
  var ARROW = '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  /* A shoe image. Decorative copies pass alt:"" so screen readers hear each pair once. */
  function shoe(p, o) {
    o = o || {};
    var alt = o.alt != null ? o.alt : p.name + ": " + p.colourway;
    var cls = "shoe" + (o.cls ? " " + o.cls : "");
    if (!D.CUTOUTS_APPROVED) {
      return '<div class="' + cls + ' ph" style="aspect-ratio:' + p.w + "/" + p.h + '"' +
        (alt ? ' role="img" aria-label="' + esc(alt) + '"' : ' aria-hidden="true"') +
        '><span class="ph-l">N° ' + p.no + " · cutout pending</span></div>";
    }
    var full = D.IMG_DIR + p.img + ".webp", sm = D.IMG_DIR + p.img + "-sm.webp";
    return '<img class="' + cls + '" src="' + full + '" srcset="' + sm + " 480w, " + full + " " + p.w + 'w" sizes="' +
      (o.sizes || "60vw") + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(alt) + '"' +
      (alt ? "" : ' aria-hidden="true"') +
      (o.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async" draggable="false">';
  }

  /* Blur-to-focus wrapper: a 40px copy of the same cutout, stretched (so the browser's own
   * upscaling blurs it), cross-fades out while the sharp image fades in. No CSS filter at all. */
  function focusShoe(p, o) {
    var ghost = D.CUTOUTS_APPROVED
      ? '<img class="focus-ghost" src="' + D.IMG_DIR + p.img + '-blur.webp" width="' + p.w + '" height="' + p.h + '" alt="" aria-hidden="true" decoding="async">'
      : "";
    return '<span class="focus-in">' + shoe(p, o) + ghost + "</span>";
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  var WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  function word(n) { return WORDS[n] || String(n); }
  function bySlug(slug) { return D.bySlug(slug); }

  function splitName(name) {
    var parts = name.split(" ");
    if (parts.length < 2) return esc(name);
    var cut = Math.ceil(parts.length / 2);
    if (parts.length === 3) cut = 1;
    return esc(parts.slice(0, cut).join(" ")) + "<br>" + esc(parts.slice(cut).join(" "));
  }

  /* ---------- HOME ---------- */
  function home() {
    // Each pair appears once on this page: two in the hero, four as spreads, three in the line-up.
    var cobra = bySlug("cobra-airbrush-hightops"), maroon = bySlug("maroon-silver-boots");
    var featured = ["fur-chain-heels", "airbrush-face-spider-lows", "collage-lace-up-boots", "tiger-print-boots"].map(bySlug);
    var lineup = ["silver-turf-trainers", "crackle-face-boots", "pin-up-tattoo-hightops"].map(bySlug);
    var N = pad(P.length);
    var html = "" +
      '<section class="hero" data-mouse-area aria-labelledby="hero-title">' +
      '  <div class="hero-far" data-mouse="-14"><div class="hero-far-in" data-depth="-0.1">' + shoe(maroon, { alt: "", sizes: "45vw", cls: "hero-far-img" }) + "</div></div>" +
      '  <h1 class="hero-logo" id="hero-title" aria-label="Solemn"><span class="hl-row" aria-hidden="true">' +
      "SOLEMN".split("").map(function (c, i) { return '<span class="hl" style="--i:' + i + '">' + c + "</span>"; }).join("") +
      "</span></h1>" +
      '  <div class="hero-near" data-mouse="22"><div class="hero-near-in" data-depth="0.07" data-cursor="View">' +
      '    <a href="#p-' + cobra.slug + '" class="hero-near-link rv-shell" data-reveal aria-label="View ' + esc(cobra.name) + '">' + focusShoe(cobra, { eager: true, sizes: "(max-width:760px) 100vw, 58vw", alt: cobra.name + ": " + cobra.colourway }) + "</a>" +
      "  </div></div>" +
      '  <div class="hero-copy">' +
      '    <p class="eyebrow hero-eyebrow" data-reveal>Index of odd footwear · ' + N + ' pairs</p>' +
      '    <p class="hero-line" data-split data-reveal>Footwear for<br>the odd few.</p>' +
      '    <p class="hero-sub" data-reveal>Airbrushed customs, chained heels, collage boots and metallic oddities, cut clean and catalogued one pair at a time.</p>' +
      '    <div class="hero-cta" data-reveal><a class="btn btn--solid" href="#shop">Shop all pairs ' + ARROW + '</a><button class="btn btn--line" type="button" data-scrollto="pairs">See the pairs</button></div>' +
      "  </div>" +
      '  <dl class="label hero-label" data-reveal aria-label="Shoebox label">' +
      "    <div><dt>Style</dt><dd>SLM-IDX-001</dd></div><div><dt>Pairs</dt><dd>" + N + "</dd></div>" +
      "    <div><dt>Size</dt><dd>EU 38–46*</dd></div><div><dt>Price</dt><dd>TBC</dd></div>" +
      '    <p class="label-foot">*placeholder size run</p>' +
      "  </dl>" +
      "</section>" +

      '<section class="statement" aria-label="What the index holds">' +
      '  <p class="statement-text" data-split data-reveal>Airbrushed canvas. Chains on a stiletto. Collage under crackle. Teeth on the toe box.</p>' +
      '  <p class="statement-sub" data-reveal>' + word(P.length) + ' pairs, each photographed as found and catalogued below. Anything the photo can’t confirm is marked as unconfirmed.</p>' +
      "</section>" +

      '<section class="pairs" id="pairs" aria-label="Featured pairs">' +
      '  <header class="sec-head"><p class="eyebrow" data-reveal>Featured</p><h2 class="sec-title" data-split data-reveal>The pairs</h2></header>' +
      featured.map(spread).join("") +
      "</section>" +

      lineupSection(lineup) +
      silhouettes() +

      '<section class="teaser" aria-labelledby="teaser-q">' +
      '  <p class="eyebrow" data-reveal>The story</p>' +
      '  <blockquote class="teaser-q" id="teaser-q"><p data-split data-reveal>A shoe is the one thing people read from across a room.</p></blockquote>' +
      '  <a class="link-big" href="#story" data-reveal>Read the story ' + ARROW + "</a>" +
      "</section>";

    return {
      title: "SOLEMN · Footwear for the odd few",
      html: html,
      enhance: function (root) {
        var cleanups = [];
        cleanups.push(bindSilhouettes(root));
        cleanups.push(bindLineup(root));
        var shuffle = root.querySelector("[data-shuffle]");
        if (shuffle) {
          var onShuffle = function () {
            var cur = shuffle.dataset.last;
            var pool = P.filter(function (p) { return p.slug !== cur; });
            var pick = pool[Math.floor(Math.random() * pool.length)];
            shuffle.dataset.last = pick.slug;
            location.hash = "p-" + pick.slug;
          };
          shuffle.addEventListener("click", onShuffle);
          cleanups.push(function () { shuffle.removeEventListener("click", onShuffle); });
        }
        return function () { cleanups.forEach(function (f) { f && f(); }); };
      }
    };
  }

  var SPREAD_VARIANTS = ["a", "b", "c", "d"];
  function spread(p, i) {
    var v = SPREAD_VARIANTS[i % SPREAD_VARIANTS.length];
    var sizes = { a: "(max-width:760px) 100vw, 48vw", b: "(max-width:760px) 100vw, 64vw", c: "(max-width:760px) 100vw, 60vw", d: "(max-width:760px) 90vw, 520px" }[v];
    var nameHtml = v === "d"
      ? '<span class="sd-l">' + esc(p.name.split(" ")[0]) + '</span> <span class="sd-r">' + p.name.split(" ").slice(1).map(esc).join("<br>") + "</span>"
      : splitName(p.name);
    return "" +
      '<article class="spread spread--' + v + '" data-ink="' + p.ink + '" aria-labelledby="sp-' + p.no + '">' +
      '  <span class="spread-num" aria-hidden="true" data-depth="0.12">' + p.no + "</span>" +
      '  <div class="spread-shoe rv-shell" data-reveal style="--r:' + (p.w / p.h).toFixed(4) + '"><a class="spread-shoe-in" href="#p-' + p.slug + '" data-depth="-0.05" data-cursor="View" tabindex="-1" aria-hidden="true">' +
      focusShoe(p, { sizes: sizes, alt: "" }) +
      "  </a></div>" +
      '  <header class="spread-head">' +
      '    <p class="eyebrow" data-reveal>N° ' + p.no + " · " + esc(p.silhouetteLabel) + "</p>" +
      '    <h3 class="spread-name" id="sp-' + p.no + '"' + (v === "d" ? "" : " data-split") + " data-reveal>" + nameHtml + "</h3>" +
      "  </header>" +
      '  <dl class="spread-meta" data-reveal>' +
      "    <div><dt>Finish</dt><dd>" + p.finishes.map(finishLabel).join(", ") + "</dd></div>" +
      "    <div><dt>Colourway</dt><dd>" + esc(p.colourway) + "</dd></div>" +
      "    <div><dt>Price</dt><dd>" + priceLabel(p) + "</dd></div>" +
      "  </dl>" +
      '  <a class="spread-link" href="#p-' + p.slug + '" data-reveal><span>View the pair</span>' + ARROW + "</a>" +
      "</article>";
  }

  function silhouettes() {
    var rows = D.SILHOUETTES.filter(function (s) { return s.id !== "all"; }).map(function (s) {
      var list = P.filter(function (p) { return p.silhouette === s.id; });
      if (!list.length) return "";
      var n = list.length;
      return '<li><a class="sil-row" href="#shop-' + s.id + '" data-cursor="Shop" data-sil="' + s.id + '">' +
        '<span class="sil-word">' + esc(s.word || s.label) + "</span>" +
        '<span class="sil-count mono">' + pad(n) + (n === 1 ? " pair" : " pairs") + "</span>" +
        '<span class="sil-names">' + list.map(function (p) { return "<span>" + esc(p.name) + "</span>"; }).join("") + "</span>" +
        ARROW + "</a></li>";
    }).join("");
    return '<section class="sil" aria-labelledby="sil-title">' +
      '<header class="sec-head"><p class="eyebrow" data-reveal>Explore</p><h2 class="sec-title" id="sil-title" data-split data-reveal>By silhouette</h2></header>' +
      '<ul class="sil-list" data-reveal>' + rows + "</ul></section>";
  }

  function bindSilhouettes(root) {
    var list = root.querySelector(".sil-list");
    if (!list) return null;
    // Rows light up one at a time; the rest dim, so the hovered shape reads clearly.
    var onOver = function (e) {
      var row = e.target.closest(".sil-row");
      list.classList.toggle("has-hover", !!row);
      list.querySelectorAll(".sil-row").forEach(function (r) { r.classList.toggle("is-hot", r === row); });
    };
    var onOut = function (e) { if (!list.contains(e.relatedTarget)) onOver({ target: list }); };
    list.addEventListener("pointerover", onOver);
    list.addEventListener("pointerout", onOut);
    list.addEventListener("focusin", onOver);
    list.addEventListener("focusout", onOut);
    return function () {
      list.removeEventListener("pointerover", onOver);
      list.removeEventListener("pointerout", onOut);
      list.removeEventListener("focusin", onOver);
      list.removeEventListener("focusout", onOut);
    };
  }

  /* The line-up: three pairs standing full-size on one floor. No crops, no repeats. */
  function lineupSection(list) {
    var items = list.map(function (p, k) {
      return '<li class="lu-item" style="--k:' + k + ";--lu-ink:" + p.ink + '">' +
        '<a class="lu-link" href="#p-' + p.slug + '" data-cursor="View">' +
        '<span class="lu-stage rv-shell" data-reveal style="--d:' + (k * 120) + 'ms">' +
        focusShoe(p, { alt: "", sizes: "(max-width:760px) 72vw, 30vw" }) + "</span>" +
        '<span class="lu-cap"><span class="mono">N° ' + p.no + " · " + esc(p.silhouetteLabel) + "</span>" +
        '<span class="lu-name">' + esc(p.name) + "</span>" +
        '<span class="mono lu-price">' + priceLabel(p) + "</span></span></a></li>";
    }).join("");
    return '<section class="lineup" aria-labelledby="lu-title">' +
      '<header class="sec-head"><p class="eyebrow" data-reveal>Also in the index</p><h2 class="sec-title" id="lu-title" data-split data-reveal>The line-up</h2></header>' +
      '<ol class="lu-row">' + items + "</ol>" +
      '<div class="lu-foot" data-reveal><p class="mono lu-hint">Swipe the line-up</p><button class="btn btn--line" type="button" data-shuffle>Show me a random pair</button></div>' +
      "</section>";
  }

  function bindLineup(root) {
    var row = root.querySelector(".lu-row");
    if (!row) return null;
    // Hovering one pair steps the others back, like picking a shoe off a shelf.
    var onOver = function (e) {
      var it = e.target.closest(".lu-item");
      row.classList.toggle("has-hot", !!it);
      row.querySelectorAll(".lu-item").forEach(function (x) { x.classList.toggle("is-hot", x === it); });
    };
    var onOut = function (e) { if (!row.contains(e.relatedTarget)) onOver({ target: row }); };
    var onFocus = function (e) {
      onOver(e);
      var it = e.target.closest(".lu-item");
      if (it && row.scrollWidth > row.clientWidth) it.scrollIntoView({ block: "nearest", inline: "nearest", behavior: window.SOLEMN.motion.reduced() ? "auto" : "smooth" });
    };
    row.addEventListener("pointerover", onOver);
    row.addEventListener("pointerout", onOut);
    row.addEventListener("focusin", onFocus);
    row.addEventListener("focusout", onOut);
    return function () {
      row.removeEventListener("pointerover", onOver);
      row.removeEventListener("pointerout", onOut);
      row.removeEventListener("focusin", onFocus);
      row.removeEventListener("focusout", onOut);
    };
  }

  /* ---------- SHOP ---------- */
  function shop(sil) {
    sil = sil || "all";
    var titles = { all: "All pairs", low: "Low-tops", high: "High-tops", boot: "Football boots", turf: "Turf", laceup: "Lace-up boots", heel: "Heels" };
    var rows = P.map(function (p) {
      return '<li class="row-item" data-slug="' + p.slug + '" data-sil="' + p.silhouette + '" data-fin="' + p.finishes.join(" ") + '" data-no="' + p.no + '" data-name="' + esc(p.name) + '">' +
        '<a class="row" href="#p-' + p.slug + '">' +
        '<span class="row-no mono">' + p.no + "</span>" +
        '<span class="row-name">' + esc(p.name) + "</span>" +
        '<span class="row-sil mono">' + esc(p.silhouetteLabel) + "</span>" +
        '<span class="row-fin mono">' + p.finishes.map(finishLabel).join(" / ") + "</span>" +
        '<span class="row-price mono">' + priceLabel(p) + "</span>" +
        '<span class="row-thumb" aria-hidden="true">' + shoe(p, { alt: "", sizes: "120px" }) + "</span>" +
        ARROW + "</a></li>";
    }).join("");
    var stage = P.map(function (p, i) {
      return '<figure class="stage-i' + (i === 0 ? " is-on" : "") + '" data-slug="' + p.slug + '">' +
        '<span class="stage-name" aria-hidden="true">' + esc(p.short) + "</span>" +
        shoe(p, { alt: "", sizes: "40vw" }) +
        '<figcaption class="mono">N° ' + p.no + " · " + esc(p.colourway) + "</figcaption></figure>";
    }).join("");
    var silChips = D.SILHOUETTES.map(function (s) {
      return '<button type="button" class="chip" data-sil="' + s.id + '" aria-pressed="' + (s.id === sil) + '">' + esc(s.label) + "</button>";
    }).join("");
    var finChips = D.FINISHES.map(function (f) {
      return '<button type="button" class="chip" data-fin="' + f.id + '" aria-pressed="false">' + esc(f.label) + "</button>";
    }).join("");

    var html = '<section class="shop" aria-labelledby="shop-title">' +
      '<header class="shop-head">' +
      '  <p class="eyebrow" data-reveal>Shop · <span data-count>' + pad(P.length) + '</span> pairs</p>' +
      '  <h1 class="shop-title" id="shop-title" tabindex="-1" data-shop-title>' + titles[sil] + "</h1>" +
      "</header>" +
      '<div class="filters" data-reveal>' +
      '  <div class="chips" role="group" aria-label="Silhouette">' + silChips + "</div>" +
      '  <div class="chips" role="group" aria-label="Finish">' + finChips + "</div>" +
      '  <div class="filters-end"><label class="sort mono" for="shop-sort">Sort</label>' +
      '    <select id="shop-sort" class="select"><option value="index">Index order</option><option value="name">Name A–Z</option><option value="silhouette">Silhouette</option></select>' +
      '    <button type="button" class="link-sm" data-clear>Clear</button></div>' +
      "</div>" +
      '<div class="shop-body">' +
      '  <div class="rows-wrap"><div class="rows-head mono" aria-hidden="true"><span>N°</span><span>Pair</span><span>Silhouette</span><span>Finish</span><span>Price</span></div>' +
      '  <ol class="rows" data-reveal>' + rows + "</ol>" +
      '  <p class="empty" hidden>No pairs match these filters. <button type="button" class="link-sm" data-clear>Clear filters</button></p>' +
      '  <p class="shop-note mono">Prices, sizes and stock are placeholders until confirmed.</p></div>' +
      '  <div class="shop-stage" aria-hidden="true">' + stage + "</div>" +
      "</div></section>";

    return {
      title: "Shop · " + titles[sil] + " · SOLEMN",
      html: html,
      key: "shop",
      enhance: function (root) {
        var state = { sil: sil, fin: [], sort: "index" };
        var list = root.querySelector(".rows");
        var items = Array.prototype.slice.call(list.children);
        var empty = root.querySelector(".empty");
        var count = root.querySelector("[data-count]");
        var title = root.querySelector("[data-shop-title]");
        var sortSel = root.querySelector("#shop-sort");
        var stageItems = root.querySelectorAll(".stage-i");

        function apply(animate) {
          var first = new Map();
          if (animate && !window.SOLEMN.motion.reduced()) items.forEach(function (li) { if (!li.hidden) first.set(li, li.getBoundingClientRect()); });
          var shown = items.filter(function (li) {
            var okS = state.sil === "all" || li.dataset.sil === state.sil;
            var fins = li.dataset.fin.split(" ");
            var okF = state.fin.every(function (f) { return fins.indexOf(f) > -1; });
            li.hidden = !(okS && okF);
            return !li.hidden;
          });
          var sorted = items.slice().sort(function (a, b) {
            if (state.sort === "name") return a.dataset.name.localeCompare(b.dataset.name);
            if (state.sort === "silhouette") return a.dataset.sil.localeCompare(b.dataset.sil) || a.dataset.no.localeCompare(b.dataset.no);
            return a.dataset.no.localeCompare(b.dataset.no);
          });
          sorted.forEach(function (li) { list.appendChild(li); });
          // FLIP: rows glide to their new slots instead of jumping
          if (first.size) {
            shown.forEach(function (li, k) {
              var a = first.get(li), b = li.getBoundingClientRect();
              if (!a) {
                li.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: k * 40, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
              } else if (Math.abs(a.top - b.top) > 1) {
                li.animate([{ transform: "translateY(" + (a.top - b.top) + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" });
              }
            });
          }
          var n = shown.length;
          count.textContent = n < 10 ? "0" + n : String(n);
          empty.hidden = n > 0;
          title.textContent = titles[state.sil] + (state.fin.length ? " · " + state.fin.map(finishLabel).join(" + ") : "");
          root.querySelectorAll(".chip[data-sil]").forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.sil === state.sil); });
          root.querySelectorAll(".chip[data-fin]").forEach(function (c) { c.setAttribute("aria-pressed", state.fin.indexOf(c.dataset.fin) > -1); });
          if (shown[0]) setStage(shown[0].dataset.slug);
          var want = state.sil === "all" ? "shop" : "shop-" + state.sil;
          if (location.hash.slice(1) !== want) { try { history.replaceState(null, "", "#" + want); } catch (e) { /* sandboxed host: keep state in page */ } }
          document.title = "Shop · " + titles[state.sil] + " · SOLEMN";
        }
        function setStage(slug) {
          stageItems.forEach(function (s) { s.classList.toggle("is-on", s.dataset.slug === slug); });
          items.forEach(function (li) { li.classList.toggle("is-hot", li.dataset.slug === slug); });
        }

        var onClick = function (e) {
          var c = e.target.closest(".chip");
          if (c && c.dataset.sil) { state.sil = c.dataset.sil; apply(true); return; }
          if (c && c.dataset.fin) {
            var f = c.dataset.fin, at = state.fin.indexOf(f);
            if (at > -1) state.fin.splice(at, 1); else state.fin.push(f);
            apply(true); return;
          }
          if (e.target.closest("[data-clear]")) {
            state.sil = "all"; state.fin = []; state.sort = "index"; sortSel.value = "index"; apply(true);
          }
        };
        var onSort = function () { state.sort = sortSel.value; apply(true); };
        var onHover = function (e) { var li = e.target.closest(".row-item"); if (li) setStage(li.dataset.slug); };
        root.addEventListener("click", onClick);
        sortSel.addEventListener("change", onSort);
        list.addEventListener("pointerover", onHover);
        list.addEventListener("focusin", onHover);
        apply(false);

        return {
          destroy: function () {
            root.removeEventListener("click", onClick);
            sortSel.removeEventListener("change", onSort);
            list.removeEventListener("pointerover", onHover);
            list.removeEventListener("focusin", onHover);
          },
          // hash changed to another silhouette while already on the shop
          update: function (newSil) { state.sil = newSil || "all"; apply(true); }
        };
      }
    };
  }

  /* ---------- PRODUCT ---------- */
  function product(p) {
    var idx = P.indexOf(p);
    var next = P[(idx + 1) % P.length], prev = P[(idx - 1 + P.length) % P.length];
    var sizes = p.sizes.map(function (s) {
      return '<label class="size"><input type="radio" name="size" value="' + s + '"><span>' + s + "</span></label>";
    }).join("");
    var html = '<article class="pdp" data-ink="' + p.ink + '" aria-labelledby="pdp-title">' +
      '<div class="pdp-stage">' +
      '  <span class="pdp-bgname" aria-hidden="true" data-depth="0.08">' + esc(p.short) + "</span>" +
      '  <div class="pdp-view rv-shell" data-reveal data-cursor="Zoom" tabindex="0" role="button" aria-pressed="false" aria-label="Look closer at the ' + esc(p.name) + '"><div class="pdp-pan"><div class="pdp-zoom" style="--r:' + (p.w / p.h).toFixed(4) + '">' + focusShoe(p, { eager: true, sizes: "(max-width:900px) 100vw, 60vw" }) + "</div></div></div>" +
      '  <p class="pdp-hint mono">Click or press Enter to look closer · arrows move · Esc steps back</p>' +
      "</div>" +
      '<div class="pdp-info">' +
      '  <nav class="crumbs mono" aria-label="Breadcrumb"><a href="#shop">Shop</a> / <a href="#shop-' + p.silhouette + '">' + esc(silLabel(p.silhouette)) + "</a> / <span>N° " + p.no + "</span></nav>" +
      '  <h1 class="pdp-name" id="pdp-title" tabindex="-1" data-split data-reveal>' + splitName(p.name) + "</h1>" +
      '  <p class="pdp-price" data-reveal><span>' + priceLabel(p) + '</span><span class="tag mono">placeholder</span></p>' +
      '  <div class="pdp-block" data-reveal><h2 class="mono">Colourway</h2>' +
      '    <div class="swatches"><span class="swatch is-on" style="--sw:' + p.ink + '" aria-hidden="true"></span><span>' + esc(p.colourway) + '</span></div>' +
      '    <p class="note">Only this colourway was photographed.</p></div>' +
      '  <fieldset class="pdp-block sizes" data-reveal><legend class="mono">Size · EU</legend><div class="size-grid">' + sizes + "</div>" +
      '    <p class="note">Placeholder size run. Availability is not confirmed.</p></fieldset>' +
      '  <div class="pdp-buy" data-reveal><button type="button" class="btn btn--solid btn--wide" data-add>Add to bag</button>' +
      '    <p class="add-msg" role="status" aria-live="polite"></p></div>' +
      '  <div class="pdp-block" data-reveal><h2 class="mono">What the photo shows</h2><ul class="facts">' +
      p.observed.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul></div>" +
      '  <div class="pdp-block" data-reveal><h2 class="mono">Not yet confirmed</h2><ul class="facts facts--muted">' +
      "<li>Brand and model name</li><li>Materials</li><li>Price</li><li>Size availability</li></ul></div>" +
      "</div></article>" +
      '<nav class="pairnav" aria-label="More pairs">' +
      '  <a class="pairnav-prev mono" href="#p-' + prev.slug + '">' + ARROW + " N° " + prev.no + " " + esc(prev.name) + "</a>" +
      '  <a class="pairnav-next" href="#p-' + next.slug + '" data-cursor="Next">' +
      '    <span class="eyebrow">Next pair · N° ' + next.no + "</span>" +
      '    <span class="pairnav-name">' + esc(next.name) + "</span>" +
      '    <span class="pairnav-shoe" aria-hidden="true">' + shoe(next, { alt: "", sizes: "40vw" }) + "</span></a>" +
      "</nav>";

    return {
      title: p.name + " · SOLEMN",
      html: html,
      enhance: function (root) {
        var view = root.querySelector(".pdp-view");
        var pan = root.querySelector(".pdp-pan");
        var addBtn = root.querySelector("[data-add]");
        var msg = root.querySelector(".add-msg");
        var zoomed = false;

        function setZoom(on, e) {
          zoomed = on;
          view.classList.toggle("is-zoomed", on);
          view.setAttribute("aria-pressed", on);
          if (on && e) pointPan(e);
          if (!on) pan.style.transform = "";
        }
        function pointPan(e) {
          var r = view.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          pan.style.transformOrigin = (x * 100).toFixed(1) + "% " + (y * 100).toFixed(1) + "%";
          pan.style.transform = "scale(" + (p.lowRes ? 1.6 : 2) + ")"; // low-res photos get a gentler zoom
        }
        var onViewClick = function (e) { setZoom(!zoomed, e); };
        var onMove = function (e) { if (zoomed) pointPan(e); };
        var onLeave = function () { if (zoomed) setZoom(false); };
        // Keyboard: Enter/Space looks closer at the centre, arrow keys move around, Escape steps back.
        var kx = 0.5, ky = 0.5;
        function keyPan() {
          pan.style.transformOrigin = (kx * 100).toFixed(1) + "% " + (ky * 100).toFixed(1) + "%";
          pan.style.transform = "scale(" + (p.lowRes ? 1.6 : 2) + ")";
        }
        var onKey = function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kx = ky = 0.5; setZoom(!zoomed); if (zoomed) keyPan(); return; }
          if (e.key === "Escape" && zoomed) { e.stopPropagation(); setZoom(false); return; }
          var step = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
          if (step && zoomed) { e.preventDefault(); kx = Math.min(1, Math.max(0, kx + step[0])); ky = Math.min(1, Math.max(0, ky + step[1])); keyPan(); }
        };
        var onBlur = function () { if (zoomed) setZoom(false); };
        var onAdd = function () {
          var picked = root.querySelector('input[name="size"]:checked');
          if (!picked) {
            msg.textContent = "Pick a size first.";
            root.querySelector(".sizes").classList.remove("needs"); void root.querySelector(".sizes").offsetWidth;
            root.querySelector(".sizes").classList.add("needs");
            root.querySelector('input[name="size"]').focus();
            return;
          }
          window.SOLEMN.bag.add(p.slug, picked.value);
          msg.textContent = "Added EU " + picked.value + " to your bag.";
        };
        var onSize = function () { msg.textContent = ""; root.querySelector(".sizes").classList.remove("needs"); };
        view.addEventListener("click", onViewClick);
        view.addEventListener("pointermove", onMove, { passive: true });
        view.addEventListener("pointerleave", onLeave);
        view.addEventListener("keydown", onKey);
        view.addEventListener("blur", onBlur);
        addBtn.addEventListener("click", onAdd);
        root.querySelector(".size-grid").addEventListener("change", onSize);
        return function () {
          view.removeEventListener("click", onViewClick);
          view.removeEventListener("pointermove", onMove);
          view.removeEventListener("pointerleave", onLeave);
          view.removeEventListener("keydown", onKey);
          view.removeEventListener("blur", onBlur);
          addBtn.removeEventListener("click", onAdd);
        };
      }
    };
  }

  /* ---------- STORY ---------- */
  function story() {
    // Five chapters, five different pairs, each shown whole.
    var ch = [
      { n: "I", t: "Paint that bends", p: bySlug("cobra-airbrush-hightops"), body: [
        "Airbrush art grew up on custom cars, T-shirts and denim long before it reached sneaker canvas. On a shoe the paint has to bend: across eyelets, over stitching, into the crease where the foot flexes.",
        "A cobra coils up the side of these green high-tops, its tongue running into the laces. The face and spider lows and the pin-up high-tops carry the same idea in different hands."
      ] },
      { n: "II", t: "The fold-over tongue", p: bySlug("maroon-silver-boots"), body: [
        "A long tongue folded down over the laces is a football-boot detail. It covers the knot and gives the top of the foot one clean surface.",
        "It shows up twice here: on the maroon boots and on the silver turf trainers, each with an emblem printed on the flap."
      ] },
      { n: "III", t: "Hardware", p: bySlug("fur-chain-heels"), body: [
        "Some boots are worn like jewellery. Gunmetal chains criss-cross these olive shafts and lock into buckles at the ankle, each one hung with a cross.",
        "Fur bands, a studded cuff and a croc-effect toe sit on a metal stiletto. Nothing about it is quiet."
      ] },
      { n: "IV", t: "Collage under crackle", p: bySlug("collage-lace-up-boots"), body: [
        "A crackled finish laid over printed collage makes a boot read like a wall of torn posters: newsprint, red blocks, a face half lost in the cracks.",
        "Two lace-up pairs in the index share it, one with long brown laces and one with tan suede panels and a pop-art face."
      ] },
      { n: "V", t: "Teeth", p: bySlug("tiger-print-boots"), body: [
        "Patent and metallic finishes throw reflections across their own panels, so the shoe changes as you walk around it. Print does the opposite: it stays put and stares back.",
        "The tiger boots wear a face on each toe box, teeth running along the sole line."
      ] }
    ];
    var html = '<article class="story" aria-labelledby="story-title">' +
      '<header class="story-head">' +
      '  <p class="eyebrow" data-reveal>The story</p>' +
      '  <h1 class="story-title" id="story-title" tabindex="-1" data-split data-reveal>Odd shoes,<br>looked at closely.</h1>' +
      '  <p class="story-lede" data-reveal>SOLEMN is an index of footwear that doesn’t blend in. Each pair is cut from its original photo and checked edge by edge on light and dark grounds. Colours, logos and wear are left exactly as photographed.</p>' +
      "</header>" +
      ch.map(function (c, i) {
        return '<section class="chapter chapter--' + (i % 2 ? "r" : "l") + '" data-ink="' + c.p.ink + '" aria-labelledby="ch-' + i + '">' +
          '<div class="chapter-frag rv-shell" data-reveal aria-hidden="true"><a class="chapter-frag-in" href="#p-' + c.p.slug + '" tabindex="-1" data-depth="-0.06" data-cursor="View">' +
          focusShoe(c.p, { alt: "", sizes: "(max-width:900px) 100vw, 46vw" }) + "</a></div>" +
          '<div class="chapter-text"><p class="chapter-n" aria-hidden="true" data-reveal>' + c.n + "</p>" +
          '<h2 class="chapter-title" id="ch-' + i + '" data-split data-reveal>' + esc(c.t) + "</h2>" +
          c.body.map(function (b) { return '<p data-reveal>' + esc(b) + "</p>"; }).join("") +
          '<a class="spread-link" href="#p-' + c.p.slug + '" data-reveal><span>See ' + esc(c.p.name) + "</span>" + ARROW + "</a></div></section>";
      }).join("") +
      '<section class="story-end" aria-label="Browse">' +
      '  <p class="story-end-q" data-split data-reveal>' + word(P.length) + " pairs. No two alike.</p>" +
      '  <a class="btn btn--solid" href="#shop" data-reveal>Shop the index ' + ARROW + "</a>" +
      "</section></article>";
    return { title: "Story · SOLEMN", html: html };
  }

  function notFound() {
    return {
      title: "Not found · SOLEMN",
      html: '<section class="nf"><p class="eyebrow">Error 404</p><h1 class="nf-title" tabindex="-1">No pair here.</h1>' +
        '<p>That link doesn’t match a page or a pair in the index.</p><a class="btn btn--solid" href="#home">Back to the index ' + ARROW + "</a></section>"
    };
  }

  window.SOLEMN.views = { home: home, shop: shop, product: product, story: story, notFound: notFound, shoe: shoe, esc: esc, priceLabel: priceLabel, ARROW: ARROW };
})();
