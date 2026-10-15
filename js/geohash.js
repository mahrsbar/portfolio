/* Interactive geohash explorer.
   A geohash is a short string that names a rectangle on the globe. Each
   extra character divides the current rectangle into 32 smaller ones, so
   the length of the string is its precision. This widget lets you click
   into cells, type a hash, and watch the map and the string stay in sync,
   which is the interaction rule the real feature was built on. */
(function () {
  var root = document.querySelector("[data-geohash]");
  if (!root) return;

  var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  // Standard subdivision layouts, top row first.
  var EVEN = ["bcfguvyz", "89destwx", "2367kmqr", "0145hjnp"]; // 8 wide × 4 tall
  var ODD = ["prxz", "nqwy", "jmtv", "hksu", "57eg", "46df", "139c", "028b"]; // 4 wide × 8 tall
  // Approximate cell size by precision (width × height).
  var SIZES = [
    "5,000 km × 5,000 km", "1,250 km × 625 km", "156 km × 156 km", "39 km × 19.5 km",
    "4.9 km × 4.9 km", "1.2 km × 0.61 km", "153 m × 153 m", "38 m × 19 m",
    "4.8 m × 4.8 m", "1.2 m × 0.6 m"
  ];
  var START = root.getAttribute("data-start") || "c2b2";
  var MIN = 4, MAX = 10;

  var hash = START;
  var svg = root.querySelector("svg");
  var input = root.querySelector("input");
  var readout = root.querySelector("[data-readout]");
  var crumbs = root.querySelector("[data-crumbs]");
  var back = root.querySelector("[data-back]");
  var reset = root.querySelector("[data-reset]");
  var W = 640, H = 400;

  // Deterministic pseudo-noise so the "map" has streets and a river that
  // look different at every level, without any real geography.
  function seed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      return ((h >>> 0) % 10000) / 10000;
    };
  }

  function el(name, attrs, text) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var level = hash.length;           // characters so far
    var even = level % 2 === 0;        // next split: even level → 8×4
    var rows = even ? EVEN : ODD;
    var cols = rows[0].length;
    var cw = W / cols, ch = H / rows.length;
    var rnd = seed(hash);

    // background "terrain"
    svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, rx: 12, class: "gh-land" }));
    // a river-ish path
    var d = "M0 " + (H * (0.2 + rnd() * 0.6));
    for (var x = 80; x <= W; x += 80) d += " Q" + (x - 40) + " " + (H * rnd()) + " " + x + " " + (H * (0.2 + rnd() * 0.6));
    svg.appendChild(el("path", { d: d, class: "gh-river" }));
    // streets
    for (var i = 0; i < 9; i++) {
      var sx = rnd() * W, sy = rnd() * H;
      svg.appendChild(el("line", { x1: sx, y1: 0, x2: sx + (rnd() - 0.5) * 120, y2: H, class: "gh-street" }));
      svg.appendChild(el("line", { x1: 0, y1: sy, x2: W, y2: sy + (rnd() - 0.5) * 80, class: "gh-street" }));
    }
    // a few transaction pins, only visible at finer precision
    if (level >= 6) {
      for (var p = 0; p < 3 + Math.floor(rnd() * 4); p++) {
        svg.appendChild(el("circle", { cx: rnd() * W, cy: rnd() * H, r: 6, class: "gh-pin" }));
      }
    }

    // sub-cells
    var g = el("g", { class: "gh-cells" });
    rows.forEach(function (row, r) {
      row.split("").forEach(function (c, col) {
        var cell = el("g", { class: "gh-cell", tabindex: level < MAX ? "0" : "-1", role: "button",
          "aria-label": "Refine to " + hash + c });
        cell.appendChild(el("rect", { x: col * cw, y: r * ch, width: cw, height: ch }));
        cell.appendChild(el("text", { x: col * cw + cw / 2, y: r * ch + ch / 2 + 5, "text-anchor": "middle" }, hash + c));
        if (level < MAX) {
          cell.addEventListener("click", function () { go(hash + c); });
          cell.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(hash + c); }
          });
        }
        g.appendChild(cell);
      });
    });
    svg.appendChild(g);

    // frame label
    svg.appendChild(el("rect", { x: 1, y: 1, width: W - 2, height: H - 2, rx: 12, class: "gh-frame" }));

    // UI
    input.value = hash;
    readout.textContent = "Precision " + level + " · this cell ≈ " + SIZES[level - 1] + " · click a sub-cell to add a character";
    crumbs.innerHTML = "";
    hash.split("").forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gh-crumb" + (i === hash.length - 1 ? " on" : "");
      b.textContent = c;
      b.title = "Back to precision " + (i + 1);
      b.addEventListener("click", function () { go(hash.slice(0, i + 1)); });
      crumbs.appendChild(b);
    });
    back.disabled = level <= MIN;
    if (level >= MAX) readout.textContent = "Precision " + level + " · ≈ " + SIZES[level - 1] + " · that's as fine as the feature goes";
  }

  function go(next) {
    next = next.toLowerCase().split("").filter(function (c) { return BASE32.indexOf(c) !== -1; }).join("");
    if (next.length < MIN) next = (next + START).slice(0, MIN);
    if (next.length > MAX) next = next.slice(0, MAX);
    hash = next;
    root.classList.remove("zoom");
    void root.offsetWidth;
    root.classList.add("zoom");
    render();
  }

  input.addEventListener("input", function () { go(input.value); });
  back.addEventListener("click", function () { go(hash.slice(0, -1)); });
  reset.addEventListener("click", function () { go(START); });
  render();
})();
