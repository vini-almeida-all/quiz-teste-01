(function () {
  'use strict';

  const data = window.QUIZ_DATA;
  const engine = window.QuizEngine;
  const ui = window.QUIZ_UI?.uiCopy;
  const app = document.getElementById('app');
  if (!data || !engine || !ui || !app) {
    document.body.textContent = 'Não foi possível carregar o quiz. Extraia todos os arquivos do ZIP antes de abrir index.html.';
    return;
  }

  const state = {
    stage: 'intro', index: 0, answers: {}, scores: null, resolution: null,
    winner: null, bonusOptions: [], selectedBonus: null,
  };
  let timer = null;

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function button(label, className, action) {
    const node = el('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function ornament() { return el('div', 'ornament', '✦'); }
  function corners(container) {
    for (const position of ['tl', 'tr', 'bl', 'br']) {
      const corner = el('span', `frame-corner ${position}`, '✧');
      corner.setAttribute('aria-hidden', 'true');
      container.append(corner);
    }
  }
  function changeStage(stage) {
    state.stage = stage;
    render();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function reset() {
    if (timer) clearTimeout(timer);
    Object.assign(state, { stage: 'intro', index: 0, answers: {}, scores: null,
      resolution: null, winner: null, bonusOptions: [], selectedBonus: null });
    render();
  }

  function introScreen() {
    const hero = el('section', 'frame hero');
    corners(hero);
    const content = el('div', 'hero-content');
    const crest = el('div', 'hero-crest');
    crest.setAttribute('aria-hidden', 'true');
    content.append(crest);
    const title = el('h1', '', 'Qual é o seu chalé?');
    title.setAttribute('aria-label', ui.intro.title);
    content.append(title, el('div', 'hero-subtitle', 'No Acampamento Meio-Sangue?'));
    content.append(ornament(), el('p', 'hero-description', ui.intro.description));
    content.append(el('div', 'hero-spacer'));
    content.append(button(`${ui.intro.primaryAction}  →`, 'primary', () => changeStage('question')));
    content.append(el('div', 'hero-hint', ui.intro.durationHint));
    hero.append(content);
    return hero;
  }

  function progress(current) {
    const head = el('div', 'progress-head');
    head.append(el('span', 'eyebrow', 'Arquivo do campista'),
      el('span', 'progress-label', `${String(current).padStart(2, '0')} / 13`));
    const trail = el('div', 'progress-trail');
    trail.setAttribute('role', 'progressbar');
    trail.setAttribute('aria-label', 'Progresso do quiz');
    trail.setAttribute('aria-valuenow', String(current));
    trail.setAttribute('aria-valuemax', '13');
    for (let i = 1; i <= 13; i++) {
      trail.append(el('span', `trail-node ${i < current ? 'complete' : i === current ? 'current' : ''}`));
    }
    return [head, trail];
  }
  function optionButton(letter, text, selected, action) {
    const option = button('', `option${selected ? ' selected' : ''}`, action);
    option.setAttribute('aria-pressed', selected ? 'true' : 'false');
    option.append(el('span', 'option-letter', letter), el('span', '', text));
    return option;
  }
  function questionScreen() {
    const question = data.questions[state.index];
    const panel = el('section', 'parchment question-panel');
    panel.append(...progress(question.number), el('h2', '', question.question));
    const options = el('div', 'options');
    for (const option of question.options) {
      options.append(optionButton(option.id, option.text,
        state.answers[question.id] === option.id, () => {
          state.answers[question.id] = option.id;
          render();
        }));
    }
    panel.append(options);
    const actions = el('div', 'question-actions');
    if (state.index > 0) actions.append(button(`← ${ui.question.back}`, 'text-button', () => {
      state.index -= 1;
      render();
    }));
    else actions.append(el('span'));
    const next = button(`${state.index === 12 ? ui.question.finish : ui.question.next}  →`, 'primary', () => {
      if (state.index === 12) finishQuestions();
      else { state.index += 1; render(); }
    });
    next.disabled = !state.answers[question.id];
    actions.append(next);
    panel.append(actions);
    return panel;
  }
  function finishQuestions() {
    state.scores = engine.calculateScores(data, state.answers);
    state.resolution = engine.resolveWinner(state.scores);
    changeStage('calculating');
    timer = setTimeout(() => {
      timer = null;
      if (state.stage !== 'calculating') return;
      if (state.resolution.status === 'winner') {
        state.winner = state.resolution.god;
        changeStage('result');
      } else {
        state.bonusOptions = engine.shuffledTieOptions(data, state.resolution.candidates);
        state.selectedBonus = null;
        changeStage('tieBreaker');
      }
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1600);
  }
  function transitionScreen() {
    const screen = el('section', 'frame transition');
    corners(screen);
    const orbit = el('div', 'transition-orbit');
    orbit.setAttribute('aria-hidden', 'true');
    orbit.append(el('span', '', '✦'));
    screen.append(orbit, el('h2', '', ui.transition.line1), ornament(),
      el('p', '', ui.transition.line2));
    return screen;
  }
  function tieBreakerScreen() {
    const panel = el('section', 'parchment bonus-panel');
    panel.append(ornament(), el('h2', '', ui.tieBreaker.eyebrow),
      el('p', 'question-text', ui.tieBreaker.question));
    const options = el('div', 'options');
    state.bonusOptions.forEach((option, index) => {
      options.append(optionButton('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[index], option.text,
        state.selectedBonus === option.god, () => {
          state.selectedBonus = option.god;
          render();
        }));
    });
    panel.append(options);
    const actions = el('div', 'question-actions');
    const reveal = button(`${ui.question.finish}  →`, 'primary', () => {
      state.winner = state.selectedBonus;
      changeStage('result');
    });
    reveal.disabled = !state.selectedBonus;
    actions.append(reveal);
    panel.append(actions);
    return panel;
  }
  function illustratedBanner(god, result) {
    const banner = el('aside', 'result-banner');
    banner.setAttribute('aria-label', `Arte do chalé de ${result.god}`);
    const windowNode = el('div', 'banner-window');
    const image = el('img');
    image.src = `assets/banners/${god}.png`;
    image.alt = '';
    image.loading = 'eager';
    windowNode.append(image);
    const caption = el('div', 'banner-caption');
    caption.append(el('span', 'banner-name', result.god), el('span', 'banner-number', `CHALÉ ${result.cabin}`));
    banner.append(windowNode, caption);
    return banner;
  }
  function resultScreen() {
    const result = data.results[state.winner];
    const layout = el('article', 'result-layout');
    layout.dataset.cabin = state.winner;
    layout.append(illustratedBanner(state.winner, result));
    const paper = el('div', 'result-paper');
    const header = el('header', 'result-header');
    header.append(el('div', 'eyebrow result-kicker', ui.reveal.eyebrow),
      el('h1', 'result-god', result.god),
      el('div', 'result-cabin', `CHALÉ ${result.cabin}`), ornament());
    paper.append(header, el('h2', 'result-headline', result.headline));
    paper.append(el('p', 'result-parent', result.parentLine));
    const prose = el('div', 'result-prose');
    for (const paragraph of result.paragraphs) prose.append(el('p', '', paragraph));
    paper.append(prose);
    const panels = el('div', 'result-panels');
    const strength = el('section', 'trait-panel');
    strength.append(el('h3', '', ui.result.strength), el('p', '', result.strength));
    const heel = el('section', 'trait-panel');
    heel.append(el('h3', '', ui.result.achillesHeel), el('p', '', result.achillesHeel));
    panels.append(strength, heel);
    paper.append(panels);
    const secondary = engine.secondaryAffinity(data, state.scores, state.winner);
    if (secondary) {
      const block = el('section', 'secondary-affinity');
      block.append(el('h3', '', ui.result.secondaryAffinity), el('p', '', secondary.message));
      paper.append(block);
    }
    const actions = el('div', 'result-actions');
    actions.append(button(ui.result.restart, 'secondary', reset));
    paper.append(actions);
    layout.append(paper);
    return layout;
  }
  function render() {
    app.replaceChildren(state.stage === 'intro' ? introScreen()
      : state.stage === 'question' ? questionScreen()
      : state.stage === 'calculating' ? transitionScreen()
      : state.stage === 'tieBreaker' ? tieBreakerScreen()
      : resultScreen());
  }
  render();
})();
