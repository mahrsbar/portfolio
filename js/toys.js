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
  /* the same drawing as images/room/jars.svg */
  var JARS = '<ellipse cx="60" cy="113" rx="56" ry="3.500" fill="#1E1A17" stroke="none" opacity=".12"/><g class="ob-jar j2"><clipPath id="tj"><path d="M47 30 H75 V34 C80 36 80 40 80 46 V103 Q80 112 71 112 H51 Q42 112 42 103 V46 C42 40 42 36 47 34 Z"/></clipPath><path d="M47 30 H75 V34 C80 36 80 40 80 46 V103 Q80 112 71 112 H51 Q42 112 42 103 V46 C42 40 42 36 47 34 Z" fill="#EEF6FA" stroke="none"/><g clip-path="url(#tj)" stroke="none"><text x="61" y="106" text-anchor="middle" font-family="Shantell Sans, sans-serif" font-weight="800" font-size="25" fill="#6E7BF2">Aa</text><text x="61" y="78" text-anchor="middle" font-family="Shantell Sans, sans-serif" font-weight="800" font-size="17" fill="#8F9AFA">Aa</text><text x="61" y="58" text-anchor="middle" font-family="Shantell Sans, sans-serif" font-weight="800" font-size="11" fill="#A9B4F5">Aa</text></g><path d="M48 50 C47 60 47 92 49 100" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><path d="M47 30 H75 V34 C80 36 80 40 80 46 V103 Q80 112 71 112 H51 Q42 112 42 103 V46 C42 40 42 36 47 34 Z"/><rect x="44" y="20" width="34" height="11" rx="3" fill="#E8553D"/><path d="M48 22 v6 M53 22 v6 M58 22 v6 M63 22 v6 M68 22 v6" stroke-width="1.4" opacity=".35"/></g><g class="ob-jar j1" role="button" tabindex="0" aria-label="Colour tokens: change the theme"><clipPath id="cj"><path d="M11 54 H37 V58 C42 60 42 64 42 70 V103 Q42 112 33 112 H15 Q6 112 6 103 V70 C6 64 6 60 11 58 Z"/></clipPath><path d="M11 54 H37 V58 C42 60 42 64 42 70 V103 Q42 112 33 112 H15 Q6 112 6 103 V70 C6 64 6 60 11 58 Z" fill="#EEF6FA" stroke="none"/><g clip-path="url(#cj)" stroke="none"><path class="cl cl3" d="M4 70 C14 66 22 72 30 68 S40 69 44 67 V114 H4 Z" fill="#6E7BF2"/><path class="cl cl2" d="M4 81 C14 77 22 83 30 79 S40 80 44 78 V114 H4 Z" fill="#3FA899"/><path class="cl cl1" d="M4 92 C14 88 22 94 30 90 S40 91 44 89 V114 H4 Z" fill="#FFC93C"/><path class="cl cl0" d="M4 103 C14 99 22 105 30 101 S40 102 44 100 V114 H4 Z" fill="#E8553D"/></g><path d="M12 74 C11 84 11 92 13 100" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><path d="M11 54 H37 V58 C42 60 42 64 42 70 V103 Q42 112 33 112 H15 Q6 112 6 103 V70 C6 64 6 60 11 58 Z"/><rect x="8" y="44" width="32" height="11" rx="3" fill="#C98A4B"/><path d="M12 46 v6 M17 46 v6 M22 46 v6 M27 46 v6 M32 46 v6" stroke-width="1.4" opacity=".35"/></g><g class="ob-jar j3"><clipPath id="sj"><path d="M85 62 H109 V66 C114 68 114 72 114 78 V103 Q114 112 105 112 H89 Q80 112 80 103 V78 C80 72 80 68 85 66 Z"/></clipPath><path d="M85 62 H109 V66 C114 68 114 72 114 78 V103 Q114 112 105 112 H89 Q80 112 80 103 V78 C80 72 80 68 85 66 Z" fill="#EEF6FA" stroke="none"/><g clip-path="url(#sj)" stroke="none"><rect x="88.0" y="92" width="18" height="18" rx="1.5" fill="#F27A5E" stroke="#1E1A17" stroke-width="1.6"/><rect x="90.5" y="79" width="13" height="13" rx="1.5" fill="#F7A08A" stroke="#1E1A17" stroke-width="1.6"/><rect x="92.5" y="70" width="9" height="9" rx="1.5" fill="#F7C4B9" stroke="#1E1A17" stroke-width="1.6"/><rect x="94.0" y="64" width="6" height="6" rx="1.5" fill="#FCE0D8" stroke="#1E1A17" stroke-width="1.6"/></g><path d="M86 82 C85 92 85 92 87 100" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><path d="M85 62 H109 V66 C114 68 114 72 114 78 V103 Q114 112 105 112 H89 Q80 112 80 103 V78 C80 72 80 68 85 66 Z"/><rect x="82" y="52" width="30" height="11" rx="3" fill="#3FA899"/><path d="M86 54 v6 M91 54 v6 M96 54 v6 M101 54 v6" stroke-width="1.4" opacity=".35"/></g>';

  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  var OBJECTS = {
    /* Design system: three jars of tokens (colour, type, spacing). They hop when pointed at; the colour
       jar is a button: each tap turns its layers over and the wall takes the colour now on top. */
    theme: {
      label: "Token jars: colour, type and spacing. Tap the colour jar to change the theme",
      svg: '<svg viewBox="0 0 120 120"><g ' + INK + '>' + JARS + '</g></svg>',
      init: function (box) {
        var ORDER = ["#6E7BF2", "#3FA899", "#FFC93C", "#E8553D"];
        var WALLS = {
          "#6E7BF2": [["#D9D5F4", "#D0CBF0"], ["#201E3A", "#25223F"]],
          "#3FA899": [["#BFE4D3", "#B5DECB"], ["#1B2238", "#1F2740"]],
          "#FFC93C": [["#FAEFC4", "#F6E7B0"], ["#26231B", "#2C2820"]],
          "#E8553D": [["#F8D6CC", "#F4CCBF"], ["#2A1E24", "#30232A"]]
        };
        var jar = box.querySelector(".j1"), turned = false;
        function apply() {
          if (!turned) return;
          var w = WALLS[ORDER[0]][isDark() ? 1 : 0], b = document.body.style;
          b.setProperty("--wall", w[0]);
          b.setProperty("--wall-stripe", w[1]);
          b.setProperty("--wallpaper", "repeating-linear-gradient(90deg, transparent 0 26px, " + w[1] + " 26px 52px)");
        }
        function turn(e) {
          e.stopPropagation();
          ORDER.push(ORDER.shift());
          // the layers are drawn top first: .cl3 is the top band
          [3, 2, 1, 0].forEach(function (n, i) { jar.querySelector(".cl" + n).setAttribute("fill", ORDER[i]); });
          jar.classList.remove("shake"); void jar.getBoundingClientRect(); jar.classList.add("shake");
          turned = true;
          apply();
        }
        jar.addEventListener("click", turn);
        jar.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(e); } });
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

  /* each plays its move through once: on pointing, focus or a tap */
  function play() {
    box.classList.remove("play");
    void box.offsetWidth;
    box.classList.add("play");
  }
  box.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") play(); });
  box.addEventListener("focusin", play);
  box.addEventListener("click", play);
  box.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target === box) { e.preventDefault(); play(); } });
  if (still) { box.classList.add("done"); return; }
  /* touch screens have no hover: play it once when it comes into view */
  if ("IntersectionObserver" in window && !window.matchMedia("(hover: hover)").matches) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400); }
    }, { threshold: 0.6 });
    io.observe(box);
  }
})();
