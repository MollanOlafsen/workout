// 28-dagersprogrammet. Endre tallene her for å justere planen.
//
// Øvelser: nøkkel -> navn og eventuell forklaring.
const EXERCISES = {
  pu: { name: 'Armhevinger' },
  pi: { name: 'Incline-armhevinger', hint: 'Hendene på en benk eller et trinn (lettere).' },
  pd: { name: 'Decline-armhevinger', hint: 'Føttene på en benk (tyngre).' },
  sq: { name: 'Knebøy' },
  lu: { name: 'Utfall', hint: 'Antallet gjelder per bein.' },
  pl: { name: 'Planke' },
  kn: { name: 'Høye kneløft' },
};

// Dagtyper: 'work' (trening), 'rest' (hvile), 'test' (maks-test), 'final' (slutt-test).
// Øvelser med repetisjoner: [nøkkel, sett, repetisjoner].
// Øvelser på tid:           [nøkkel, sekunder].
const PLAN = [
  { type: 'work', items: [['pu', 3, 8], ['sq', 3, 10], ['pl', 20]] },
  { type: 'work', items: [['pu', 3, 10], ['lu', 3, 10], ['pl', 25]] },
  { type: 'work', items: [['pu', 3, 10], ['sq', 3, 12], ['kn', 20]] },
  { type: 'rest' },
  { type: 'work', items: [['pu', 3, 12], ['lu', 3, 12], ['pl', 30]] },
  { type: 'work', items: [['pi', 3, 12], ['sq', 3, 15], ['kn', 25]] },
  { type: 'test' },
  { type: 'rest' },
  { type: 'work', items: [['pu', 3, 12], ['sq', 3, 15], ['pl', 35]] },
  { type: 'work', items: [['pu', 4, 12], ['lu', 3, 15], ['pl', 40]] },
  { type: 'work', items: [['pu', 4, 12], ['sq', 3, 18], ['kn', 35]] },
  { type: 'rest' },
  { type: 'work', items: [['pi', 4, 12], ['sq', 3, 18], ['kn', 40]] },
  { type: 'work', items: [['pu', 4, 15], ['sq', 4, 15], ['pl', 45]] },
  { type: 'test' },
  { type: 'rest' },
  { type: 'work', items: [['pd', 4, 15], ['sq', 4, 15], ['kn', 45]] },
  { type: 'work', items: [['pu', 5, 12], ['lu', 4, 15], ['pl', 50]] },
  { type: 'work', items: [['pu', 5, 15], ['sq', 4, 18], ['pl', 55]] },
  { type: 'rest' },
  { type: 'work', items: [['pi', 5, 15], ['sq', 4, 18], ['kn', 50]] },
  { type: 'work', items: [['pu', 5, 18], ['sq', 4, 20], ['pl', 60]] },
  { type: 'work', items: [['pd', 5, 18], ['lu', 4, 20], ['kn', 60]] },
  { type: 'rest' },
  { type: 'work', items: [['pu', 6, 15], ['sq', 5, 18], ['pl', 65]] },
  { type: 'work', items: [['pu', 6, 18], ['lu', 5, 18], ['pl', 70]] },
  { type: 'work', items: [['pi', 6, 20], ['sq', 5, 20], ['kn', 70]] },
  { type: 'final' },
];
