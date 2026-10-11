/* Bag state. Saved in localStorage when available; works in memory otherwise. */
(function () {
  "use strict";
  var KEY = "solemn.bag.v1";
  var listeners = [];
  var items = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(valid) : [];
    } catch (e) { return []; }
  }
  function valid(it) {
    return it && typeof it.slug === "string" && typeof it.size === "string" &&
      window.SOLEMN.data.bySlug(it.slug) && it.qty > 0;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage blocked: keep in memory */ }
  }
  function emit(change) {
    save();
    listeners.forEach(function (fn) { fn(items, change); });
  }
  function find(slug, size) {
    for (var i = 0; i < items.length; i++) if (items[i].slug === slug && items[i].size === size) return i;
    return -1;
  }

  window.SOLEMN.bag = {
    items: function () { return items.slice(); },
    count: function () { return items.reduce(function (n, it) { return n + it.qty; }, 0); },
    add: function (slug, size) {
      var i = find(slug, size);
      if (i > -1) items[i].qty = Math.min(9, items[i].qty + 1);
      else items.push({ slug: slug, size: size, qty: 1 });
      emit({ type: "add", slug: slug, size: size });
    },
    setQty: function (slug, size, qty) {
      var i = find(slug, size);
      if (i < 0) return;
      if (qty <= 0) items.splice(i, 1);
      else items[i].qty = Math.min(9, qty);
      emit({ type: "qty", slug: slug, size: size });
    },
    remove: function (slug, size) {
      var i = find(slug, size);
      if (i > -1) { items.splice(i, 1); emit({ type: "remove", slug: slug, size: size }); }
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
    }
  };
})();
