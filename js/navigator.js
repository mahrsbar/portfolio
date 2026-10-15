/* The ask bar that navigates.

   The AI demo hub case study argues that an ask bar should turn a question
   into filters and a destination, never into prose. This is that pattern
   applied to this site, so the argument is demonstrable on the page making it.

   No model, no backend, no key. A small rule set plays the model's part:
   the query becomes facets (topic, kind, artefact), the facets rank a
   hand-authored index, and the result is somewhere to go. Nothing is
   generated, so nothing can be fabricated. Built entirely in JS so that
   with scripting off there is no dead input on the page — the site's own
   navigation and the work grid are already complete without it. */
(function () {
  "use strict";

  /* ---------- where things are -------------------------------------- */
  /* Root-relative URLs, resolved against the current page's depth. */
  var INDEX = [
    { t: "A design system for four products", u: "work/design-system.html", k: "case study", y: "2025–26",
      b: "Governance, four Figma plugins, and an agent governed by a rules file.",
      g: ["design system","tokens","figma","plugin","agent","ai","rules","mui","storybook","react","component library","governance","automation","typescript"] },
    { t: "What the agent got wrong", u: "work/design-system.html#when-wrong", k: "section", y: "",
      b: "Six failure modes, how each got through, and the control that now catches it.",
      g: ["wrong","mistake","mistakes","failure","failed","bug","bugs","broke","broken","error","fail","agent","ai","honest","learn","postmortem","incident"] },
    { t: "The rules file, published in full", u: "work/design-system.html#sources", k: "primary source", y: "",
      b: "The eleven-phase workflow that governs the coding agent, sanitised but unedited.",
      g: ["rules","rules file","prompt","prompts","source","sources","document","artefact","artifact","cursor","workflow","agent","ai","mdc"] },
    { t: "The scripted pipeline that failed", u: "work/design-system.html#pipeline-1", k: "section", y: "",
      b: "Sixteen components scaffolded in one run. None of them worked.",
      g: ["scripts","script","pipeline","mapping","failed","failure","wrong","automation","codegen"] },
    { t: "A fraud-investigation demo with an AI agent", u: "work/ai-demo-hub.html", k: "case study", y: "2026",
      b: "The ask bar never answers, it navigates. The agent reaches real data only when unlocked.",
      g: ["ai","agent","llm","demo","fraud","investigation","ask bar","mcp","cloudflare","workers","full stack","react","safety","opus","claude"] },
    { t: "OneComply: task manager, forms, application flow", u: "work/onecomply.html", k: "case study", y: "2023–25",
      b: "Two years as the UX voice and a front-end hand on a licensing-compliance platform.",
      g: ["product design","ux","forms","form","tables","table","flow","compliance","licensing","figma","react","onecomply","enterprise"] },
    { t: "This site, built without a framework", u: "work/this-site.html", k: "case study", y: "2026",
      b: "No framework, no dependencies. Tokens, themes, and an interactive geohash explainer.",
      g: ["site","portfolio","css","html","vanilla","javascript","no framework","tokens","theme","dark mode","github pages","code","front end"] },
    { t: "Why admins kept filing tickets against a self-serve console", u: "work/self-serve-access.html", k: "case study", y: "",
      b: "Session replays, support history, a shadow week, a revamp.",
      g: ["research","user research","replays","session replay","logrocket","interviews","support","tickets","discovery","admin","permissions"] },
    { t: "Four tools into one page for fraud analysts", u: "work/unified-user-page.html", k: "case study", y: "",
      b: "Journey mapping to a shipped, time-anchored view.",
      g: ["research","journey map","product design","fraud","analyst","consolidation","information architecture","ia"] },
    { t: "A map that stopped lying about \"no results\"", u: "work/geospatial-search.html", k: "case study", y: "",
      b: "Geohash search, then a replay audit with an interactive explainer.",
      g: ["map","maps","geospatial","geohash","search","interaction","visualisation","visualization","explainer"] },
    { t: "Figma Export SB", u: "work/figma-export-sb.html", k: "deep dive", y: "",
      b: "The export plugin that turns a Figma library into a contract a model can read.",
      g: ["plugin","figma","export","json","tokens","contract","mcp","deep dive","typescript","worklog","diary"] },
    { t: "Figma to Code", u: "work/figma-to-code.html", k: "deep dive", y: "",
      b: "Handoff bundles for an agent, instead of generated code.",
      g: ["plugin","figma","handoff","code","agent","ai","deep dive","spec"] },
    { t: "Tokenization and Variable Relinker", u: "work/tokenization-plugin.html", k: "deep dive", y: "",
      b: "Cleaning the design system at the source. One run relinked 1,516 properties.",
      g: ["plugin","figma","tokens","variables","relink","cleanup","design system","deep dive"] },
    { t: "Scripts vs. agent, side by side", u: "work/design-system-pipeline.html", k: "deep dive", y: "",
      b: "Which model wrote what, taken from git co-author trailers.",
      g: ["agent","ai","scripts","comparison","models","claude","git","deep dive","pipeline"] },
    // Writing hidden for now:
    // { t: "Writing", u: "writing/index.html", k: "page", y: "",
    // b: "Notes from the pipeline.",
    // g: ["writing","posts","blog","essays","notes","articles"] },
    { t: "About", u: "about.html", k: "page", y: "",
      b: "Psychology, then computer science, then building the fix.",
      g: ["about","who","bio","background","psychology","psych","education","story","you","yourself"] },
    { t: "Résumé (PDF)", u: "images/Mahrs_Aslam_Resume.pdf", k: "file", y: "",
      b: "One page.",
      g: ["resume","résumé","cv","hire","hiring","experience","work history","pdf","download"] },
    { t: "Contact", u: "index.html#contact", k: "section", y: "",
      b: "Email, GitHub, LinkedIn.",
      g: ["contact","email","reach","hire","talk","connect","linkedin","github","message"] },
    { t: "Earlier work, 2018–22", u: "remnant.html", k: "page", y: "2018–22",
      b: "Remnant Labs, ProgramEquity, and university projects.",
      g: ["early","earlier","old","student","university","2018","2019","2020","2021","2022","past","junior"] }
  ];

  /* Facets the rules can infer. Each is a bag of trigger words plus the
     tag it contributes to ranking. Order matters only for display. */
  var FACETS = [
    { k: "topic", v: "ai + agents",      tag: "ai",            w: /\b(ai|agent|agents|agentic|llm|model|models|claude|gpt|mcp|prompt|prompts|automation)\b/ },
    { k: "topic", v: "design systems",   tag: "design system", w: /\b(design system|design systems|token|tokens|component library|library|storybook|mui|variant|variants)\b/ },
    { k: "topic", v: "figma tooling",    tag: "figma",         w: /\b(figma|plugin|plugins|export|handoff)\b/ },
    { k: "topic", v: "research",         tag: "research",      w: /\b(research|interview|interviews|usability|replay|replays|discovery|study|users)\b/ },
    { k: "topic", v: "engineering",      tag: "code",          w: /\b(code|coding|engineer|engineering|react|typescript|css|html|javascript|front.?end|build|ship|shipped)\b/ },
    { k: "looking for", v: "failures",   tag: "wrong",         w: /\b(wrong|mistake|mistakes|fail|failed|failure|failures|bug|bugs|broke|broken|worst|hard|difficult|struggle)\b/ },
    { k: "looking for", v: "primary sources", tag: "source",   w: /\b(source|sources|artefact|artifact|document|documents|rules file|raw|receipt|receipts|proof|evidence)\b/ },
    { k: "kind", v: "case study",        tag: "__k:case study", w: /\b(case study|case studies|project|projects|work)\b/ },
    { k: "kind", v: "deep dive",         tag: "__k:deep dive",  w: /\b(deep dive|deep dives|detail|details|technical|internals)\b/ },
    { k: "kind", v: "writing",           tag: "writing",       w: /\b(writing|write|wrote|blog|post|posts|essay|essays|article|articles)\b/ },
    { k: "intent", v: "hiring",          tag: "resume",        w: /\b(resume|résumé|cv|hire|hiring|hire you|available|contact|email|reach)\b/ },
    { k: "intent", v: "who you are",     tag: "about",         w: /\b(about|who are you|who is|bio|background|psychology|psych|degree|education)\b/ }
  ];

  var STARTERS = [
    "what did you get wrong?",
    "design system work",
    "show me the AI agent stuff",
    "research projects",
    "can I read the rules file?",
    "resume"
  ];

  /* ---------- path resolution --------------------------------------- */
  function prefix() {
    var p = location.pathname;
    return /\/(work|writing)\//.test(p) ? "../" : "";
  }
  function resolve(u) {
    /* index.html#contact from inside /work/ must climb out first. */
    return prefix() + u;
  }

  /* ---------- the rules --------------------------------------------- */
  function interpret(q) {
    var s = " " + q.toLowerCase().trim() + " ";
    var facets = [], tags = [];

    FACETS.forEach(function (f) {
      if (f.w.test(s)) {
        if (!facets.some(function (x) { return x.k === f.k && x.v === f.v; })) facets.push({ k: f.k, v: f.v });
        tags.push(f.tag);
      }
    });

    /* Free-text terms still count, so a query the facets miss can match
       an index entry's own words rather than falling through to nothing. */
    var terms = s.split(/[^a-z0-9é]+/).filter(function (w) {
      return w.length > 2 && !/^(the|and|you|your|for|with|show|find|про|what|how|why|did|does|any|all|got|are|was|were|can|from|about|that|this|have|has|out|see|its|it's|me)$/.test(w);
    });

    var scored = INDEX.map(function (e) {
      var score = 0;
      tags.forEach(function (t) {
        if (t.indexOf("__k:") === 0) { if (e.k === t.slice(4)) score += 6; return; }
        if (e.g.indexOf(t) > -1) score += 10;
      });
      terms.forEach(function (w) {
        if (e.g.some(function (g) { return g === w || g.indexOf(w) === 0; })) score += 5;
        else if (e.t.toLowerCase().indexOf(w) > -1) score += 4;
        else if (e.b.toLowerCase().indexOf(w) > -1) score += 2;
      });
      /* Sections and sources only surface when something actually asked
         for them — they should never outrank a case study by accident. */
      if ((e.k === "section" || e.k === "primary source") && score < 8) score = 0;
      return { e: e, score: score };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    return { facets: facets, results: scored.map(function (r) { return r.e; }), inferred: facets.length > 0 || scored.length > 0 };
  }

  /* ---------- UI ----------------------------------------------------- */
  var el = {}, open = false, active = 0, current = [];

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "nask";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="nask-scrim" data-close></div>' +
      '<div class="nask-panel" role="dialog" aria-modal="true" aria-label="Search this site">' +
        '<form class="nask-bar" autocomplete="off">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input type="text" placeholder="Search — a topic, a project, a mistake…" aria-label="Search this site" />' +
          '<kbd>esc</kbd>' +
        '</form>' +
        '<div class="nask-starters" data-starters></div>' +
        '<div class="nask-read" data-facets hidden>' +
          '<span class="nask-read-k">Read as</span>' +
          '<div class="nask-chips" data-chips></div>' +
        '</div>' +
        '<ul class="nask-results" data-results role="listbox" aria-label="Destinations"></ul>' +
        '<p class="nask-empty" data-empty hidden></p>' +
        '<div class="nask-foot">' +
          '<span><b>This bar doesn\'t answer. It navigates.</b> No model, no generated text — your words become filters and a destination.</span>' +
          '<a data-why>Why I build them this way →</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    el.wrap = wrap;
    el.input = wrap.querySelector("input");
    el.form = wrap.querySelector("form");
    el.chips = wrap.querySelector("[data-chips]");
    el.facets = wrap.querySelector("[data-facets]");
    el.results = wrap.querySelector("[data-results]");
    el.empty = wrap.querySelector("[data-empty]");
    el.starters = wrap.querySelector("[data-starters]");
    wrap.querySelector("[data-why]").href = resolve("work/ai-demo-hub.html");

    STARTERS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", function () { el.input.value = s; run(); el.input.focus(); });
      el.starters.appendChild(b);
    });

    wrap.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
    el.form.addEventListener("submit", function (e) { e.preventDefault(); go(active); });
    el.input.addEventListener("input", run);
    el.input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    });
  }

  function render(r, q) {
    el.chips.innerHTML = "";
    r.facets.forEach(function (f, i) {
      var c = document.createElement("span");
      c.className = "nask-chip";
      c.style.animationDelay = i * 70 + "ms";
      c.innerHTML = "<small>" + f.k + "</small>" + f.v;
      el.chips.appendChild(c);
    });
    el.facets.hidden = r.facets.length === 0;
    el.starters.hidden = q.length > 0;

    el.results.innerHTML = "";
    current = r.results.slice(0, 6);
    active = 0;

    current.forEach(function (e, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.className = "nask-res" + (i === 0 ? " on" : "");
      li.innerHTML =
        '<a href="' + resolve(e.u) + '">' +
          '<span class="nask-res-k">' + e.k + (e.y ? " · " + e.y : "") + "</span>" +
          "<b>" + e.t + "</b>" +
          "<span>" + e.b + "</span>" +
        "</a>";
      li.addEventListener("mouseenter", function () { setActive(i); });
      el.results.appendChild(li);
    });

    if (!q) {
      el.empty.hidden = true;
    } else if (!current.length) {
      el.empty.hidden = false;
      el.empty.textContent = "Nothing on this site matches that, so nothing is guessed. Try a topic — design systems, AI agents, research — or press ⌘K again to browse.";
    } else {
      el.empty.hidden = true;
    }
  }

  function setActive(i) {
    var items = el.results.children;
    if (!items.length) return;
    if (items[active]) items[active].classList.remove("on");
    active = (i + items.length) % items.length;
    items[active].classList.add("on");
    items[active].scrollIntoView({ block: "nearest" });
  }
  function move(d) { setActive(active + d); }

  function go(i) {
    var e = current[i];
    if (!e) return;
    close();
    location.href = resolve(e.u);
  }

  function run() {
    var q = el.input.value.trim();
    render(q ? interpret(q) : { facets: [], results: [], inferred: false }, q);
  }

  function show() {
    if (open) return;
    open = true;
    el.wrap.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { el.wrap.classList.add("in"); el.input.focus(); });
    run();
  }
  function close() {
    if (!open) return;
    open = false;
    el.wrap.classList.remove("in");
    document.body.style.overflow = "";
    setTimeout(function () { if (!open) el.wrap.hidden = true; }, 180);
  }

  /* ---------- entry points ------------------------------------------- */
  function mountTrigger() {
    var list = document.querySelector(".nav-links");
    if (!list) return;
    var li = document.createElement("li");
    li.className = "nask-trigger-li";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "nask-trigger";
    b.setAttribute("aria-label", "Search this site");
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      "<span>Search</span><kbd>⌘K</kbd>";
    b.addEventListener("click", show);
    li.appendChild(b);
    list.insertBefore(li, list.lastElementChild);
  }

  /* On the homepage the bar also appears inline under the hero, where it
     can make its own argument rather than hiding behind a shortcut. */
  // function mountHero() {
  //   var actions = document.querySelector(".hero-actions");
  //   if (!actions) return;
  //   var d = document.createElement("div");
  //   d.className = "nask-inline";
  //   d.innerHTML =
  //     '<button type="button">' +
  //       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
  //       "<span>Search the site — <em>try “what did you get wrong?”</em></span><kbd>⌘K</kbd>" +
  //     "</button>" +
  //     '<small>It never answers, it routes — the same pattern I shipped at work. Or <a href="ask.html">ask me questions instead →</a></small>';
  //   d.querySelector("button").addEventListener("click", show);
  //   actions.parentNode.insertBefore(d, actions.nextSibling);
  // }

  function keys() {
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open ? close() : show(); }
      else if (e.key === "/" && !typing && !open) { e.preventDefault(); show(); }
      else if (e.key === "Escape" && open) { e.preventDefault(); close(); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    build();
    mountTrigger();
    // mountHero(); — disabled along with the hero bar above
    keys();
  });
})();
