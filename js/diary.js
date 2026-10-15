/* The worklog, as a book you turn.

   Every page is in the DOM from the start and the whole thing works as a
   plain list with scripting off — the turning is a layer on top, not the
   way the content is delivered. There is a "read it flat" switch for
   anyone who would rather scroll, and reduced-motion swaps the flip for
   a cross-fade. */
(function () {
  "use strict";

  var book = document.querySelector("[data-diary]");
  if (!book) return;

  var pages = [].slice.call(book.querySelectorAll(".dpage"));
  if (pages.length < 2) return;

  var stack = book.querySelector(".dbook");
  var live = book.querySelector("[data-live]");
  var counter = book.querySelector("[data-count]");
  var prev = book.querySelector("[data-prev]");
  var next = book.querySelector("[data-next]");
  var flatBtn = book.querySelector("[data-flat]");
  var at = 0;
  var flat = false;

  /* Stacking: unturned pages sit in reading order, turned pages pile up
     on the left the way a real book does. */
  pages.forEach(function (p, i) {
    p.style.setProperty("--i", i);
    p.setAttribute("tabindex", "-1");
  });

  function paint() {
    pages.forEach(function (p, i) {
      var turned = i < at;
      p.classList.toggle("is-turned", turned);
      p.classList.toggle("is-current", i === at);
      p.setAttribute("aria-hidden", i === at ? "false" : "true");
      p.style.zIndex = turned ? i : pages.length - i;
    });
    counter.textContent = at + 1 + " / " + pages.length;
    prev.disabled = at === 0;
    next.disabled = at === pages.length - 1;
    var t = pages[at].getAttribute("data-label") || "Page " + (at + 1);
    live.textContent = t;
  }

  function go(n) {
    var to = Math.max(0, Math.min(pages.length - 1, n));
    if (to === at) return;
    at = to;
    paint();
    pages[at].focus({ preventScroll: true });
  }

  prev.addEventListener("click", function () { go(at - 1); });
  next.addEventListener("click", function () { go(at + 1); });

  /* Turning by clicking the outer third of the page, like a real book. */
  stack.addEventListener("click", function (e) {
    if (flat) return;
    if (e.target.closest("a, button, summary, details")) return;
    var r = stack.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    if (x > 0.72) go(at + 1);
    else if (x < 0.28) go(at - 1);
  });

  book.addEventListener("keydown", function (e) {
    if (flat) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(at - 1); }
  });

  /* Swipe, for phones. */
  var x0 = null;
  stack.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener("touchend", function (e) {
    if (x0 === null || flat) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) go(at + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  flatBtn.addEventListener("click", function () {
    flat = !flat;
    book.classList.toggle("is-flat", flat);
    flatBtn.textContent = flat ? "Read it as a book" : "Read it flat";
    flatBtn.setAttribute("aria-pressed", String(flat));
    if (flat) {
      pages.forEach(function (p) {
        p.removeAttribute("aria-hidden");
        p.style.zIndex = "";
      });
      live.textContent = "Showing all " + pages.length + " entries in order.";
      stack.style.removeProperty("--dbook-h");
    } else {
      measure();
      paint();
    }
  });

  /* The book is as tall as its tallest page. Measured after fonts land,
     and again on resize, because a reflow changes which page is tallest. */
  function measure() {
    if (flat) { book.style.removeProperty("--dbook-h"); return; }
    var tallest = 0;
    stack.style.setProperty("--dbook-h", "auto");
    pages.forEach(function (p) {
      var was = p.style.cssText;
      p.style.cssText = was + ";position:static;transform:none;height:auto;";
      tallest = Math.max(tallest, p.scrollHeight);
      p.style.cssText = was;
    });
    stack.style.setProperty("--dbook-h", Math.max(560, tallest + 6) + "px");
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(measure, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  measure();
  paint();
})();
