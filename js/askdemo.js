/* "Your question becomes filters" — a tiny stand-in for the real thing.
   In the product, Claude returns a structured plan (page, identifier type,
   date range, status, place) via structured outputs. Here a handful of
   rules play the model's part so the interaction is demonstrable offline. */
(function () {
  var root = document.querySelector("[data-askdemo]");
  if (!root) return;
  var input = root.querySelector("input");
  var form = root.querySelector("form");
  var chips = root.querySelector("[data-chips]");
  var plan = root.querySelector("[data-plan]");
  var summary = root.querySelector("[data-summary]");
  var starters = root.querySelectorAll("[data-starter]");

  function interpret(q) {
    var s = q.toLowerCase();
    var p = { page: "transactions", searchType: null, identifiers: [], from: null, to: null, status: null, placeName: null, intent: "" };

    if (/map|where|near|around|location|cluster/.test(s)) p.page = "powermap";
    if (/share|shared|linked|connected|ring|network|graph|same device/.test(s)) p.page = "mls";
    if (/profile of|show me user|about user/.test(s)) p.page = "user";

    var dev = s.match(/device\s+([a-z0-9-]{6,})/);
    var usr = s.match(/user\s+([a-z0-9_.-]{3,})/);
    if (dev) { p.searchType = "Device_UUID"; p.identifiers.push(dev[1]); if (p.page === "transactions") p.page = "device"; }
    else if (usr) { p.searchType = "User_ID"; p.identifiers.push(usr[1]); if (p.page === "transactions") p.page = "user"; }

    if (/fail|failed|blocked|denied|reject/.test(s)) p.status = "fail";
    else if (/pass|passed|approved|success/.test(s)) p.status = "pass";

    var now = new Date();
    function iso(d) { return d.toISOString().slice(0, 10); }
    if (/last\s+24|yesterday|today|24 hours/.test(s)) { p.from = iso(new Date(now - 864e5)); p.to = iso(now); }
    else if (/last\s+week|7 days|this week/.test(s)) { p.from = iso(new Date(now - 7 * 864e5)); p.to = iso(now); }
    else if (/last\s+month|30 days/.test(s)) { p.from = iso(new Date(now - 30 * 864e5)); p.to = iso(now); }
    else if (/weekend/.test(s)) { p.from = iso(new Date(now - 3 * 864e5)); p.to = iso(now); }

    var place = s.match(/\b(?:in|near|around)\s+([a-z][a-z .'-]{2,}?)(?:\s+(?:last|this|over|for|with|that|who|where)\b|[?.!,]|$)/);
    if (place) { p.placeName = place[1].trim().replace(/\b\w/g, function (c) { return c.toUpperCase(); }); if (p.page === "transactions") p.page = "powermap"; }

    var bits = [];
    bits.push({ k: "page", v: p.page });
    if (p.searchType) bits.push({ k: p.searchType.replace("_", " ").toLowerCase(), v: p.identifiers[0] });
    if (p.status) bits.push({ k: "status", v: p.status });
    if (p.from) bits.push({ k: "range", v: p.from + " → " + p.to });
    if (p.placeName) bits.push({ k: "place", v: p.placeName });
    p.intent = bits.length > 1 ? "Open " + p.page + " with " + (bits.length - 1) + " filter" + (bits.length > 2 ? "s" : "") + " applied." : "Open " + p.page + ". No filters could be inferred, so nothing is guessed.";
    return { plan: p, bits: bits };
  }

  function show(q) {
    var r = interpret(q);
    chips.innerHTML = "";
    r.bits.forEach(function (b, i) {
      var c = document.createElement("span");
      c.className = "ask-chip";
      c.style.animationDelay = i * 90 + "ms";
      c.innerHTML = "<small>" + b.k + "</small>" + b.v;
      chips.appendChild(c);
    });
    summary.textContent = r.plan.intent;
    plan.textContent = JSON.stringify(r.plan, null, 2);
    root.classList.add("answered");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value.trim()) show(input.value);
  });
  starters.forEach(function (b) {
    b.addEventListener("click", function () {
      input.value = b.textContent;
      show(input.value);
    });
  });
})();
