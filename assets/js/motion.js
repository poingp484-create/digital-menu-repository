/* Motion: reveals, word splitting, scroll parallax, pointer depth, ink changes.
 * Only transform / opacity are animated per frame. Everything a view mounts is
 * returned as one destroy() so route changes leave no observers or listeners behind.
 */
(function () {
  "use strict";
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mqSmall = window.matchMedia("(max-width: 760px)");

  function reduced() { return mqReduce.matches; }
  function fine() { return mqFine.matches && !reduced(); }

  /* Wrap each word in a mask so it can rise into place. Keeps the text readable
   * to assistive tech through aria-label on the parent. */
  function splitWords(root) {
    var els = root.querySelectorAll("[data-split]");
    els.forEach(function (el) {
      if (el.dataset.splitDone) return;
      var lines = el.innerHTML.split(/<br\s*\/?>/i);
      if (!el.hasAttribute("aria-label")) {
        var probe = document.createElement("div");
        el.setAttribute("aria-label", lines.map(function (l) { probe.innerHTML = l; return probe.textContent.trim(); }).join(" ").replace(/\s+/g, " ").trim());
      }
      var i = 0;
      el.innerHTML = lines.map(function (line) {
        var tmp = document.createElement("div");
        tmp.innerHTML = line;
        var words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
        return words.map(function (w) {
          var s = '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + (i++) + '">' + escapeHtml(w) + "</span></span>";
          return s;
        }).join(" ");
      }).join("<br>");
      el.dataset.splitDone = "1";
    });
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount(root) {
    var cleanups = [];
    splitWords(root);

    /* Reveals: add .is-in once, then stop observing. */
    var revealEls = root.querySelectorAll("[data-reveal]");
    if (reduced() || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
      cleanups.push(function () { io.disconnect(); });
    }

    /* Blur ghosts: drop them where they never show, otherwise once their fade ends. */
    root.querySelectorAll(".focus-ghost").forEach(function (g) {
      if (getComputedStyle(g).display === "none") { g.remove(); return; }
      g.addEventListener("transitionend", function done(e) {
        if (e.propertyName === "opacity" && getComputedStyle(g).opacity === "0") { g.removeEventListener("transitionend", done); g.remove(); }
      });
    });

    /* Ink: sections tagged data-ink tint the page accent while centred. */
    var inkEls = root.querySelectorAll("[data-ink]");
    if (inkEls.length && "IntersectionObserver" in window) {
      var inkIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) document.documentElement.style.setProperty("--ink", e.target.dataset.ink);
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      inkEls.forEach(function (el) { inkIO.observe(el); });
      cleanups.push(function () { inkIO.disconnect(); document.documentElement.style.removeProperty("--ink"); });
    }

    /* Scroll parallax: [data-depth] moves relative to its (untransformed) parent.
     * Positions are cached; per frame we only do arithmetic for elements in view. */
    var layers = [];
    if (!reduced()) {
      root.querySelectorAll("[data-depth]").forEach(function (el) {
        var d = parseFloat(el.dataset.depth) || 0;
        if (mqSmall.matches) d *= 0.5;
        layers.push({ el: el, depth: d, top: 0, h: 0, on: false });
      });
    }
    var progressEls = reduced() ? [] : Array.prototype.map.call(root.querySelectorAll("[data-progress]"), function (el) {
      return { el: el, top: 0, h: 0, on: false, last: -1 };
    });
    var tracked = layers.concat(progressEls);

    if (tracked.length) {
      var vh = window.innerHeight;
      var measure = function () {
        vh = window.innerHeight;
        var sy = window.scrollY;
        tracked.forEach(function (t) {
          var ref = t.depth !== undefined ? (t.el.parentElement || t.el) : t.el;
          var r = ref.getBoundingClientRect();
          t.top = r.top + sy; t.h = r.height;
        });
      };
      var ticking = false;
      var frame = function () {
        ticking = false;
        var sy = window.scrollY;
        for (var i = 0; i < layers.length; i++) {
          var L = layers[i];
          if (!L.on) continue;
          var off = (L.top + L.h / 2) - (sy + vh / 2);
          L.el.style.transform = "translate3d(0," + (-off * L.depth).toFixed(1) + "px,0)";
        }
        for (var j = 0; j < progressEls.length; j++) {
          var P = progressEls[j];
          if (!P.on) continue;
          // 0 when the element's top meets the viewport bottom, 1 when its bottom leaves the top
          var p = (sy + vh - P.top) / (P.h + vh);
          p = Math.max(0, Math.min(1, p));
          if (Math.abs(p - P.last) > 0.002) { P.el.style.setProperty("--p", p.toFixed(3)); P.last = p; }
        }
      };
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
      var onResize = function () { measure(); onScroll(); };

      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          tracked.forEach(function (t) {
            var ref = t.depth !== undefined ? (t.el.parentElement || t.el) : t.el;
            if (ref === e.target) t.on = e.isIntersecting;
          });
        });
        onScroll();
      }, { rootMargin: "25% 0px 25% 0px" });
      tracked.forEach(function (t) { vis.observe(t.depth !== undefined ? (t.el.parentElement || t.el) : t.el); });

      measure();
      frame();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      // late-loading fonts and images change layout: re-measure once they settle
      var ro = "ResizeObserver" in window ? new ResizeObserver(function () { onResize(); }) : null;
      if (ro) ro.observe(root);
      cleanups.push(function () {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        vis.disconnect();
        if (ro) ro.disconnect();
      });
    }

    /* Pointer depth: [data-mouse] layers drift toward the pointer, eased. Fine pointers only. */
    var mouseEls = root.querySelectorAll("[data-mouse]");
    if (mouseEls.length && fine()) {
      var area = root.querySelector("[data-mouse-area]") || root;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var step = function () {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        mouseEls.forEach(function (el) {
          var d = parseFloat(el.dataset.mouse) || 0;
          el.style.transform = "translate3d(" + (cx * d).toFixed(2) + "px," + (cy * d).toFixed(2) + "px,0)";
        });
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(step) : 0;
      };
      var onMove = function (e) {
        var r = area.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(step);
      };
      var onLeave = function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); };
      area.addEventListener("pointermove", onMove, { passive: true });
      area.addEventListener("pointerleave", onLeave);
      cleanups.push(function () {
        cancelAnimationFrame(raf);
        area.removeEventListener("pointermove", onMove);
        area.removeEventListener("pointerleave", onLeave);
      });
    }

    return function destroy() { cleanups.forEach(function (fn) { fn(); }); cleanups = []; };
  }

  window.SOLEMN.motion = { mount: mount, reduced: reduced, fine: fine, splitWords: splitWords, mqReduce: mqReduce };
})();
