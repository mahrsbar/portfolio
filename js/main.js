/* Small progressive-enhancement layer. The site works without it. */
(function () {
  var root = document.documentElement;
  var KEY = "mahrs-theme";

  /* ---- Theme: explicit choice wins, otherwise follow the system ---- */
  function applyStored() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored === "dark" || stored === "light") {
        root.setAttribute("data-theme", stored);
      }
    } catch (e) {
      /* storage unavailable: fall back to system preference */
    }
  }
  applyStored();

  function currentTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function bindToggle() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      btn.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " theme");
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ---- Mark the current nav link ---- */
  function markNav() {
    var path = location.pathname.replace(/index\.html$/, "");
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      var url = new URL(href, location.href);
      var target = url.pathname.replace(/index\.html$/, "");
      var isSection = a.dataset.section;
      if (target === path || (isSection && path.indexOf(isSection) !== -1)) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---- Phone menu ----
     The theme toggle moves out of the link list into its own group beside
     a menu button; on phones the CSS turns the link list into a dropdown. */
  function menu() {
    var header = document.querySelector("header.nav");
    var nav = header && header.querySelector("nav");
    var toggle = header && header.querySelector(".theme-toggle");
    if (!nav || !toggle) return;

    var tools = document.createElement("div");
    tools.className = "nav-tools";
    var li = toggle.closest("li");
    tools.appendChild(toggle);
    if (li) li.remove();

    var list = nav.querySelector(".nav-links");
    if (!list.id) list.id = "nav-links";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-menu-btn";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", list.id);
    btn.innerHTML =
      '<svg class="bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '<svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    tools.appendChild(btn);
    nav.parentNode.appendChild(tools);
    header.classList.add("has-menu");

    function setOpen(open) {
      header.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      setOpen(!header.classList.contains("open"));
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("open")) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* ---- Nav divider only once the page has scrolled ---- */
  function navEdge() {
    var header = document.querySelector("header.nav");
    if (!header) return;
    /* the bar keeps the wall's colour for as long as the wall is behind it */
    var wall = document.querySelector(".duck-room, .case-intro .intro-sum, .case-hero, .post-hero");
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 4);
      if (!wall) return;
      var floor = wall.classList.contains("duck-room") ? parseFloat(getComputedStyle(wall).getPropertyValue("--floor-h")) || 0 : 0;
      header.classList.toggle("on-wall", wall.getBoundingClientRect().bottom - floor > header.offsetHeight);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- The drawer ----
     The case files pile up as you scroll. Give every folder the height of the
     tallest, so the pile closes square with its tabs in one row. */
  function drawer() {
    var box = document.querySelector(".projects .case-drawer");
    if (!box) return;
    var files = box.querySelectorAll(".pcard-flagship");
    function measure() {
      box.style.removeProperty("--folder-h");
      var tallest = 0;
      files.forEach(function (f) { tallest = Math.max(tallest, f.offsetHeight); });
      box.style.setProperty("--folder-h", tallest + "px");
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ---- Tables that stack on phones ----
     Wide comparison tables become one card per row; each cell gets its
     column heading as a label. */
  function stackTables() {
    document.querySelectorAll("table.compare").forEach(function (table) {
      var heads = table.querySelectorAll("thead th");
      if (heads.length < 3) return;
      table.classList.add("stack-sm");
      table.querySelectorAll("tbody tr").forEach(function (tr) {
        Array.prototype.forEach.call(tr.children, function (cell, i) {
          if (heads[i]) cell.setAttribute("data-label", heads[i].textContent.trim());
        });
      });
    });
  }

  /* ---- The stroke under a heading: as wide as the line it sits under ----
     A heading that wraps would otherwise get a stroke as wide as the column. */
  function headingStroke() {
    var heads = document.querySelectorAll(".prose h2, .section-head h2");
    if (!heads.length || !document.createRange) return;
    function measure() {
      heads.forEach(function (h) {
        var range = document.createRange();
        range.selectNodeContents(h);
        var rects = range.getClientRects();
        if (!rects.length) return;
        var bottom = rects[rects.length - 1].bottom;
        var left = h.getBoundingClientRect().left;
        var right = left;
        Array.prototype.forEach.call(rects, function (r) {
          if (Math.abs(r.bottom - bottom) < 4) right = Math.max(right, r.right);
        });
        h.style.setProperty("--stroke-w", Math.ceil(right - left) + "px");
      });
    }
    measure();
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ---- Reveal on scroll ---- */
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---- Copy email ---- */
  function copyEmail() {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-copy");
        var label = btn.querySelector("span");
        var original = label ? label.textContent : "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () {
            if (label) label.textContent = "Copied";
            setTimeout(function () {
              if (label) label.textContent = original;
            }, 1600);
          });
        } else {
          location.href = "mailto:" + value;
        }
      });
    });
  }

  /* ---- Footer year ---- */
  function year() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---- Reading time on long pages ---- */
  function readingTime() {
    var prose = document.querySelector(".prose");
    var eyebrow = document.querySelector(".case-hero .eyebrow, .post-hero .eyebrow");
    if (!prose || !eyebrow || eyebrow.hasAttribute("data-no-read-time")) return;
    /* Count only what a reader sees by default: collapsed <details>
       documents are optional reading and would triple the estimate. */
    var clone = prose.cloneNode(true);
    clone.querySelectorAll("details").forEach(function (d) { d.remove(); });
    var words = clone.textContent.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 220));
    var span = document.createElement("span");
    span.textContent = " · " + minutes + " min read";
    eyebrow.appendChild(span);
  }

  /* ---- On-this-page navigation for case studies ----
     Built from the h2s inside .prose. Gives long pages a second
     way in, and shows the reader how much is left. */
  function toc() {
    var prose = document.querySelector(".case-body .prose");
    if (!prose) return;
    var heads = prose.querySelectorAll("h2");
    if (heads.length < 3) return;

    var nav = document.createElement("nav");
    nav.className = "toc";
    nav.setAttribute("aria-label", "On this page");
    var k = document.createElement("div");
    k.className = "k";
    k.textContent = "On this page";
    nav.appendChild(k);
    var ol = document.createElement("ol");
    var links = [];

    heads.forEach(function (h, i) {
      if (!h.id) {
        h.id =
          "s-" +
          h.textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .slice(0, 40);
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ol.appendChild(li);
      links.push(a);
    });

    nav.appendChild(ol);
    prose.parentNode.classList.add("has-toc");
    prose.parentNode.appendChild(nav);

    if (!("IntersectionObserver" in window)) return;
    var current = null;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(heads, entry.target);
            if (current) current.classList.remove("on");
            current = links[idx];
            current.classList.add("on");
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    heads.forEach(function (h) {
      io.observe(h);
    });
  }

  /* ---- Section links: jump, then drop the #hash so a refresh starts where you are, not at the section.
          On load, land on the target ourselves: the browser's own jump can be lost while images and demos lay out. ---- */
  function clearHash() {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  function landOnHash() {
    var id = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
    var target = id && document.getElementById(id);
    if (target) {
      target.scrollIntoView();
      setTimeout(function () {
        if (Math.abs(target.getBoundingClientRect().top - 90) > 40) target.scrollIntoView();
      }, 600);
    }
    clearHash();
  }
  window.addEventListener("hashchange", clearHash);
  window.addEventListener("load", landOnHash);

  document.addEventListener("DOMContentLoaded", function () {
    bindToggle();
    markNav();
    menu();
    navEdge();
    drawer();
    stackTables();
    headingStroke();
    reveal();
    copyEmail();
    year();
    readingTime();
    toc();
  });
})();
