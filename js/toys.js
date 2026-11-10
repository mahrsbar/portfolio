/* The toy on each case file's wall: a small, playable version of what the project does.
   Built from spans and buttons so it can live inside the summary paragraph, which is
   what carries the wall; on a narrow screen it simply drops under the words. */
(function () {
  "use strict";
  var host = document.querySelector(".case-intro[data-toy]");
  if (!host) return;
  var wall = host.querySelector(".intro-sum");
  if (!wall) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function panel(kind, title) {
    var p = el("span", "toy toy-" + kind);
    p.appendChild(el("span", "toy-k", title));
    wall.appendChild(p);
    return p;
  }
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function onTheme(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn);
  }
  function whenSeen(node, fn) {
    if (!("IntersectionObserver" in window)) return fn();
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: 0.5 });
    io.observe(node);
  }

  var toys = {
    /* Design system: one set of tokens. A swatch re-themes the wall, the bar and the components at once. */
    theme: function () {
      var p = panel("theme", "one set of tokens");
      var THEMES = [
        { name: "Violet", brand: "#6E5BD6", light: ["#D9D5F4", "#D0CBF0"], dark: ["#201E3A", "#25223F"] },
        { name: "Teal", brand: "#2F8F83", light: ["#BFE4D3", "#B5DECB"], dark: ["#1B2238", "#1F2740"] },
        { name: "Coral", brand: "#E0503A", light: ["#F8D6CC", "#F4CCBF"], dark: ["#2A1E24", "#30232A"] },
        { name: "Sky", brand: "#2F6FB8", light: ["#CFE2F3", "#C5DBEF"], dark: ["#18263A", "#1C2B41"] }
      ];
      var row = el("span", "tt-swatches");
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", "Theme");
      var demo = el("span", "tt-demo");
      demo.innerHTML =
        '<span class="tt-row"><span class="tt-btn">Approve</span><span class="tt-btn tt-ghost">Cancel</span><span class="tt-switch" aria-hidden="true"><i></i></span></span>' +
        '<span class="tt-row"><span class="tt-chip">Pending</span><span class="tt-chip tt-chip-on">Approved</span><span class="tt-chip">Flagged</span></span>' +
        '<span class="tt-card"><span class="tt-ava" aria-hidden="true"></span><span class="tt-lines" aria-hidden="true"><i></i><i></i></span><span class="tt-badge">3</span></span>';
      var current = 0;
      function apply() {
        var t = THEMES[current], w = isDark() ? t.dark : t.light, b = document.body.style;
        b.setProperty("--wall", w[0]);
        b.setProperty("--wall-stripe", w[1]);
        b.setProperty("--wallpaper", "repeating-linear-gradient(90deg, transparent 0 26px, " + w[1] + " 26px 52px)");
        p.style.setProperty("--brand", t.brand);
        row.querySelectorAll("button").forEach(function (x, i) { x.setAttribute("aria-pressed", String(i === current)); });
      }
      THEMES.forEach(function (t, i) {
        var s = el("button", "tt-swatch");
        s.type = "button";
        s.style.setProperty("--sw", t.brand);
        s.setAttribute("aria-label", t.name + " theme");
        s.addEventListener("click", function () { current = i; apply(); });
        row.appendChild(s);
      });
      p.appendChild(row);
      p.appendChild(demo);
      onTheme(apply);
      apply();
    },

    /* Ask bar: the question comes back as filters you can see and remove, not as an answer. */
    ask: function () {
      var p = panel("ask", "ask it something");
      var bar = el("span", "ta-bar");
      var input = el("input");
      input.type = "text";
      input.setAttribute("aria-label", "Ask a question about transactions");
      input.placeholder = "failed payments near Halifax";
      var go = el("button", "ta-go", "Ask");
      go.type = "button";
      bar.appendChild(input);
      bar.appendChild(go);
      var chips = el("span", "ta-chips");
      chips.setAttribute("aria-live", "polite");
      var map = el("span", "ta-map");
      map.setAttribute("aria-hidden", "true");
      var PLACES = { halifax: [74, 30], toronto: [46, 52], vancouver: [12, 34], calgary: [22, 40], montreal: [60, 40], ottawa: [54, 46], regina: [30, 44], winnipeg: [36, 48] };
      var svg = '<svg viewBox="0 12 100 50" preserveAspectRatio="xMidYMid slice"><path class="ta-land" d="M0 22 C12 14 20 26 30 20 S48 10 58 18 S74 8 84 16 S96 12 100 14 V64 H0 Z"/>';
      for (var i = 0; i < 18; i++) {
        var x = 6 + ((i * 37) % 88), y = 24 + ((i * 23) % 34);
        svg += '<circle class="ta-pin" cx="' + x + '" cy="' + y + '" r="2"/>';
      }
      svg += '<g class="ta-hot"></g></svg>';
      map.innerHTML = svg;
      p.appendChild(bar);
      p.appendChild(chips);
      p.appendChild(map);

      function parse(q) {
        q = q.toLowerCase();
        var out = [];
        if (/fail|declin|reject|bounc/.test(q)) out.push(["Status", "Failed"]);
        else if (/approv|success|clear/.test(q)) out.push(["Status", "Approved"]);
        if (/fraud|suspicious|odd|weird/.test(q)) out.push(["Flag", "Suspicious"]);
        for (var k in PLACES) if (q.indexOf(k) > -1) { out.push(["Place", k.charAt(0).toUpperCase() + k.slice(1)]); break; }
        if (/today/.test(q)) out.push(["Range", "Today"]);
        else if (/yesterday/.test(q)) out.push(["Range", "Yesterday"]);
        else if (/week|7 days/.test(q)) out.push(["Range", "Last 7 days"]);
        else if (/month|30 days/.test(q)) out.push(["Range", "Last 30 days"]);
        var m = q.match(/(?:over|above|more than|>)\s*\$?(\d+)/);
        if (m) out.push(["Amount", "Over $" + m[1]]);
        return out;
      }
      function draw(list) {
        chips.innerHTML = "";
        var hot = map.querySelector(".ta-hot");
        hot.innerHTML = "";
        if (!list.length) {
          chips.appendChild(el("span", "ta-none", "Nothing in that maps to a filter yet"));
          return;
        }
        list.forEach(function (f, i) {
          var c = el("span", "ta-chip");
          c.style.setProperty("--i", i);
          c.appendChild(el("b", null, f[0] + ": "));
          c.appendChild(document.createTextNode(f[1]));
          var x = el("button", "ta-x", "×");
          x.type = "button";
          x.setAttribute("aria-label", "Remove " + f[0] + " filter");
          x.addEventListener("click", function () { list.splice(list.indexOf(f), 1); draw(list); });
          c.appendChild(x);
          chips.appendChild(c);
        });
        var place = list.filter(function (f) { return f[0] === "Place"; })[0];
        var at = place ? PLACES[place[1].toLowerCase()] : null;
        var n = list.length ? 5 : 0;
        for (var j = 0; j < n; j++) {
          var cx = at ? at[0] + ((j * 7) % 9) - 4 : 10 + ((j * 29) % 80);
          var cy = at ? at[1] + ((j * 5) % 9) - 4 : 28 + ((j * 13) % 30);
          hot.insertAdjacentHTML("beforeend", '<circle class="ta-hit" style="--i:' + j + '" cx="' + cx + '" cy="' + cy + '" r="3"/>');
        }
      }
      function ask() { draw(parse(input.value || input.placeholder)); }
      go.addEventListener("click", ask);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(); } });

      // the first question types itself once the wall is in view
      var demoQ = "failed payments near Halifax last week";
      whenSeen(p, function () {
        if (still) { input.value = demoQ; return ask(); }
        var n = 0;
        var t = setInterval(function () {
          if (document.activeElement === input) { clearInterval(t); return; }
          input.value = demoQ.slice(0, ++n);
          if (n >= demoQ.length) { clearInterval(t); setTimeout(ask, 300); }
        }, 45);
      });
    },

    /* Unified user page: four tools an analyst juggled, folded into one page around a timeline. */
    tabs: function () {
      var p = panel("tabs", "four tools, one page");
      var stage = el("span", "tb-stage");
      stage.setAttribute("aria-hidden", "true");
      ["Search", "Map", "Graph", "Logs"].forEach(function (n, i) {
        var w = el("span", "tb-win");
        w.style.setProperty("--i", i);
        w.innerHTML = '<span class="tb-top"><i></i><i></i><i></i><b>' + n + '</b></span><span class="tb-body tb-' + n.toLowerCase() + '"></span>';
        stage.appendChild(w);
      });
      var page = el("span", "tb-page");
      var bars = "";
      [3, 4, 2, 5, 3, 9, 11, 8, 10, 3, 2, 4, 3].forEach(function (h, i) { bars += '<i style="--h:' + h + ';' + (i > 4 && i < 9 ? "--hot:1" : "") + '"></i>'; });
      page.innerHTML = '<span class="tb-top"><i></i><i></i><i></i><b>User page</b></span><span class="tb-time">' + bars + '</span><span class="tb-cards"><i></i><i></i><i></i><i></i></span>';
      stage.appendChild(page);
      var btn = el("button", "toy-btn", "Fold into one page");
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        var on = !p.classList.contains("merged");
        p.classList.toggle("merged", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.textContent = on ? "Back to four tools" : "Fold into one page";
      });
      p.appendChild(stage);
      p.appendChild(btn);
    },

    /* Licensing: the application was eleven steps; the redesign made it six. The duck climbs either. */
    stairs: function () {
      var p = panel("stairs", "eleven steps, then six");
      var stage = el("span", "st-stage");
      stage.setAttribute("aria-hidden", "true");
      var steps = [];
      for (var i = 0; i < 11; i++) { var s = el("span", "st-step"); s.style.setProperty("--i", i); stage.appendChild(s); steps.push(s); }
      var duck = el("img", "st-duck");
      duck.src = (document.querySelector('link[rel="icon"]') || {}).href || "";
      duck.alt = "";
      stage.appendChild(duck);
      var count = el("span", "st-count");
      count.setAttribute("aria-live", "polite");
      var seg = el("span", "toy-seg");
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", "Version");
      var b11 = el("button", null, "Before: 11"), b6 = el("button", null, "After: 6");
      [b11, b6].forEach(function (b) { b.type = "button"; seg.appendChild(b); });
      p.appendChild(stage);
      p.appendChild(count);
      p.appendChild(seg);

      var timer = null;
      function set(n) {
        clearInterval(timer);
        p.style.setProperty("--n", n);
        steps.forEach(function (s, i) { s.classList.toggle("gone", i >= n); });
        b11.setAttribute("aria-pressed", String(n === 11));
        b6.setAttribute("aria-pressed", String(n === 6));
        var at = 0;
        function place() {
          p.style.setProperty("--at", at);
          count.textContent = "Step " + at + " of " + n;
        }
        place();
        if (still) { at = n; return place(); }
        timer = setInterval(function () {
          at++;
          place();
          if (at >= n) clearInterval(timer);
        }, 260);
      }
      b11.addEventListener("click", function () { set(11); });
      b6.addEventListener("click", function () { set(6); });
      p.style.setProperty("--n", 11);
      p.style.setProperty("--at", 0);
      count.textContent = "Step 0 of 11";
      b11.setAttribute("aria-pressed", "true");
      b6.setAttribute("aria-pressed", "false");
      whenSeen(p, function () { set(11); });
    }
  };

  var make = toys[host.getAttribute("data-toy")];
  if (make) make();
})();
