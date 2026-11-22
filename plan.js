// 28-dagersprogrammet. Endre tallene her for å justere planen.
//
// Øvelser: nøkkel -> navn, kort forklaring og trenertips.
//   how:   kort om bevegelsen (vises alltid øverst på kortet)
//   steps: slik gjør du det, steg for steg
//   easy:  lettere variant for nybegynnere
//   breath, avoid: pust og vanlige feil
//   cue:   kort huskeregel som vises og leses opp i pausen før øvelsen
const EXERCISES = {
  pu: {
    name: 'Armhevinger',
    how: 'Du senker brystet mot gulvet og presser deg opp igjen, med kroppen rett som en planke.',
    steps: [
      'Hendene rett under skuldrene, litt bredere enn skuldrene, fingrene peker fram.',
      'Albuene går skrått bakover, omtrent 45 grader ut fra kroppen. Hold dem nær kroppen, ikke rett ut til sidene.',
      'Stram mage og rumpe, så kroppen er rett fra hodet og ned. Ikke la hoftene henge.',
      'Senk deg rolig til brystet er en knyttneve over gulvet, og press deg opp igjen.',
    ],
    easy: 'Helt utrent? Start med knærne i gulvet, gjerne med et håndkle under. Kroppen skal fortsatt være rett fra knærne til hodet. Er det for tungt, ta dem stående med hendene mot en vegg eller kjøkkenbenken.',
    breath: 'Pust inn på vei ned, pust ut når du presser opp.',
    avoid: 'Hoftene henger, rumpa stikker opp, eller hodet faller fram. Se på gulvet litt foran hendene.',
    cue: 'Albuene inntil kroppen, stram mage. Start gjerne på knærne.',
  },
  pi: {
    name: 'Incline-armhevinger',
    hint: 'Hendene på en benk eller et trinn (lettere).',
    how: 'Armhevinger med hendene høyere enn føttene. Det gjør øvelsen lettere og er perfekt for å bygge styrke.',
    steps: [
      'Sett hendene på noe som står stødig: kjøkkenbenken, et trappetrinn eller en solid stol mot veggen.',
      'Gå bakover med føttene til kroppen er rett og skrå, fra hodet til hælene.',
      'Albuene skrått bakover, omtrent 45 grader ut fra kroppen.',
      'Senk brystet mot kanten og press deg opp igjen.',
    ],
    easy: 'Jo høyere underlaget er, desto lettere. Er det tungt, bruk kjøkkenbenken eller veggen.',
    breath: 'Pust inn på vei ned, pust ut når du presser opp.',
    avoid: 'Hoftene henger eller du bøyer deg i livet. Hold kroppen stiv som en planke.',
    cue: 'Hendene på noe stødig, kroppen rett, albuene inntil kroppen.',
  },
  pd: {
    name: 'Decline-armhevinger',
    hint: 'Føttene på en benk (tyngre).',
    how: 'Armhevinger med føttene høyere enn hendene. Det er tyngre og gir mer arbeid for skuldre og bryst.',
    steps: [
      'Sett føttene på et lavt trinn eller en benk, og hendene i gulvet under skuldrene.',
      'Stram mage og rumpe, så kroppen er rett fra hælene til hodet.',
      'Albuene skrått bakover, omtrent 45 grader ut fra kroppen.',
      'Senk deg kontrollert og press deg opp igjen.',
    ],
    easy: 'For tungt? Bruk et lavere underlag, eller ta vanlige armhevinger eller armhevinger på knærne i stedet. Det teller like mye.',
    breath: 'Pust inn på vei ned, pust ut når du presser opp.',
    avoid: 'Hoftene synker og svaier ryggen. Kjenner du det i korsryggen, gå over til vanlige armhevinger.',
    cue: 'Føttene høyt, stram mage, ta det rolig ned.',
  },
  sq: {
    name: 'Knebøy',
    how: 'Du setter deg ned som på en usynlig stol og reiser deg opp igjen.',
    steps: [
      'Føttene i skulderbreddes avstand, tærne litt utover.',
      'Skyv rumpa bakover først, og bøy så knærne. Armene rett fram for balanse.',
      'Gå ned til lårene er omtrent vannrette, med knærne i ca. 90 grader, eller så langt du klarer med god teknikk.',
      'Hælene blir i gulvet og brystet peker fram. Press deg opp gjennom hælene.',
    ],
    easy: 'Sett deg på en stol og reis deg igjen, uten å ta tak med hendene. Det lærer deg bevegelsen trygt.',
    breath: 'Pust inn på vei ned, pust ut når du reiser deg.',
    avoid: 'Knærne faller innover, eller hælene løfter seg. Knærne skal peke samme vei som tærne.',
    cue: 'Rumpa bakover, hælene i gulvet, knærne over tærne.',
  },
  lu: {
    name: 'Utfall',
    hint: 'Antallet gjelder per bein.',
    how: 'Du tar et langt skritt fram og senker bakre kne mot gulvet, så går du tilbake.',
    steps: [
      'Stå oppreist og ta et langt skritt fram.',
      'Senk deg rett ned til begge knærne er i ca. 90 grader, og bakre kne er nesten i gulvet.',
      'Fremre kne skal være over ankelen, ikke langt foran tærne.',
      'Hold overkroppen rett og press deg tilbake med fremre hæl. Bytt bein.',
    ],
    easy: 'Hold deg i en stol eller vegg for balanse, og gå bare halvveis ned. Eller stå fast i utfallsstilling og gå bare opp og ned, uten å ta skritt.',
    breath: 'Pust inn på vei ned, pust ut på vei opp.',
    avoid: 'For korte skritt, så kneet skyter langt fram, eller at kneet faller innover.',
    cue: 'Langt skritt, rett ned, hold deg gjerne i en stol.',
  },
  pl: {
    name: 'Planke',
    how: 'Du holder kroppen rett og stille, støttet på underarmene og tærne.',
    steps: [
      'Albuene rett under skuldrene og underarmene i gulvet.',
      'Kroppen i én rett linje fra hodet til hælene.',
      'Stram magen som om noen skal dytte deg i den, og klem rumpa.',
      'Se ned i gulvet, med nakken i forlengelsen av ryggen.',
    ],
    easy: 'Start med knærne i gulvet, rett linje fra knærne til hodet. Del gjerne opp tiden: stopp klokka, hvil noen sekunder og fortsett.',
    breath: 'Ikke hold pusten. Pust rolig og jevnt hele tiden.',
    avoid: 'Hoftene henger (det kjennes i korsryggen) eller rumpa stikker opp. Kjenner du det i ryggen, stram magen eller gå ned på knærne.',
    cue: 'Albuene under skuldrene, stram mage, pust rolig.',
  },
  kn: {
    name: 'Høye kneløft',
    how: 'Du jogger på stedet og løfter knærne høyt, for å få opp pulsen.',
    steps: [
      'Stå oppreist og løft ett kne opp mot hoftehøyde, så det andre.',
      'Land mykt på forfoten.',
      'Bruk armene aktivt, som når du løper.',
      'Hold overkroppen rett, ikke len deg bakover.',
    ],
    easy: 'Gå på stedet i stedet for å jogge, og løft knærne rolig ett om gangen. Det viktigste er å holde det gående hele tiden.',
    breath: 'Pust jevnt. Du skal bli andpusten, men fortsatt klare å si noen ord.',
    avoid: 'Å lande tungt på hælene. Bruk sko eller en matte hvis gulvet er hardt.',
    cue: 'Knærne opp, land mykt, bruk armene. Gå på stedet om du trenger det.',
  },
};

