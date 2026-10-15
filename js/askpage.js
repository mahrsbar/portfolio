/* The portfolio as a conversation.

   Every answer here is written by me and every claim links to the page it
   came from. Nothing is generated at runtime — the typing is an animation
   over fixed text, not a model thinking. That distinction is the whole
   point of the page, so it is stated on the page rather than implied.

   The transcript is real DOM appended in order, so it stays selectable,
   linkable and readable by a screen reader as it grows. */
(function () {
  "use strict";

  var root = document.querySelector("[data-ask]");
  if (!root) return;

  var thread = root.querySelector("[data-thread]");
  var chipbar = root.querySelector("[data-chipbar]");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var QA = {
    wrong: {
      q: "What did you get wrong?",
      blocks: [
        { p: "Plenty, and it's the most useful thing I have to show you. On the design system, six mistakes made it past me into shipped components:" },
        { list: [
          "The agent imported raw MUI instead of the design-system wrappers. Tests and type-check both passed.",
          "It used a 16px spacing token where Figma said 20px, because 16 is the common one.",
          "It matched a stale tokens file rather than live Figma.",
          "It reported <em>“all tests pass, try it in Storybook”</em> for components that were visually broken."
        ] },
        { p: "Every one of those is now a test that fails CI rather than a rule someone has to remember. The rule I landed on: <strong>an agent that stops is fine, an agent that guesses is not.</strong>" },
        { card: { href: "work/design-system.html#when-wrong", kind: "The full table", title: "Making the agent's mistakes impossible to repeat", desc: "Six failure modes, how each got through, and the control that catches it now." } },
        { p: "There's an older one I like better, because it's mine rather than the agent's. In January I shipped an exporter that inferred a component's tier from its name and <em>defaulted to “molecules” when it didn't know</em> — a guess, written into the file everything downstream treats as truth. Six months later I wrote a rules file that says the opposite." },
      ],
      next: ["agents", "best", "code"]
    },
    best: {
      q: "What's the work you're proudest of?",
      blocks: [
        { p: "An eighteen-month design system for four fraud-prevention products. I owned the governance, four Figma plugins, the export contract, and the rules file that turns a coding agent into a reliable contributor — and I QA'd the shipped components as the designer." },
        { stats: [["~10 min", "to re-export a design change, from a working day"], ["14", "production components, from 16 hollow ones"], ["13", "MUI components themed from tokens, from one"], ["712 → 0", "lines of mapping file"]] },
        { p: "The result I actually care about isn't in that grid: <strong>the workflow runs without me.</strong> An engineer types “implement the pending components” and the rules do the rest. My job moved from re-typing tokens into code to reading a measured-anchors table." },
        { card: { href: "work/design-system.html", kind: "Case study", title: "A design system four products ship from", desc: "Governance, plugins, two pipelines, and the rules file — published in full." } }
      ],
      next: ["agents", "wrong", "code"]
    },
    agents: {
      q: "How do you actually work with AI agents?",
      blocks: [
        { p: "I treat them like a new engineer who is fast, confident, and has no context. That means the leverage isn't in the prompt, it's in the environment: what the agent can see, what it's forbidden to guess, and what fails without a human noticing." },
        { list: [
          "<strong>Give it real context.</strong> Figma MCP for design truth, MUI MCP for the API. If either is unavailable it stops rather than answering from memory.",
          "<strong>Make uncertainty a stop.</strong> Stale tokens, disagreeing sources, missing tools — all halt the run and say why.",
          "<strong>Prefer structure to instruction.</strong> A rule the agent can ignore is weaker than a test it can't."
        ] },
        { quote: "Pipeline one asked scripts to operate at the knowledge level with no knowledge. Pipeline two gave the agent rules — and rule-based performance is exactly what it produced. Same model, given rules, behaved like a different one." },
        { p: "That framing is Rasmussen's skills–rules–knowledge model from human-factors engineering, which is the psychology degree earning its keep." },
        { card: { href: "work/design-system.html#sources", kind: "Primary source", title: "Read the rules file that governs the agent", desc: "Eleven phases, sanitised but unedited. Every line is a decision it no longer has to make." } }
      ],
      next: ["wrong", "code", "who"]
    },
    code: {
      q: "Do you actually write the code, or just design it?",
      blocks: [
        { p: "Both, and the tooling is usually the part I own outright. Four Figma plugins in TypeScript against the Plugin API, the React/MUI wrappers, the Storybook setup, the export contract." },
        { p: "This site is the cleanest evidence — no framework, no dependencies, hand-written CSS and vanilla JS, every line inspectable on GitHub." },
        { stats: [["0", "dependencies on this site"], ["23", "pages, every link checked"], ["88KB", "of TypeScript in the export plugin"]] },
      ],
      next: ["best", "agents", "who"]
    },
    who: {
      q: "What's your background?",
      blocks: [
        { p: "Psychology first, then computer science. I studied why people struggle, then learned to build the fix — which is a tidy line, but it's also just accurate about the order." },
        { p: "Now UX Engineer II at GeoComply, working on fraud-prevention back-office tools: the kind of software where an investigator moves between four products in a single shift and each one disagrees about what a table looks like." },
        { p: "The psychology shows up more than I expected. Rasmussen's SRK model for agent reliability, the Stroop effect for why mislabelled exports cost so much to read, journey mapping when four tools needed to become one page." },
        { card: { href: "about.html", kind: "Page", title: "More about me", desc: "The longer version." } }
      ],
      next: ["hire", "best", "code"]
    },
    hire: {
      q: "Are you available, and how do I reach you?",
      blocks: [
        { p: "Easiest is email — <a href=\"mailto:mahrs.aslam@gmail.com\">mahrs.aslam@gmail.com</a>. I'm also on <a href=\"https://github.com/mahrsbar\" target=\"_blank\" rel=\"noopener\">GitHub</a> and <a href=\"https://www.linkedin.com/in/mahrs-aslam\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>." },
        { card: { href: "images/Mahrs_Aslam_Resume.pdf", kind: "PDF", title: "Résumé", desc: "One page." } },
        { p: "If you'd rather just read something first, the design system case study is the one I'd send." }
      ],
      next: ["best", "wrong"]
    }
  };

  var ORDER = ["wrong", "best", "agents", "code", "who", "hire"];
  var asked = {};

  function prefix() { return ""; }

  /* ---------- rendering ---------- */
  function node(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function scroll(el) {
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
  }

  function type(el, text, done) {
    if (reduced) { el.textContent = text; done(); return; }
    var i = 0;
    (function tick() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 16);
      else done();
    })();
  }

  /* Paragraphs arrive a word at a time. The markup is parsed first and the
     words are revealed inside it, so links and emphasis survive. */
  function reveal(el, done) {
    if (reduced) { el.classList.add("is-in"); done(); return; }
    var words = [];
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement("span");
            s.className = "w";
            s.textContent = w;
            words.push(s);
            frag.appendChild(s);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    el.classList.add("is-in");
    words.forEach(function (w, i) { setTimeout(function () { w.classList.add("on"); }, i * 18); });
    setTimeout(done, words.length * 18 + 80);
  }

  function block(b) {
    if (b.p) return node("p", "a-p", b.p);
    if (b.quote) return node("blockquote", "a-quote", b.quote);
    if (b.list) {
      var ul = node("ul", "a-list");
      b.list.forEach(function (li) { ul.appendChild(node("li", null, li)); });
      return ul;
    }
    if (b.stats) {
      var d = node("div", "a-stats");
      b.stats.forEach(function (s) {
        d.appendChild(node("div", "a-stat", "<b>" + s[0] + "</b><span>" + s[1] + "</span>"));
      });
      return d;
    }
    if (b.card) {
      var a = node("a", "a-card");
      a.href = prefix() + b.card.href;
      a.innerHTML = "<span class=\"a-card-k\">" + b.card.kind + "</span><b>" + b.card.title + "</b><span>" + b.card.desc + "</span>" +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      return a;
    }
    return node("p", "a-p", "");
  }

  function chips() {
    chipbar.innerHTML = "";
    var left = ORDER.filter(function (k) { return !asked[k]; });
    var show = left.length ? left : ORDER;
    if (!left.length) chipbar.appendChild(node("span", "a-chiplabel", "Ask one again:"));
    show.forEach(function (k) {
      var b = node("button", "a-chip", QA[k].q);
      b.type = "button";
      b.addEventListener("click", function () { ask(k); });
      chipbar.appendChild(b);
    });
  }

  var busy = false;
  function ask(key) {
    if (busy) return;
    busy = true;
    asked[key] = true;
    chipbar.innerHTML = "";

    var qa = QA[key];
    var turn = node("div", "a-turn");
    thread.appendChild(turn);

    var you = node("div", "a-you");
    var bubble = node("div", "a-bubble");
    you.appendChild(bubble);
    turn.appendChild(you);
    scroll(you);

    type(bubble, qa.q, function () {
      var think = node("div", "a-think", "<i></i><i></i><i></i>");
      turn.appendChild(think);
      scroll(think);

      setTimeout(function () {
        think.remove();
        var i = 0;
        (function nextBlock() {
          if (i >= qa.blocks.length) {
            busy = false;
            chips();
            scroll(chipbar);
            return;
          }
          var el = block(qa.blocks[i++]);
          el.classList.add("a-in");
          turn.appendChild(el);
          scroll(el);
          if (el.classList.contains("a-p")) reveal(el, nextBlock);
          else {
            requestAnimationFrame(function () { el.classList.add("is-in"); });
            setTimeout(nextBlock, reduced ? 0 : 260);
          }
        })();
      }, reduced ? 0 : 620);
    });
  }

  chips();

  /* Deep link: /ask.html#wrong opens on that answer. */
  var h = location.hash.replace("#", "");
  if (QA[h]) setTimeout(function () { ask(h); }, 350);
})();
