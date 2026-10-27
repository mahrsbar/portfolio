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
    function update() { header.classList.toggle("scrolled", window.scrollY > 4); }
    window.addEventListener("scroll", update, { passive: true });
    update();
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
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

  document.addEventListener("DOMContentLoaded", function () {
    bindToggle();
    markNav();
    menu();
    navEdge();
    stackTables();
    reveal();
    copyEmail();
    year();
    readingTime();
    toc();
  });
})();
