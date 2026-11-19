(() => {
  "use strict";

  const assetVersion = "U1.109";
  const byId = (id) => document.getElementById(id);
  const viewNames = ["home", "quiz", "result", "results", "tree", "about"];
  const ambientProperties = ["--ambient-a", "--ambient-b", "--ambient-c", "--ambient-d", "--ambient-e", "--ambient-f"];
  const answerAmbientColors = [
    "hsl(120 63% 38%)",
    "hsl(0 62% 42%)",
    "hsl(280 54% 34%)",
    "hsl(40 78% 38%)",
    "hsl(205 65% 36%)",
    "hsl(175 62% 29%)",
  ];
  const viewAmbientPalettes = {
    home: ["#858a8f", "#555c63", "#a1a4a7"],
    results: ["#466578", "#655071", "#597564"],
    tree: ["#38634f", "#435d78", "#806f43"],
    about: ["#496472", "#5b6372", "#7a7180"],
    result: ["#6a7279", "#4d565e", "#8b9094"],
  };
  const arrowColors = [
    "hsl(120,70%,45%)",
    "hsl(0,70%,45%)",
    "hsl(280,60%,35%)",
    "hsl(42,90%,45%)",
    "hsl(205,65%,36%)",
    "hsl(175,62%,29%)",
  ];
  const straightArrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.467 135.467"><path d="M67.733332,0 33.866666,59.266668h25.4v76.200002h16.933333l0,-76.200002H101.6Z"/></svg>';
  const diagonalArrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.467 135.467"><path d="M135.46666 0L69.611254 17.960661L87.571915 35.920804L0 123.49324L0 135.46666L11.973429 135.46666L99.545861 47.89475L117.506 65.855411L135.46666 0z"/></svg>';
  const directionNames = ["t", "tr", "r", "br", "b", "bl", "l", "tl"];
  const directionOffsets = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

  const quarkIconLabels = new Set([
    "aggressively", "apathy", "armed forces", "biology", "birthright", "bureaucrats", "business",
    "charisma", "clerics", "commandment", "connections", "cooperation", "coup", "direct democracy",
    "economic leverage", "elected officials", "election", "fair competition", "fair outcomes", "god",
    "group", "guerrilla", "identity", "ideology", "illegal trade", "inheritance", "institutions",
    "insurrection", "judgment", "labor", "land ownership", "management", "military honors",
    "military readiness", "mythology", "national", "no", "parliament", "peacefully", "politics",
    "regional", "revolution", "selection", "share holding", "skill", "social elites", "sovereign",
    "spirits", "spiritual", "state", "state officials", "strongman", "technology", "temporal", "terror",
    "terrorism", "values", "vanguard", "variety", "warriors", "wisdom", "yes",
  ]);
  const leftIconLabels = new Set([
    "military", "none", "strength", "trade",
  ]);
  // Reuse by represented meaning only; custom answers need an explicit mapping.
  // See AGENTS.md before adding an icon. Do not restore keyword-based guesses.
  const answerIconOverrides = {
    "q_strongmanLegit:direct popular mandate": "/assets/quark/buttons/election.svg",
    "q_statePriority:individual liberty": "/assets/left/buttons/individual-liberty.svg",
    "q_statePriority:wider public goals": "/assets/quark/buttons/politics.svg",
    "q_guilds:through market competition": "/assets/left/buttons/trade.svg",
    "q_guilds:through collective coordination": "/assets/quark/buttons/cooperation.svg",
    "q_regimeGoal:power for its own sake": "/assets/quark/buttons/politics.svg",
    "q_regimeGoal:compulsory rational happiness": "/assets/quark/buttons/wisdom.svg",
    "q_nsOrganizationalTask:shared communist program and collective responsibility": "/assets/icons/solid/clipboard-list.svg",
    "q_nsOrganizationalTask:organization and strategy rooted in popular movements": "/assets/icons/solid/diagram-project.svg",
    "q_nsTendencies:combine their strongest elements": "/assets/quark/buttons/variety.svg",
    "q_nsTendencies:cooperate and experiment freely": "/assets/icons/solid/code-fork.svg",
    "q_nsDistribution:according to work contributed": "/assets/quark/buttons/labor.svg",
    "q_nsDistribution:according to need": "/assets/icons/solid/hand-holding-heart.svg",
    "q_nsConfederations:negotiate autonomous coexistence": "/assets/icons/solid/handshake.svg",
    "q_nsConfederations:build rival power to replace it": "/assets/icons/solid/hand-fist.svg",
    "q_nsCommunalRevolt:deepening ties between rebellious ways of life": "/assets/icons/solid/people-arrows.svg",
    "q_nsCommunalRevolt:building materially autonomous communes": "/assets/icons/solid/people-roof.svg",
    "q_nsWorldwideParty:through a single, globally integrated communist party.": "/assets/icons/solid/globe.svg",
    "q_nsWorldwideParty:across multiple interacting communist organizations.": "/assets/icons/solid/diagram-project.svg",
    "q_nsCommunalInsurrection:shared ritual and ecstasy": "/assets/left/buttons/aesthetic-ritual.svg",
    "q_nsCommunalInsurrection:common insurrectionary struggle": "/assets/icons/solid/hand-fist.svg",
    "q_counterEcon:counter-economic trade": "/assets/left/buttons/trade.svg",
    "q_transition:terror": "/assets/quark/buttons/terror.svg",
    "q_fumivFascfu:aesthetic myth and ritual": "/assets/left/buttons/aesthetic-ritual.svg",
    "q_fumivFascfu:a radical break from the past": "/assets/left/buttons/rupture.svg",
    "q_fascistInstitution:a restored mythical past": "/assets/left/buttons/mythical-past.svg",
    "q_fascistInstitution:a radical technological future": "/assets/quark/buttons/technology.svg",
    "q_khrushBrezhnev:yes": "/assets/quark/buttons/yes.svg",
    "q_khrushBrezhnev:no": "/assets/quark/buttons/no.svg",
    "q_nazbol:revolutionary vanguard": "/assets/quark/buttons/vanguard.svg",
    "q_nazbol:representative parliament": "/assets/quark/buttons/parliament.svg",
    "q_organic:organic centralism": "/assets/quark/buttons/group.svg",
    "q_organic:formal democratic organization": "/assets/quark/buttons/direct democracy.svg",
    "q_organic:no prescriptive organizational model": "/assets/left/buttons/none.svg",
    "q_organic:the revolution does not have an organizational model": "/assets/left/buttons/no.svg",
    "q_partyElites:an independent political organization": "/assets/quark/buttons/vanguard.svg",
    "q_partyElites:councils alone": "/assets/quark/buttons/direct democracy.svg",
    "q_trotskyCurrent:orthodox trotskyism": "/assets/quark/buttons/ideology.svg",
    "q_trotskyCurrent:posadism": "/assets/quark/buttons/ideology.svg",
    "q_utopianSchool:cooperation": "/assets/quark/buttons/cooperation.svg",
    "q_utopianSchool:variety": "/assets/quark/buttons/variety.svg",
    "q_utopianSchool:skill": "/assets/quark/buttons/skill.svg",
    "q_sovereignType:deciding exceptions to law": "/assets/icons/custom/legal-decision.svg",
    "q_artisticBreak:independent workers’ education": "/assets/quark/buttons/wisdom.svg",
    "q_artisticBreak:revolutionary avant-garde art": "/assets/quark/buttons/create.svg",
    "q_withdrawalStrategy:counter-economic trade": "/assets/left/buttons/trade.svg",
    "q_withdrawalStrategy:nonviolent noncooperation": "/assets/icons/custom/noncooperation.svg",
  "q_counterEcon:withdrawal of cooperation": "/assets/icons/custom/noncooperation.svg",
    "q_liberalPriority:individual liberty": "/assets/left/buttons/individual-liberty.svg",
    "q_liberalPriority:traditional social norms": "/assets/icons/solid/people-roof.svg",
    "q_civilizationalPriority:socialist transformation": "/assets/icons/solid/hand-fist.svg",
    "q_civilizationalPriority:national-imperial power": "/assets/quark/buttons/national.svg",
    "q_nationalEconomicPlan:a national production plan": "/assets/icons/solid/clipboard-list.svg",
    "q_nationalEconomicPlan:organized occupational interests": "/assets/quark/buttons/labor.svg",
    "q_corporatePriority:stable and profitable rule": "/assets/quark/buttons/business.svg",
    "q_corporatePriority:accelerating technological transformation": "/assets/quark/buttons/technology.svg",
    "q_religiousInstitutions:the crown and church": "/assets/icons/custom/crown-and-church.svg",
    "q_religiousInstitutions:religious occupational bodies": "/assets/icons/custom/religious-guild.svg",
    "q_traditionalElite:rebuilding political authority": "/assets/quark/buttons/institutions.svg",
    "q_traditionalElite:preserving spiritual independence": "/assets/quark/buttons/spiritual.svg",
  };


  function countOutcomes(graph, id, cache = new Map()) {
    if (cache.has(id)) return cache.get(id);
    const count = graph[id].choices.reduce((total, choice) => total +
      (choice.type === "result" ? 1 : countOutcomes(graph, choice.id, cache)), 0);
    cache.set(id, count);
    return count;
  }

  function countLabel(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function displayAliases(name, aliases) {
    const normalize = (text) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const seen = new Set([normalize(name)]);
    return aliases.filter((alias) => {
      const key = normalize(alias);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const outcomeCounts = new Map();
  let data;
  let layouts;
  let ideologyNames = [];
  let primaryRoutes = new Map();
  let currentView = "home";
  let currentNode = "";
  let history = [];
  let selectedName = "";
  let resultOrigin = "home";
  let resultPath = [];
  let routeIncludesEarlierChoices = false;
  let catalogBuilt = false;
  let treesBuilt = false;
  let treeLoading = false;
  let layoutPromise;
  let resultPaletteRequest = 0;
  const resultPaletteCache = new Map();

  const dataPromise = fetch(`/data/quiz-data.json?v=${assetVersion}`, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Quiz data returned ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      data = payload;
      ideologyNames = Object.keys(data.ideologies).sort((left, right) => left.localeCompare(right));
      primaryRoutes = deriveRoutes(data.start);
      currentNode = data.start;
      selectedName = ideologyNames[0];
      initializeDataUi();
      return data;
    })
    .catch((error) => {
      console.error(error);
      document.querySelector(".home-note").textContent = "The sorter data could not be loaded. Please refresh the page.";
      throw error;
    });

  function getLayouts() {
    if (!layoutPromise) {
      layoutPromise = fetch(`/data/tree-layout.json?v=${assetVersion}`, { cache: "no-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`Tree data returned ${response.status}`);
          return response.json();
        })
        .then((payload) => {
          layouts = payload;
          return layouts;
        });
    }
    return layoutPromise;
  }

  function initializeDataUi() {
    byId("version-label").textContent = data.version;
    for (const [name, count] of Object.entries(data.counts)) {
      for (const element of document.querySelectorAll(`[data-count="${name}"]`)) element.textContent = String(count);
    }
    byId("matchesTip").textContent = `All ${ideologyNames.length} possible results, alphabetically`;
    const matches = byId("matches");
    for (const name of ideologyNames) matches.add(new Option(name, name));
    matches.addEventListener("change", () => {
      if (matches.value) openResult(matches.value, "tree");
    });
    const families = [...new Set(Object.values(data.ideologies).map((item) => item.family))].sort();
    const familyFilter = byId("family-filter");
    for (const family of families) familyFilter.add(new Option(family, family));
    byId("resultBox").style.backgroundImage = `url("${data.ideologies[ideologyNames[0]].thumbnail}")`;
  }

  function deriveRoutes(start) {
    const routes = new Map();
    const active = new Set();
    function walk(id, path) {
      if (active.has(id)) throw new Error(`Cycle detected at ${id}`);
      const node = data.graph[id];
      if (!node) throw new Error(`Missing question ${id}`);
      active.add(id);
      for (const choice of node.choices) {
        const nextPath = [...path, { id, question: node.question, answer: choice.label }];
        if (choice.type === "question") walk(choice.id, nextPath);
        else routes.set(choice.ideology, { ideology: choice.ideology, path: nextPath });
      }
      active.delete(id);
    }
    walk(start, []);
    return routes;
  }

  function closeNavigation() {
    byId("nav-items").hidden = true;
    byId("nav-items").classList.remove("nav-items-open");
    byId("nav-toggle").setAttribute("aria-expanded", "false");
    byId("nav-toggle").setAttribute("aria-label", "Open navigation");
  }

  function lengthBand(text, mediumAt, longAt) {
    if (text.length >= longAt) return "long";
    if (text.length >= mediumAt) return "medium";
    return "short";
  }

  function setAmbientPalette(colors) {
    const palette = colors.filter(Boolean).slice(0, ambientProperties.length);
    if (!palette.length) return;
    ambientProperties.forEach((property, index) => {
      document.documentElement.style.setProperty(property, palette[index % palette.length]);
    });
    byId("ambient-background").dataset.count = String(palette.length);
  }

  function setAmbientForView(name) {
    setAmbientPalette(viewAmbientPalettes[name] || viewAmbientPalettes.home);
  }

  function sampleImagePalette(image) {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 16;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return [];
    try {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map();
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) continue;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const key = ((red >> 5) << 6) | ((green >> 5) << 3) | (blue >> 5);
        const bucket = buckets.get(key) || [0, 0, 0, 0];
        bucket[0] += red;
        bucket[1] += green;
        bucket[2] += blue;
        bucket[3] += 1;
        buckets.set(key, bucket);
      }
      const ranked = [...buckets.values()].map((bucket) => {
        const color = bucket.slice(0, 3).map((channel) => channel / bucket[3]);
        const chroma = Math.max(...color) - Math.min(...color);
        const lightness = (Math.max(...color) + Math.min(...color)) / 2;
        return { color, score: bucket[3] * (1 + chroma / 10) * (lightness > 12 && lightness < 243 ? 1 : 0.55) };
      }).sort((left, right) => right.score - left.score);
      const chosen = [];
      for (const candidate of ranked) {
        const distinct = chosen.every(({ color }) => Math.hypot(...candidate.color.map((channel, index) => channel - color[index])) >= 36);
        if (distinct) chosen.push(candidate);
        if (chosen.length === 5) break;
      }
      return chosen.map(({ color }) => `#${color.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`);
    } catch { return []; }
  }

  function animateView(element) {
    element.classList.remove("view-enter");
    void element.offsetWidth;
    element.classList.add("view-enter");
  }

  function resetPageScroll() {
    const reset = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    reset();
    requestAnimationFrame(reset);
  }

  function focusViewHeading() {
    const heading = byId(`${currentView}-view`).querySelector("h1, h2");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  function showView(name) {
    currentView = name;
    if (name !== "quiz" && name !== "result") setAmbientForView(name);
    for (const viewName of viewNames) {
      const element = byId(`${viewName}-view`);
      element.hidden = viewName !== name;
      if (viewName === name) animateView(element);
    }
    closeNavigation();
    resetPageScroll();
    focusViewHeading();
  }

  async function navigateTo(name) {
    if (name === "results") {
      await dataPromise;
      buildCatalog();
      filterCatalog();
    } else if (name === "tree") {
      showView("tree");
      await loadTrees();
      return;
    }
    showView(name);
  }

  async function startQuiz() {
    await dataPromise;
    history = [];
    currentNode = data.start;
    renderQuestion();
    showView("quiz");
  }

  function startAtNode(id) {
    history = [];
    currentNode = id;
    renderQuestion();
    showView("quiz");
  }

  function answerIcon(nodeId, label) {
    const key = label.toLowerCase();
    const override = answerIconOverrides[`${nodeId}:${key}`];
    if (override) return override;
    if (quarkIconLabels.has(key)) return `/assets/quark/buttons/${key}.svg`;
    if (leftIconLabels.has(key)) return `/assets/left/buttons/${key}.svg`;
    if (key === "the state should not exist" || key === "no state") return "/assets/quark/buttons/nostate.svg";
    return "/assets/quark/buttons/missing.svg";
  }

  function renderQuestion() {
    const node = data.graph[currentNode];
    byId("remaining-outcomes").textContent = `${countLabel(countOutcomes(data.graph, currentNode, outcomeCounts), "outcome")} remaining`;
    setAmbientPalette(answerAmbientColors.slice(0, node.choices.length));
    byId("question-number").textContent = `Question ${history.length + 1}`;
    const question = byId("question-text");
    question.textContent = node.question;
    question.dataset.length = lengthBand(node.question, 70, 105);
    const help = byId("question-help");
    help.textContent = node.help || "";
    help.hidden = !node.help;
    const explanation = byId("question-explanation");
    byId("question-explanation-text").textContent = node.explanation || "";
    explanation.hidden = !node.explanation;
    explanation.open = false;
    const answers = byId("answers");
    answers.replaceChildren();
    node.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `button answer-button answer-${index + 1}`;
      button.dataset.length = choice.label.length >= 30 ? "long" : "short";
      const icon = document.createElement("img");
      icon.src = answerIcon(currentNode, choice.label);
      icon.alt = "";
      icon.addEventListener("error", () => {
        icon.src = "/assets/quark/buttons/missing.svg";
      }, { once: true });
      const label = document.createElement("span");
      label.textContent = choice.label;
      button.append(icon, label);
      button.addEventListener("click", () => choose(choice));
      answers.append(button);
    });
    const dots = byId("path-dots");
    dots.replaceChildren();
    for (const item of history.slice(-12)) {
      const dot = document.createElement("span");
      dot.title = item.answer;
      dots.append(dot);
    }
    dots.setAttribute("aria-label", `${countLabel(history.length, "answer")} completed`);
    if (currentView === "quiz") {
      animateView(byId("quiz-view"));
      focusViewHeading();
    }
  }

  function choose(choice) {
    const nextHistory = [...history, { nodeId: currentNode, answer: choice.label }];
    history = nextHistory;
    if (choice.type === "question") {
      currentNode = choice.id;
      renderQuestion();
      resetPageScroll();
      return;
    }
    const path = nextHistory.map((item) => ({
      id: item.nodeId,
      question: data.graph[item.nodeId].question,
      answer: item.answer,
    }));
    openResult(choice.ideology, "quiz", path);
  }

  function quizBack() {
    if (!history.length) {
      showView("home");
      return;
    }
    const previous = history.at(-1);
    currentNode = previous.nodeId;
    history = history.slice(0, -1);
    renderQuestion();
    resetPageScroll();
  }

  async function openResult(name, origin, path = null) {
    await dataPromise;
    selectedName = name;
    resultOrigin = origin;
    routeIncludesEarlierChoices = Boolean(path?.length && path[0].id !== data.start);
    resultPath = routeIncludesEarlierChoices ? primaryRoutes.get(name)?.path || [] : path || primaryRoutes.get(name)?.path || [];
    renderResult();
    showView("result");
  }

  function renderResult() {
    const ideology = data.ideologies[selectedName];
    const resultName = byId("result-name");
    resultName.textContent = ideology.name;
    resultName.dataset.length = lengthBand(ideology.name, 22, 38);
    const flag = byId("result-flag");
    const paletteRequest = ++resultPaletteRequest;
    const cachedPalette = resultPaletteCache.get(ideology.name);
    if (cachedPalette) setAmbientPalette(cachedPalette);
    const applyImagePalette = () => {
      if (paletteRequest !== resultPaletteRequest || selectedName !== ideology.name) return;
      const palette = sampleImagePalette(flag);
      if (!palette.length) return;
      resultPaletteCache.set(ideology.name, palette);
      setAmbientPalette(palette);
    };
    flag.onload = cachedPalette ? null : applyImagePalette;
    flag.src = ideology.image || ideology.thumbnail;
    flag.srcset = ideology.thumbnail && ideology.image ? `${ideology.thumbnail} 360w, ${ideology.image} 960w` : "";
    flag.sizes = "(max-width: 680px) 80vw, 700px";
    flag.alt = `${ideology.name} flag`;
    flag.onerror = () => {
      flag.onerror = null;
      flag.onload = null;
      flag.srcset = "";
      flag.src = "/assets/quark/flags/Missing.svg";
      if (!cachedPalette) setAmbientForView("result");
    };
    if (!cachedPalette && flag.complete && flag.naturalWidth) requestAnimationFrame(applyImagePalette);
    const editorialDescription = ideology.quoteKind === "description";
    const quoteTag = editorialDescription ? "P" : "BLOCKQUOTE";
    let quote = byId("result-quote");
    if (quote.tagName !== quoteTag) {
      const replacement = document.createElement(quoteTag.toLowerCase());
      replacement.id = quote.id;
      quote.replaceWith(replacement);
      quote = replacement;
    }
    quote.className = `quote${editorialDescription ? " editorial-description" : ""}`;
    quote.textContent = ideology.quote;
    const author = byId("result-author");
    author.classList.toggle("editorial-author", editorialDescription);
    author.textContent = editorialDescription ? "Editorial description" : ideology.author;
    const description = byId("result-description");
    description.textContent = ideology.description || "";
    description.hidden = !ideology.description || ideology.description.trim() === ideology.quote.trim();
    const quoteSource = byId("result-quote-source");
    quoteSource.replaceChildren();
    quoteSource.hidden = !ideology.quoteSource;
    if (ideology.quoteSource) {
      const link = document.createElement("a");
      link.href = ideology.quoteSource.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = ideology.quoteSource.label;
      quoteSource.append(link);
      if (ideology.quoteSource.citation) {
        const details = document.createElement("details");
        details.className = "source-details";
        const summary = document.createElement("summary");
        summary.textContent = "Source details";
        const citation = document.createElement("p");
        citation.textContent = ideology.quoteSource.citation;
        details.append(summary, citation);
        quoteSource.append(details);
      }
      if (ideology.quoteSource.note) {
        const note = document.createElement("span");
        note.textContent = ideology.quoteSource.note;
        quoteSource.append(note);
      }
    }
    byId("result-family").textContent = ideology.family;
    byId("result-branch").textContent = ideology.branch;
    const aliases = byId("result-aliases");
    const informativeAliases = displayAliases(ideology.name, ideology.aliases);
    if (informativeAliases.length) {
      aliases.hidden = false;
      aliases.replaceChildren("Also known as: ");
      const labels = document.createElement("span");
      labels.textContent = informativeAliases.join(" · ");
      aliases.append(labels);
    } else {
      aliases.hidden = true;
    }
    const canCycle = resultOrigin !== "quiz";
    for (const id of ["result-previous", "result-next"]) {
      byId(id).style.visibility = canCycle ? "visible" : "hidden";
      byId(id).style.pointerEvents = canCycle ? "auto" : "none";
    }
    renderRoute();
    if (currentView === "result") animateView(byId("result-view"));
  }

  function renderRoute() {
    byId("route-summary").textContent = `View the ${resultPath.length}-answer route`;
    byId("route-details").open = false;
    byId("route-context").hidden = !routeIncludesEarlierChoices;
    const timeline = byId("route-timeline");
    timeline.replaceChildren();
    resultPath.forEach((step, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      number.className = "route-number";
      number.textContent = String(index + 1);
      const text = document.createElement("div");
      const question = document.createElement("p");
      question.textContent = step.question;
      const answer = document.createElement("strong");
      answer.textContent = step.answer;
      text.append(question, answer);
      item.append(number, text);
      timeline.append(item);
    });
  }

  function resultBack() {
    if (resultOrigin === "quiz") {
      const previous = history.at(-1);
      if (!previous) {
        showView("home");
        return;
      }
      currentNode = previous.nodeId;
      history = history.slice(0, -1);
      renderQuestion();
      showView("quiz");
      return;
    }
    navigateTo(resultOrigin);
  }

  function cycleResult(direction) {
    const index = ideologyNames.indexOf(selectedName);
    const next = (index + direction + ideologyNames.length) % ideologyNames.length;
    selectedName = ideologyNames[next];
    resultPath = primaryRoutes.get(selectedName)?.path || [];
    routeIncludesEarlierChoices = false;
    renderResult();
  }

  function buildCatalog() {
    if (catalogBuilt) return;
    catalogBuilt = true;
    const grid = byId("result-grid");
    const fragment = document.createDocumentFragment();
    for (const name of ideologyNames) {
      const ideology = data.ideologies[name];
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "result-tile";
      tile.dataset.name = name;
      tile.setAttribute("aria-label", name);
      tile.dataset.search = [name, ideology.family, ideology.author, ...ideology.aliases, ideology.quote, ideology.description || "", ideology.quoteSource?.label || "", ideology.quoteSource?.citation || "", ideology.quoteSource?.note || ""].join(" ").toLowerCase();
      tile.dataset.branch = ideology.branch;
      tile.dataset.family = ideology.family;
      const image = document.createElement("img");
      image.src = ideology.thumbnail;
      image.alt = "";
      image.width = 360;
      image.height = 240;
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
      image.addEventListener("error", () => {
        image.src = "/assets/quark/flags/Missing.svg";
      }, { once: true });
      const overlay = document.createElement("span");
      overlay.className = "tile-overlay";
      const title = document.createElement("strong");
      title.textContent = name;
      const family = document.createElement("small");
      family.textContent = ideology.family;
      overlay.append(title, family);
      tile.append(image, overlay);
      tile.addEventListener("click", () => openResult(name, "results"));
      fragment.append(tile);
    }
    grid.append(fragment);
  }

  function filterCatalog() {
    if (!catalogBuilt) return;
    const query = byId("search-filter").value.trim().toLowerCase();
    const branch = byId("branch-filter").value;
    const family = byId("family-filter").value;
    let visible = 0;
    for (const tile of byId("result-grid").children) {
      const match = (!query || tile.dataset.search.includes(query))
        && (branch === "all" || tile.dataset.branch === branch)
        && (family === "all" || tile.dataset.family === family);
      tile.hidden = !match;
      if (match) visible += 1;
    }
    byId("catalog-count").textContent = `Showing ${countLabel(visible, "outcome")}`;
    byId("empty-state").hidden = visible !== 0;
  }

  function getDirection(dx, dy) {
    return directionOffsets.findIndex(([offsetX, offsetY]) => offsetX === dx && offsetY === dy);
  }

  function generateArrow(text, direction, color, { bridge = false, compactLabel = false } = {}) {
    const fontSize = text.length < 4 ? 175 : text.length < 6 ? 150 : text.length < 10 ? 90 : 65;
    const directions = {
      t: { degrees: 0, path: straightArrow },
      r: { degrees: 90, path: straightArrow },
      b: { degrees: 180, path: straightArrow },
      l: { degrees: 270, path: straightArrow },
      tr: { degrees: 0, path: diagonalArrow },
      br: { degrees: 90, path: diagonalArrow },
      bl: { degrees: 180, path: diagonalArrow },
      tl: { degrees: 270, path: diagonalArrow },
    };
    const { degrees, path } = directions[direction];
    const bridgeAttributes = bridge
      ? ' stroke="hsl(0 0% 6%)" stroke-width="8" stroke-linejoin="round" paint-order="stroke fill"'
      : "";
    const adjustedPath = path.replace("<path", `<path fill="${color}"${bridgeAttributes} transform="rotate(${degrees} 67.734 67.734)"`);
    const image = document.createElement("img");
    image.src = `data:image/svg+xml;base64,${btoa(adjustedPath)}`;
    image.alt = "";
    const label = document.createElement("div");
    label.style.fontSize = `${compactLabel ? Math.min(fontSize, 110) : fontSize}%`;
    label.textContent = text;
    return [image, label];
  }

  function makeClickable(cell, action, title) {
    cell.type = "button";
    cell.title = title;
    cell.addEventListener("click", action);
  }

  function treeAnswerDescription(node) {
    return node.choices.map((choice) => {
      const destination = choice.type === "question" ? data.graph[choice.id].question : choice.ideology;
      return `${choice.label} leads to: ${destination}`;
    }).join("; ");
  }

  function buildTree(element, layout) {
    element.style.gridTemplateColumns = `repeat(${layout.width - 1}, var(--tree-node-width) var(--tree-arrow-size)) var(--tree-node-width)`;
    element.style.gridTemplateRows = `repeat(${layout.height - 1}, var(--tree-node-height) var(--tree-arrow-size)) var(--tree-node-height)`;
    element.style.position = "relative";
    const locations = new Map(layout.cells.map((cell) => [cell.key, cell]));
    const fragment = document.createDocumentFragment();

    for (const item of layout.cells) {
      const cell = document.createElement("button");
      cell.classList.add("cell");
      cell.style.gridRow = item.row * 2 + 1;
      cell.style.gridColumn = item.column * 2 + 1;
      if (item.start) cell.classList.add("startCell");
      if (item.type === "question") {
        cell.classList.add("questionCell");
        const question = data.graph[item.id].question;
        cell.textContent = question;
        if (question.length > 90) cell.style.fontSize = ".6875rem";
        else if (question.length > 70) cell.style.fontSize = ".75rem";
        else if (question.length > 52) cell.style.fontSize = ".8125rem";
        const description = document.createElement("span");
        description.id = `tree-answers-${item.id}`;
        description.hidden = true;
        description.textContent = treeAnswerDescription(data.graph[item.id]);
        cell.setAttribute("aria-describedby", description.id);
        fragment.append(description);
        makeClickable(cell, () => startAtNode(item.id), "Answer from this question");
      } else {
        const ideology = data.ideologies[item.ideology];
        cell.classList.add("resultCell");
        cell.style.backgroundImage = `url("${ideology.thumbnail}")`;
        const label = document.createElement("span");
        label.className = "resultCellText";
        label.textContent = item.ideology;
        if (item.ideology.length > 38) label.style.fontSize = ".75rem";
        else if (item.ideology.length > 28) label.style.fontSize = ".875rem";
        cell.append(label);
        makeClickable(cell, () => openResult(item.ideology, "tree"), ideology.family);
      }
      fragment.append(cell);
    }

    const arrowLayer = document.createElement("div");
    arrowLayer.className = "arrowLayer";
    Object.assign(arrowLayer.style, {
      position: "absolute",
      inset: "0",
      display: "grid",
      gridTemplateColumns: element.style.gridTemplateColumns,
      gridTemplateRows: element.style.gridTemplateRows,
      zIndex: "0",
      pointerEvents: "none",
    });
    const arrowGroups = new Map();
    const arrows = [];
    for (const item of layout.cells) {
      if (item.type !== "question") continue;
      const node = data.graph[item.id];
      node.choices.forEach((choice, index) => {
        const targetKey = choice.type === "question" ? `question:${choice.id}` : `result:${choice.ideology}`;
        const target = locations.get(targetKey);
        if (!target) return;
        const dx = target.column - item.column;
        const dy = target.row - item.row;
        const directionIndex = getDirection(dx, dy);
        if (directionIndex < 0) throw new Error(`Non-adjacent tree edge from ${item.key} to ${targetKey}`);
        const arrowRow = item.row * 2 + 1 + dy;
        const arrowColumn = item.column * 2 + 1 + dx;
        const stackKey = `${arrowRow}:${arrowColumn}`;
        const group = arrowGroups.get(stackKey) || [];
        const arrow = {
          arrowRow,
          arrowColumn,
          stackKey,
          stackIndex: group.length,
          dx,
          dy,
          direction: directionNames[directionIndex],
          label: choice.label,
          color: arrowColors[index % arrowColors.length],
        };
        group.push(arrow);
        arrowGroups.set(stackKey, group);
        arrows.push(arrow);
      });
    }
    for (const arrow of arrows) {
      const group = arrowGroups.get(arrow.stackKey);
      const crossing = group.length > 1;
      const arrowCell = document.createElement("div");
      arrowCell.className = "arrowCell";
      arrowCell.style.gridRow = arrow.arrowRow;
      arrowCell.style.gridColumn = arrow.arrowColumn;
      if (crossing) {
        const progress = .18;
        const startX = arrow.dx > 0 ? 0 : arrow.dx < 0 ? 100 : 50;
        const startY = arrow.dy > 0 ? 0 : arrow.dy < 0 ? 100 : 50;
        const endX = 100 - startX;
        const endY = 100 - startY;
        arrowCell.dataset.crossing = String(arrow.stackIndex);
        arrowCell.style.setProperty("--label-x", `${startX + (endX - startX) * progress}%`);
        arrowCell.style.setProperty("--label-y", `${startY + (endY - startY) * progress}%`);
      }
      arrowCell.append(...generateArrow(arrow.label, arrow.direction, arrow.color, {
        bridge: crossing && arrow.stackIndex === 1,
        compactLabel: crossing,
      }));
      arrowLayer.append(arrowCell);
    }
    element.replaceChildren(fragment, arrowLayer);
  }

  function buildTrees() {
    if (treesBuilt) return;
    buildTree(byId("tree1"), layouts.pro);
    buildTree(byId("tree2"), layouts.anti);
    treesBuilt = true;
  }

  async function loadTrees() {
    if (treeLoading || treesBuilt) return;
    treeLoading = true;
    const retry = byId("tree-retry");
    const restoreFocus = document.activeElement === retry;
    retry.hidden = true;
    byId("tree-load-status").textContent = "Loading trees…";
    try {
      await Promise.all([dataPromise, getLayouts()]);
      buildTrees();
      document.querySelectorAll("[data-tree-diagram]").forEach((element) => { element.hidden = false; });
      byId("tree-load-status").textContent = "";
      if (restoreFocus && currentView === "tree") byId("tree1").querySelector(".startCell").focus();
    } catch (error) {
      console.error(error);
      layoutPromise = undefined;
      treesBuilt = false;
      byId("tree1").replaceChildren();
      byId("tree2").replaceChildren();
      byId("tree-load-status").textContent = data
        ? "The trees could not be loaded. Try again, or browse Results."
        : "The sorter data could not be loaded. Refresh the page to try again.";
      retry.hidden = !data;
      if (restoreFocus && currentView === "tree" && data) retry.focus();
    } finally {
      treeLoading = false;
    }
  }

  byId("tree-retry").addEventListener("click", loadTrees);

  byId("nav-toggle").addEventListener("click", () => {
    const items = byId("nav-items");
    const open = items.hidden;
    items.hidden = !open;
    items.classList.toggle("nav-items-open", open);
    byId("nav-toggle").setAttribute("aria-expanded", String(open));
    byId("nav-toggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) navigateTo(viewButton.dataset.view);
    const actionButton = event.target.closest("[data-action='start']");
    if (actionButton) startQuiz();
  });
  byId("quiz-back").addEventListener("click", quizBack);
  byId("result-back").addEventListener("click", resultBack);
  byId("result-previous").addEventListener("click", () => cycleResult(-1));
  byId("result-next").addEventListener("click", () => cycleResult(1));
  for (const id of ["search-filter", "branch-filter", "family-filter"]) {
    byId(id).addEventListener(id === "search-filter" ? "input" : "change", filterCatalog);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !byId("nav-items").hidden) {
      closeNavigation();
      byId("nav-toggle").focus();
    } else if ((event.key === "Backspace" || event.key === "0") && !["INPUT", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      if (currentView === "quiz") quizBack();
      else if (currentView === "result") resultBack();
      else if (currentView !== "home") showView("home");
    } else if (currentView === "quiz" && /^[1-9]$/.test(event.key)) {
      byId("answers").children[Number(event.key) - 1]?.click();
    } else if (currentView === "result" && resultOrigin !== "quiz" && event.key === "ArrowLeft") {
      cycleResult(-1);
    } else if (currentView === "result" && resultOrigin !== "quiz" && event.key === "ArrowRight") {
      cycleResult(1);
    }
  });
})();