// Trenerens ord øverst på treningsdagene, én per uke.
const COACH_WEEKS = [
  'Første uke handler om å lære bevegelsene. Gjør det sakte og riktig, og ta den lette varianten uten dårlig samvittighet. Teknikk før antall.',
  'Kroppen har begynt å venne seg til det. Klarer du ikke alle repetisjonene, gjør det du klarer med god form. Det teller like mye.',
  'Halvveis! Nå kan du prøve å gå et hakk opp: færre knær i gulvet, litt dypere knebøy. Men bare så lenge formen holder.',
  'Siste uke. Hold fokus på teknikken, så sitter resultatene. Du har gjort en kjempejobb så langt.',
];

// Vises før hver treningsøkt og test.
const WARMUP = [
  '30 sekunder marsj på stedet',
  '10 armsirkler forover og 10 bakover',
  '10 rolige halve knebøy',
  '10 hoftesirkler hver vei',
];

// Gjelder alle økter.
const SAFETY = 'Litt støl dagen etter er helt normalt. Skarp smerte, svimmelhet eller smerter i brystet betyr stopp.';

const REST_TIPS = [
  'Gå gjerne en rolig tur på 15–20 minutter.',
  'Tøy lett ut lår, legger, bryst og skuldre.',
  'Drikk nok vann og sov godt. Det er nå musklene bygges opp.',
];

const TEST_TIPS = [
  'Varm opp først, og hvil et par minutter før du starter.',
  'Velg samme variant hver gang, for eksempel på knærne, så du kan sammenligne resultatene.',
  'Stopp når teknikken svikter. Det er bare de gode repetisjonene som teller.',
];

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
