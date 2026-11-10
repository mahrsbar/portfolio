/* The object each case file is filed under, standing on the floor of its header. Point at it
   (or tap it, or on a phone just scroll to it) and it does that project's one move.
   Built from inline SVG inside a span, so it can sit in the summary paragraph that carries the wall. */
(function () {
  "use strict";
  var host = document.querySelector(".case-intro[data-toy]");
  if (!host) return;
  var wall = host.querySelector(".intro-sum");
  if (!wall) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var INK = 'fill="none" stroke="#1E1A17" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /* chip: one paint swatch, drawn upright; CSS turns it about the rivet */
  function chip(a, c1, c2, c3, name) {
    return '<g class="ob-chip" style="--a:' + a + 'deg" role="button" tabindex="0" aria-label="' + name + ' theme">' +
      '<rect x="19" y="20" width="22" height="90" rx="4" fill="#FFFDF6"/>' +
      '<path d="M19 20 h22 v24 h-22 Z" fill="' + c1 + '" stroke="none"/><path d="M19 44 h22 v22 h-22 Z" fill="' + c2 + '" stroke="none"/><path d="M19 66 h22 v18 h-22 Z" fill="' + c3 + '" stroke="none"/>' +
      '<rect x="19" y="20" width="22" height="90" rx="4"/><path d="M24 94 h12 M24 100 h8" stroke-width="2"/></g>';
  }

  var OBJECTS = {
    /* Design system: the fan opens; a swatch re-themes the wall from one set of tokens */
    theme: {
      label: "Swatch fan: pick a colour to re-theme this header",
      svg: '<svg viewBox="0 0 120 120"><g ' + INK + '>' +
        chip(-10, "#BFE4D3", "#3FA899", "#2F8F83", "Mint") +
        chip(12, "#FFE08A", "#FFC93C", "#F0A91B", "Butter") +
        chip(34, "#F7C4B9", "#F27A5E", "#E8553D", "Coral") +
        chip(56, "#D4D8FF", "#8F9AFA", "#6E7BF2", "Violet") +
        '<circle cx="30" cy="104" r="5" fill="#C98A4B"/></g></svg>',
      hover: true,
      init: function (box) {
        var WALLS = {
          Mint: [["#BFE4D3", "#B5DECB"], ["#1B2238", "#1F2740"]],
          Butter: [["#FAEFC4", "#F6E7B0"], ["#26231B", "#2C2820"]],
          Coral: [["#F8D6CC", "#F4CCBF"], ["#2A1E24", "#30232A"]],
          Violet: [["#D9D5F4", "#D0CBF0"], ["#201E3A", "#25223F"]]
        };
        var picked = null;
        function apply() {
          if (!picked) return;
          var w = WALLS[picked][isDark() ? 1 : 0], b = document.body.style;
          b.setProperty("--wall", w[0]);
          b.setProperty("--wall-stripe", w[1]);
          b.setProperty("--wallpaper", "repeating-linear-gradient(90deg, transparent 0 26px, " + w[1] + " 26px 52px)");
        }
        box.querySelectorAll(".ob-chip").forEach(function (c) {
          function pick(e) {
            e.stopPropagation();
            picked = c.getAttribute("aria-label").split(" ")[0];
            box.querySelectorAll(".ob-chip").forEach(function (x) { x.classList.toggle("on", x === c); });
            box.classList.add("open");
            apply();
          }
          c.addEventListener("click", pick);
          c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } });
        });
        new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      }
    },

    /* Ask bar: the magnifier slides over the map and a pin drops where the answer is */
    ask: {
      label: "Map and magnifier: find the place on the map",
      svg: '<svg viewBox="0 0 120 120"><g ' + INK + '>' +
        '<path d="M8 50 L38 44 V108 L8 114 Z" fill="#FFFDF6"/><path d="M38 44 L68 52 V114 L38 108 Z" fill="#E9F1F7"/><path d="M68 52 L98 44 V108 L68 114 Z" fill="#FFFDF6"/>' +
        '<path d="M12 70 C20 62 30 66 34 58 L38 60 V84 C30 90 22 82 12 88 Z" fill="#8CC79C" stroke-width="2"/><path d="M68 74 C76 70 82 78 94 70 V92 C84 96 76 90 68 96 Z" fill="#8CC79C" stroke-width="2"/>' +
        '<path d="M16 100 C30 96 42 84 54 90 S80 84 90 62" stroke="#E8553D" stroke-width="2" stroke-dasharray="4 5"/>' +
        '<g class="ob-pin"><path d="M62 74 C54 64 52 60 52 56 a10 10 0 0 1 20 0 c0 4 -2 8 -10 18 Z" fill="#E8553D" stroke-width="2.600"/><circle cx="62" cy="56" r="3.500" fill="#FFFFFF" stroke-width="2"/></g>' +
        '<g class="ob-glass"><circle cx="62" cy="62" r="23" fill="#FFFFFF" fill-opacity=".45"/><path d="M50 52 q4 -6 10 -7" stroke="#FFFFFF" stroke-width="3"/>' +
        '<circle cx="62" cy="62" r="23" stroke-width="5"/><path d="M79 79 L104 104" stroke-width="12"/><path d="M80 80 L103 103" stroke="#C98A4B" stroke-width="6"/></g>' +
        '</g></svg>'
    },

    /* Unified user page: the Rolodex flips through the tools and stops on one person's card */
    tabs: {
      label: "Rolodex: flip to the one card for this user",
      svg: '<svg viewBox="0 0 120 120"><g ' + INK + '>' +
        '<path d="M14 112 L22 80 H30 L28 104 Z M106 112 L98 80 H90 L92 104 Z" fill="#3B2F5C"/>' +
        '<g transform="rotate(-16 60 92)"><rect x="32" y="42" width="56" height="40" rx="4" fill="#F4B6C2"/></g>' +
        '<g transform="rotate(14 60 92)"><rect x="32" y="42" width="56" height="40" rx="4" fill="#FFE08A"/></g>' +
        '<g class="ob-person"><rect x="30" y="46" width="60" height="42" rx="4" fill="#FFFDF6"/>' +
        '<circle cx="44" cy="62" r="7" fill="#6E7BF2" stroke-width="2.400"/><path d="M35 79 c2 -7 16 -7 18 0" fill="#6E7BF2" stroke-width="2.400"/>' +
        '<path d="M60 58 h22 M60 66 h16 M60 74 h20" stroke-width="2.400"/></g>' +
        ['#D9E6F2', '#FFE08A', '#F4B6C2', '#FFFDF6'].map(function (c, i) {
          return '<g class="ob-flip" style="--i:' + (3 - i) + '"><rect x="30" y="46" width="60" height="42" rx="4" fill="' + c + '"/><path d="M40 60 h40 M40 68 h28 M40 76 h34" stroke-width="2.200" opacity=".35"/></g>';
        }).join("") +
        '<path d="M52 88 v6 M68 88 v6" stroke-width="2.400"/>' +
        '<path d="M18 92 H102" stroke-width="3.400"/><circle cx="16" cy="92" r="7" fill="#E8553D"/><circle cx="104" cy="92" r="7" fill="#E8553D"/>' +
        '<rect x="10" y="106" width="100" height="9" rx="4.500" fill="#3B2F5C"/></g></svg>'
    },

    /* Licensing: the stamp comes down and leaves "6 steps" where there used to be eleven */
    stairs: {
      label: "Rubber stamp: approve the application",
      svg: '<svg viewBox="0 0 120 120"><g ' + INK + '>' +
        '<path d="M4 114 L22 90 H104 L116 114 Z" fill="#FFFDF6"/>' +
        '<path d="M14 109 L20 100 H44 M14 104 H38" stroke="#9AA3B5" stroke-width="2" opacity=".7"/>' +
        '<g class="ob-mark"><path d="M46 110 L52 98 H90 L86 110 Z" stroke="#E8553D" stroke-width="2.600"/>' +
        '<text x="68" y="107.500" text-anchor="middle" fill="#E8553D" stroke="none" font-family="Shantell Sans, sans-serif" font-weight="800" font-size="8.500">6 STEPS</text></g>' +
        '<g class="ob-stamp"><path d="M72 76 C72 60 79 56 78 42 H90 C89 56 96 60 96 76 Z" fill="#C98A4B"/><circle cx="84" cy="32" r="15" fill="#C98A4B"/><path d="M76 26 C78 22 82 20 86 20" stroke="#E9B27A" stroke-width="2.600"/>' +
        '<rect x="60" y="74" width="48" height="16" rx="5" fill="#E8553D"/></g>' +
        '</g></svg>'
    }
  };

  var kind = host.getAttribute("data-toy");
  var o = OBJECTS[kind];
  if (!o) return;
  var box = document.createElement("span");
  box.className = "obj obj-" + kind;
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", o.label);
  if (kind !== "theme") box.tabIndex = 0;
  box.innerHTML = o.svg;
  wall.appendChild(box);
  if (o.init) o.init(box);

  /* the fan opens while pointed at; the others play their move through once */
  function play() {
    if (o.hover) return box.classList.add("open");
    box.classList.remove("play");
    void box.offsetWidth;
    box.classList.add("play");
  }
  box.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") play(); });
  box.addEventListener("pointerleave", function () { if (o.hover && !box.querySelector(".ob-chip.on")) box.classList.remove("open"); });
  box.addEventListener("focusin", play);
  box.addEventListener("click", play);
  box.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target === box) { e.preventDefault(); play(); } });
  if (still) { box.classList.add(o.hover ? "open" : "done"); return; }
  /* touch screens have no hover: play it once when it comes into view */
  if ("IntersectionObserver" in window && !window.matchMedia("(hover: hover)").matches) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400); }
    }, { threshold: 0.6 });
    io.observe(box);
  }
})();
