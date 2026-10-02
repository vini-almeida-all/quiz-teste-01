(function (root) {
  'use strict';

  function calculateScores(data, answers) {
    const scores = Object.fromEntries(
      Object.keys(data.results).map(god => [god, { total: 0, primaryHits: 0, structural: 0 }]),
    );
    const structural = new Set(data.structuralQuestions);
    for (const question of data.questions) {
      const option = answers[question.id];
      if (!option) throw new Error(`Resposta ausente: ${question.id}`);
      const allocations = data.scoringMatrix[question.id]?.[option];
      if (!allocations) throw new Error(`Resposta inválida: ${question.id}/${option}`);
      for (const { god, points } of allocations) {
        scores[god].total += points;
        if (points === 3) scores[god].primaryHits += 1;
        if (structural.has(question.id)) scores[god].structural += points;
      }
    }
    return scores;
  }

  function resolveWinner(scores) {
    let candidates = Object.keys(scores);
    for (const field of ['total', 'primaryHits', 'structural']) {
      const highest = Math.max(...candidates.map(god => scores[god][field]));
      candidates = candidates.filter(god => scores[god][field] === highest);
      if (candidates.length === 1) return { status: 'winner', god: candidates[0], criterion: field };
    }
    return { status: 'needsTieBreaker', candidates };
  }

  function secondaryAffinity(data, scores, winner) {
    const otherGods = Object.keys(data.results).filter(god => god !== winner);
    const highest = Math.max(...otherGods.map(god => scores[god].total));
    const runnersUp = otherGods.filter(god => scores[god].total === highest);
    if (runnersUp.length !== 1) return null;
    const difference = scores[winner].total - highest;
    if (difference > 3 || difference < 0) return null;
    const god = runnersUp[0];
    const name = data.results[god].god;
    let message;
    if (difference <= 1) message = `Por muito pouco, ${name} não pediu uma revisão na sua árvore genealógica.`;
    else if (difference === 2) message = `Aliás, ${name} também parece ter uma reivindicação bastante convincente sobre você.`;
    else message = `Você também demonstra uma afinidade considerável com o Chalé de ${name}.`;
    return { god, difference, message };
  }

  function shuffledTieOptions(data, candidates, random = Math.random) {
    const options = candidates.map(god => {
      const option = data.tieBreakerOptions[god];
      if (!option) throw new Error(`Alternativa bônus ausente: ${god}`);
      return option;
    });
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }

  const engine = { calculateScores, resolveWinner, secondaryAffinity, shuffledTieOptions };
  root.QuizEngine = engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
})(typeof window !== 'undefined' ? window : globalThis);
