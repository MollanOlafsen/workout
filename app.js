// Treningsapp for 28-dagersprogrammet. Ren JavaScript, ingen byggesteg.
// Fremgangen lagres i nettleseren (localStorage) på den enheten du bruker.

(function () {
  'use strict';

  var STORAGE_KEY = 'kalisthenics28';
  var TOTAL = PLAN.length;

  // ---- Lagring -----------------------------------------------------------

  // state.sets[dag][øvelsesindeks] = antall fullførte sett
  // state.done[dag] = ISO-dato dagen ble fullført
  // state.tests[dag] = antall armhevinger på maks-testen
  function emptyState() { return { v: 1, sets: {}, done: {}, tests: {} }; }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return emptyState();
      return { v: 1, sets: s.sets || {}, done: s.done || {}, tests: s.tests || {} };
    } catch (e) {
      return emptyState();
    }
  }

  var storageOk = true;
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      storageOk = false;
    }
  }

  var state = load();
  var viewDay = null;       // dagen som vises under «I dag»; null = gjeldende dag
  var confirmReset = false;

  // ---- Tale -----------------------------------------------------------------
  //
  // Appen leser opp pauser, nedtelling og neste sett med en norsk stemme
  // (Web Speech API). Kan slås av i toppen. iOS krever et trykk før første tale.

  var SPEECH_KEY = 'kalisthenics28-tale';
  var speechOn = (function () {
    try { return localStorage.getItem(SPEECH_KEY) !== 'av'; } catch (e) { return true; }
  })();
  var canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  var voice = null;
  var speechUnlocked = false;

  function pickVoice() {
    if (!canSpeak) return;
    var voices = window.speechSynthesis.getVoices() || [];
    var prefer = ['nb-NO', 'nb', 'no-NO', 'no', 'nn-NO', 'da-DK', 'sv-SE'];
    for (var i = 0; i < prefer.length && !voice; i++) {
      for (var j = 0; j < voices.length; j++) {
        var lang = (voices[j].lang || '').replace('_', '-');
        if (lang.toLowerCase().indexOf(prefer[i].toLowerCase()) === 0) { voice = voices[j]; break; }
      }
    }
  }
  if (canSpeak) {
    pickVoice();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  // interrupt: avbryt det som blir sagt nå (brukes til nedtellingstall).
  // Stavemåter som talemotoren uttaler riktig. «Armhevinger» ble lest som «uthevninger».
  var SPOKEN = [
    [/Incline-armhevinger/g, 'skrå arm-hevinger'],
    [/Decline-armhevinger/g, 'arm-hevinger med beina høyt'],
    [/[Aa]rmhevinger/g, 'arm-hevinger'],
    [/Høye kneløft/g, 'høye kne-løft'],
    [/høye kneløft/g, 'høye kne-løft'],
  ];
  function spoken(text) {
    SPOKEN.forEach(function (r) { text = text.replace(r[0], r[1]); });
    return text;
  }

  function say(text, interrupt) {
    if (!speechOn || !canSpeak) return;
    try {
      if (interrupt) window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(spoken(text));
      u.lang = voice ? voice.lang : 'nb-NO';
      if (voice) u.voice = voice;
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function unlockSpeech() {
    if (speechUnlocked || !canSpeak || !speechOn) return;
    speechUnlocked = true;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  document.addEventListener('click', unlockSpeech, true);
  document.addEventListener('touchend', unlockSpeech, true);

  function toggleSpeech() {
    speechOn = !speechOn;
    try { localStorage.setItem(SPEECH_KEY, speechOn ? 'på' : 'av'); } catch (e) {}
    if (!speechOn && canSpeak) window.speechSynthesis.cancel();
    else { speechUnlocked = false; unlockSpeech(); say('Tale er på'); }
    renderSpeechButton();
  }

  function renderSpeechButton() {
    var btn = document.getElementById('speech-toggle');
    if (!btn) return;
    btn.hidden = !canSpeak;
    btn.textContent = speechOn ? 'Tale på' : 'Tale av';
    btn.setAttribute('aria-pressed', speechOn ? 'true' : 'false');
  }

  // Sier nedtellingen ved 10, 3, 2 og 1 sekunder. Husker hva som er sagt.
  function countdownSpeech(obj, left) {
    var sec = Math.ceil(left);
    if (sec === obj.spoken) return;
    if (sec === 10 && obj.total > 25) { obj.spoken = sec; say('10 sekunder igjen', true); }
    else if (sec >= 1 && sec <= 3) { obj.spoken = sec; say(String(sec), true); }
  }

  function secondsText(n) { return n + ' sekunder'; }

  // ---- Klokke for øvelser på tid ------------------------------------------

  // Én klokke om gangen: { day, i, total, left (sekunder), endAt (ms) eller null når den står }
  var timer = null;
  var tickHandle = null;

  function timerFor(day, i) { return timer && timer.day === day && timer.i === i ? timer : null; }

  function timeLeft(t) {
    return t.endAt ? Math.max(0, (t.endAt - Date.now()) / 1000) : t.left;
  }

  function fmtClock(sec) {
    var s = Math.ceil(sec);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' + r : r);
  }

  function startTimer(day, i, total) {
    stopReps();
    stopRest();
    var t = timerFor(day, i);
    if (!t) { stopTicking(); t = timer = { day: day, i: i, total: total, left: total, endAt: null }; }
    if (t.left <= 0) t.left = total;
    var resumed = t.left < total;
    t.endAt = Date.now() + t.left * 1000;
    t.spoken = null;
    say(resumed ? 'Fortsett' : 'Start. ' + secondsText(total) + ' ' + EXERCISES[PLAN[day - 1].items[i][0]].name.toLowerCase(), true);
    startTicking();
    render();
  }

  function pauseTimer() {
    if (!timer || !timer.endAt) return;
    say('Stopp', true);
    timer.left = timeLeft(timer);
    timer.endAt = null;
    stopTicking();
    render();
  }

  function resetTimer() {
    stopTicking();
    timer = null;
    render();
  }

  function startTicking() {
    stopTicking();
    tickHandle = setInterval(onTick, 200);
  }

  function stopTicking() {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
  }

  function onTick() {
    if (!timer || !timer.endAt) return stopTicking();
    var left = timeLeft(timer);
    var face = document.getElementById('clock-face');
    if (face) face.textContent = fmtClock(left);
    if (left > 0) {
      if (!timer.half && timer.total >= 20 && left <= timer.total / 2) { timer.half = true; say('Halvveis', true); }
      countdownSpeech(timer, left);
      return;
    }
    var day = timer.day, i = timer.i;
    stopTicking();
    timer = null;
    say('Ferdig! Bra jobba.', true);
    signalDone();
    if (setsFor(day, i) < 1) tapSet(day, i, 1); else render();
  }

  // Kort pip og vibrasjon når tiden er ute.
  function signalDone() {
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
    if (speechOn && canSpeak) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [0, 0.25].forEach(function (at) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.25, ctx.currentTime + at);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.2);
      });
    } catch (e) {}
  }

  function clockBox(day, i, total) {
    var t = timerFor(day, i);
    var running = !!(t && t.endAt);
    var left = t ? timeLeft(t) : total;
    var buttons = [
      running
        ? h('button', { class: 'btn small', type: 'button', text: 'Stopp', onclick: pauseTimer })
        : h('button', { class: 'btn small', type: 'button', text: t && left < total ? 'Fortsett' : 'Start',
            onclick: function () { startTimer(day, i, total); } }),
    ];
    if (t) buttons.push(h('button', { class: 'btn ghost small', type: 'button', text: 'Nullstill', onclick: resetTimer }));
    return h('div', { class: 'clock' + (running ? ' running' : '') }, [
      h('div', { class: 'clock-face', id: running ? 'clock-face' : null, 'aria-live': 'off', text: fmtClock(left) }),
      h('div', { class: 'clock-buttons' }, buttons),
    ]);
  }

  // ---- Hjelpere ----------------------------------------------------------

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  function currentDay() {
    for (var d = 1; d <= TOTAL; d++) if (!state.done[d]) return d;
    return null; // alt fullført
  }

  function doneCount() { return Object.keys(state.done).length; }

  function setsFor(day, i) { return (state.sets[day] && state.sets[day][i]) || 0; }

  function targetSets(item) { return item.length === 3 ? item[1] : 1; }

  function allSetsDone(day) {
    var items = PLAN[day - 1].items;
    return items.every(function (item, i) { return setsFor(day, i) >= targetSets(item); });
  }

  function fmtDate(iso) {
    var p = iso.split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  }

  function todayIso() {
    var n = new Date();
    var m = String(n.getMonth() + 1), d = String(n.getDate());
    return n.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (d.length < 2 ? '0' + d : d);
  }

  var TYPE_LABEL = { work: 'Trening', rest: 'Hviledag', test: 'Maks-test', final: 'Slutt-test' };

  // ---- Handlinger --------------------------------------------------------

  function tapSet(day, i, n) {
    if (!state.sets[day]) state.sets[day] = {};
    var undo = setsFor(day, i) === n;
    state.sets[day][i] = undo ? n - 1 : n;
    save();
    if (undo) stopRest();
    else startRestAfter(day, i);
    render();
  }

  function completeDay(day) {
    if (timer && timer.day === day) { stopTicking(); timer = null; }
    stopRest();
    stopReps();
    state.done[day] = todayIso();
    save();
    var type = PLAN[day - 1].type;
    say(type === 'rest' ? 'God hvile.' : 'Bra jobba! Dag ' + day + ' er fullført.', true);
    viewDay = null;
    render();
    window.scrollTo(0, 0);
  }

  function undoDay(day) {
    delete state.done[day];
    save();
    render();
  }

  function saveTest(day, value) {
    var n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return;
    state.tests[day] = n;
    completeDay(day);
  }

  function resetAll() {
    state = emptyState();
    save();
    confirmReset = false;
    viewDay = null;
    location.hash = '#i-dag';
    render();
  }

  // ---- Pause mellom settene ----------------------------------------------

  var REST_SECONDS = 45;
  var rest = null;        // { endAt (ms), next (tekst) }
  var restHandle = null;

  // Starter pausen etter et sett. Neste sett kan være i samme øvelse eller neste øvelse.
  function startRestAfter(day, i) {
    var items = PLAN[day - 1].items;
    var next = null;
    for (var k = i; k < items.length; k++) {
      var have = setsFor(day, k), want = targetSets(items[k]);
      if (have < want) {
        var ex = EXERCISES[items[k][0]].name;
        next = items[k].length === 3 ? ex + ', sett ' + (have + 1) + ' av ' + want : ex;
        break;
      }
    }
    if (!next) { stopRest(); return; }
    rest = { endAt: Date.now() + REST_SECONDS * 1000, next: next, total: REST_SECONDS, spoken: null };
    say('Pause. ' + secondsText(REST_SECONDS) + '. Neste: ' + next + '.');
    if (restHandle) clearInterval(restHandle);
    restHandle = setInterval(onRestTick, 200);
  }

  function stopRest() {
    if (restHandle) clearInterval(restHandle);
    restHandle = null;
    rest = null;
    var bar = document.getElementById('rest-bar');
    if (bar) bar.remove();
  }

  function addRest(sec) {
    if (!rest) return;
    rest.endAt += sec * 1000;
    rest.total += sec;
    rest.spoken = null;
    say('15 sekunder ekstra', true);
    onRestTick();
  }

  function onRestTick() {
    if (!rest) return stopRest();
    var left = Math.max(0, (rest.endAt - Date.now()) / 1000);
    var face = document.getElementById('rest-face');
    if (face) face.textContent = fmtClock(left);
    if (left > 0) { countdownSpeech(rest, left); return; }
    var next = rest.next;
    stopRest();
    say('Kjør! ' + next, true);
    signalDone();
  }

  function restBar() {
    if (!rest) return null;
    var left = Math.max(0, (rest.endAt - Date.now()) / 1000);
    return h('div', { class: 'rest-bar', id: 'rest-bar', role: 'status' }, [
      h('div', { class: 'rest-text' }, [
        h('div', { class: 'kicker', text: 'Pause' }),
        h('div', { class: 'rest-next', text: 'Neste: ' + rest.next }),
      ]),
      h('div', { class: 'rest-face', id: 'rest-face', text: fmtClock(left) }),
      h('div', { class: 'rest-buttons' }, [
        h('button', { class: 'btn ghost small', type: 'button', text: '+15 s', onclick: function () { addRest(15); } }),
        h('button', { class: 'btn small', type: 'button', text: 'Hopp over', onclick: function () {
          var next = rest && rest.next;
          stopRest();
          if (next) say('Kjør! ' + next, true);
        } }),
      ]),
    ]);
  }

  // ---- Telling av repetisjoner ---------------------------------------------
  //
  // Trykk på et sett for å starte. Stemmen teller hver repetisjon i fast takt,
  // settet krysses av etter siste repetisjon, og så starter pausen.

  var TEMPO_KEY = 'kalisthenics28-takt';
  var tempo = (function () {
    try { var v = parseFloat(localStorage.getItem(TEMPO_KEY)); return v >= 1.5 && v <= 4 ? v : 2.5; }
    catch (e) { return 2.5; }
  })();
  var LEAD_IN = 3;   // sekunder fra «Klar» til første repetisjon
  var reps = null;   // { day, i, set, sets, total, count, nextAt }
  var repHandle = null;

  function startReps(day, i, setNo) {
    stopRest();
    stopReps();
    var item = PLAN[day - 1].items[i];
    reps = { day: day, i: i, set: setNo, sets: item[1], total: item[2], count: 0,
      nextAt: Date.now() + LEAD_IN * 1000 };
    var name = EXERCISES[item[0]].name;
    say(name + ', sett ' + setNo + '. ' + item[2] + ' repetisjoner. Klar.', true);
    repHandle = setInterval(onRepTick, 100);
    render();
  }

  function stopReps() {
    if (repHandle) clearInterval(repHandle);
    repHandle = null;
    reps = null;
    var bar = document.getElementById('rep-bar');
    if (bar) bar.remove();
  }

  function finishReps() {
    if (!reps) return;
    var day = reps.day, i = reps.i, setNo = reps.set;
    stopReps();
    say('Ferdig!', true);
    if (setsFor(day, i) < setNo) tapSet(day, i, setNo); else render();
  }

  function onRepTick() {
    if (!reps) return stopReps();
    if (Date.now() < reps.nextAt) return;
    reps.count++;
    reps.nextAt += tempo * 1000;
    say(String(reps.count), true);
    var face = document.getElementById('rep-face');
    if (face) face.textContent = reps.count + ' / ' + reps.total;
    if (reps.count >= reps.total) {
      clearInterval(repHandle);
      repHandle = setTimeout(finishReps, Math.min(1500, tempo * 1000));
    }
  }

  function changeTempo(delta) {
    tempo = Math.max(1.5, Math.min(4, Math.round((tempo + delta) * 2) / 2));
    try { localStorage.setItem(TEMPO_KEY, String(tempo)); } catch (e) {}
    var t = document.getElementById('rep-tempo');
    if (t) t.textContent = fmtTempo();
  }

  function fmtTempo() { return String(tempo).replace('.', ',') + ' s'; }

  function repBar() {
    if (!reps) return null;
    var name = EXERCISES[PLAN[reps.day - 1].items[reps.i][0]].name;
    return h('div', { class: 'rest-bar rep-bar', id: 'rep-bar', role: 'status' }, [
      h('div', { class: 'rest-text' }, [
        h('div', { class: 'kicker', text: 'Sett ' + reps.set + ' av ' + reps.sets }),
        h('div', { class: 'rest-next', text: name }),
      ]),
      h('div', { class: 'rest-face', id: 'rep-face', text: reps.count + ' / ' + reps.total }),
      h('div', { class: 'rest-buttons' }, [
        h('button', { class: 'btn ghost small', type: 'button', text: 'Avbryt', onclick: function () { stopReps(); say('Avbrutt', true); render(); } }),
        h('button', { class: 'btn small', type: 'button', text: 'Ferdig nå', onclick: finishReps }),
      ]),
      h('div', { class: 'tempo' }, [
        h('span', { text: 'Takt' }),
        h('button', { class: 'tempo-btn', type: 'button', 'aria-label': 'Raskere takt', text: '−', onclick: function () { changeTempo(-0.5); } }),
        h('span', { id: 'rep-tempo', class: 'tempo-val', text: fmtTempo() }),
        h('button', { class: 'tempo-btn', type: 'button', 'aria-label': 'Roligere takt', text: '+', onclick: function () { changeTempo(0.5); } }),
      ]),
    ]);
  }

  // ---- Hold skjermen våken ------------------------------------------------
  //
  // Bruker Screen Wake Lock der nettleseren støtter det. Ellers spilles en
  // liten, stum video i løkke, som også hindrer skjermen i å slukke.

  var wakeLock = null;
  var wakeVideo = null;

  function keepAwake() {
    if (document.visibilityState !== 'visible') return;
    if ('wakeLock' in navigator) {
      if (wakeLock) return;
      navigator.wakeLock.request('screen').then(function (lock) {
        wakeLock = lock;
        lock.addEventListener('release', function () { wakeLock = null; });
      }).catch(function () { videoFallback(); });
      return;
    }
    videoFallback();
  }

  function videoFallback() {
    try {
      if (!wakeVideo) {
        wakeVideo = document.createElement('video');
        wakeVideo.setAttribute('playsinline', '');
        wakeVideo.setAttribute('muted', '');
        wakeVideo.setAttribute('aria-hidden', 'true');
        wakeVideo.muted = true;
        wakeVideo.loop = true;
        wakeVideo.src = 'nosleep.mp4';
        wakeVideo.className = 'nosleep';
        document.body.appendChild(wakeVideo);
      }
      var p = wakeVideo.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  // Må startes av et trykk første gang; fornyes når appen kommer tilbake i forgrunnen.
  document.addEventListener('click', keepAwake, true);
  document.addEventListener('touchend', keepAwake, true);
  document.addEventListener('visibilitychange', keepAwake);

  // ---- Visning: I dag ----------------------------------------------------

  function renderDay(root) {
    var cur = currentDay();
    var day = viewDay || cur;

    if (!day) {
      root.appendChild(h('div', { class: 'day-head' }, [
        h('div', { class: 'kicker', text: 'Alle 28 dager' }),
        h('h1', { text: 'Fullført' }),
        h('p', { text: 'Programmet er gjennomført. Resultatene dine ligger under Oversikt.' }),
      ]));
      root.appendChild(h('a', { class: 'link', href: '#oversikt', text: 'Se oversikten' }));
      return;
    }

    var entry = PLAN[day - 1];
    var isTest = entry.type === 'test' || entry.type === 'final';
    var done = state.done[day];

    root.appendChild(h('div', { class: 'day-head' }, [
      h('div', { class: 'kicker' + (isTest ? ' test' : ''), text: TYPE_LABEL[entry.type] }),
      h('h1', { text: 'Dag ' + day }),
      cur && day !== cur
        ? h('button', { class: 'btn ghost small', type: 'button', text: 'Til dagens økt (dag ' + cur + ')',
            onclick: function () { viewDay = null; render(); } })
        : null,
    ]));

    if (entry.type === 'work') {
      entry.items.forEach(function (item, i) {
        var ex = EXERCISES[item[0]];
        var timed = item.length === 2;
        var target = timed ? item[1] + ' s' : item[1] + ' × ' + item[2];
        var n = targetSets(item);
        var have = setsFor(day, i);
        var buttons = [];
        for (var s = 1; s <= n; s++) {
          (function (s) {
            buttons.push(h('button', {
              class: 'set', type: 'button',
              'aria-pressed': have >= s ? 'true' : 'false',
              'aria-label': ex.name + ', ' + (timed ? item[1] + ' sekunder' : 'sett ' + s + ' av ' + n),
              text: timed ? item[1] + ' s' : String(item[2]),
              onclick: function () {
                if (!timed && have < s && !state.done[day]) startReps(day, i, have + 1);
                else tapSet(day, i, s);
              },
            }));
          })(s);
        }
        root.appendChild(h('section', { class: 'card' }, [
          h('div', { class: 'ex-top' }, [
            FIGURES.create(item[0], ex.name + ', vist med en figur'),
            h('div', { class: 'ex-text' }, [
              h('div', { class: 'ex-head' }, [
                h('div', { class: 'ex-name', text: ex.name }),
                h('div', { class: 'ex-target', text: target }),
              ]),
              ex.hint ? h('p', { class: 'hint', text: ex.hint }) : null,
            ]),
          ]),
          timed ? clockBox(day, i, item[1]) : null,
          h('div', { class: 'sets' }, buttons),
        ]));
      });

      if (done) {
        root.appendChild(doneRow(day, done));
      } else {
        var ready = allSetsDone(day);
        root.appendChild(h('button', {
          class: 'btn', type: 'button', disabled: !ready,
          text: ready ? 'Fullfør dag ' + day : 'Kryss av alle sett først',
          onclick: function () { completeDay(day); },
        }));
      }
      return;
    }

    if (entry.type === 'rest') {
      root.appendChild(h('section', { class: 'card rest' }, [
        h('h2', { text: 'Ingen trening i dag' }),
        h('p', { text: 'Hviledagen er en del av programmet.' }),
        done ? null : h('button', { class: 'btn', type: 'button', text: 'Marker som fullført',
          onclick: function () { completeDay(day); } }),
      ]));
      if (done) root.appendChild(doneRow(day, done));
      return;
    }

    // Maks-test og slutt-test
    var input = h('input', {
      type: 'number', id: 'test-input', inputmode: 'numeric', min: '0', step: '1',
      value: state.tests[day] !== undefined ? String(state.tests[day]) : null,
    });
    root.appendChild(h('section', { class: 'card test' }, [
      h('div', { class: 'ex-top' }, [
        FIGURES.create('pu', 'Armhevinger, vist med en figur'),
        h('h2', { text: 'Maks armhevinger' }),
      ]),
      h('p', { text: 'Ta så mange armhevinger du klarer på rad, og skriv inn antallet.' }),
      h('div', { class: 'row' }, [
        h('label', { for: 'test-input', text: 'Antall' }),
        input,
        h('button', { class: 'btn', type: 'button', text: done ? 'Oppdater' : 'Lagre',
          onclick: function () { saveTest(day, input.value); } }),
      ]),
    ]));
    if (done) root.appendChild(doneRow(day, done));
  }

  function doneRow(day, iso) {
    return h('div', { class: 'row' }, [
      h('p', { class: 'done-note', text: 'Fullført ' + fmtDate(iso) }),
      h('button', { class: 'btn ghost small', type: 'button', text: 'Angre',
        onclick: function () { undoDay(day); } }),
    ]);
  }

  // ---- Visning: Oversikt -------------------------------------------------

  function renderOverview(root) {
    var cur = currentDay();
    var n = doneCount();

    root.appendChild(h('div', { class: 'day-head' }, [
      h('div', { class: 'kicker', text: 'Fremgang' }),
      h('h1', { text: n + ' av ' + TOTAL }),
    ]));

    var fill = h('div');
    fill.style.width = Math.round((n / TOTAL) * 100) + '%';
    root.appendChild(h('div', {
      class: 'bar', role: 'progressbar',
      'aria-valuemin': '0', 'aria-valuemax': String(TOTAL), 'aria-valuenow': String(n),
      'aria-label': 'Fullførte dager',
    }, [fill]));

    var SHORT = { rest: 'Hvile', test: 'Test', final: 'Test' };
    var cells = PLAN.map(function (entry, idx) {
      var day = idx + 1;
      var cls = 'cell';
      if (entry.type === 'test' || entry.type === 'final') cls += ' test';
      if (state.done[day]) cls += ' done';
      if (day === cur) cls += ' current';
      var label = 'Dag ' + day + ', ' + TYPE_LABEL[entry.type] +
        (state.done[day] ? ', fullført' : '') + (day === cur ? ', dagens økt' : '');
      return h('button', {
        class: cls, type: 'button', 'aria-label': label,
        onclick: function () { viewDay = day; location.hash = '#i-dag'; render(); window.scrollTo(0, 0); },
      }, [
        h('span', { text: String(day) }),
        SHORT[entry.type] ? h('small', { text: SHORT[entry.type] }) : null,
      ]);
    });
    root.appendChild(h('div', { class: 'grid' }, cells));
    root.appendChild(h('p', { class: 'hint', text: 'Mørk = fullført. Gullramme = dagens økt. Trykk på en dag for å åpne den.' }));

    root.appendChild(h('h2', { text: 'Maks armhevinger' }));
    var testDays = [];
    PLAN.forEach(function (entry, idx) {
      if (entry.type === 'test' || entry.type === 'final') testDays.push(idx + 1);
    });
    root.appendChild(h('div', { class: 'results' }, testDays.map(function (d) {
      var v = state.tests[d];
      return h('div', { class: 'result' }, [
        h('div', { class: 'lbl', text: 'Dag ' + d }),
        h('div', { class: 'num', text: v !== undefined ? String(v) : '–' }),
      ]);
    })));

    var recorded = testDays.filter(function (d) { return state.tests[d] !== undefined; });
    if (recorded.length >= 2) {
      var first = state.tests[recorded[0]];
      var last = state.tests[recorded[recorded.length - 1]];
      var diff = last - first;
      root.appendChild(h('p', {
        text: 'Endring fra dag ' + recorded[0] + ' til dag ' + recorded[recorded.length - 1] + ': ' +
          (diff > 0 ? '+' : '') + diff + ' armhevinger.',
      }));
    }

    if (!storageOk) {
      root.appendChild(h('p', { class: 'hint', text: 'Nettleseren lar ikke appen lagre fremgangen. Den forsvinner når siden lukkes.' }));
    }

    if (confirmReset) {
      root.appendChild(h('section', { class: 'card' }, [
        h('p', { text: 'Dette sletter all fremgang og alle testresultater.' }),
        h('div', { class: 'row' }, [
          h('button', { class: 'btn small', type: 'button', text: 'Ja, start på nytt', onclick: resetAll }),
          h('button', { class: 'btn ghost small', type: 'button', text: 'Avbryt',
            onclick: function () { confirmReset = false; render(); } }),
        ]),
      ]));
    } else {
      root.appendChild(h('button', { class: 'btn ghost small', type: 'button', text: 'Start programmet på nytt',
        onclick: function () { confirmReset = true; render(); } }));
    }
  }

  // ---- Ruting ------------------------------------------------------------

  function render() {
    var route = location.hash === '#oversikt' ? 'oversikt' : 'i-dag';
    var root = document.getElementById('view');
    root.textContent = '';
    if (route === 'oversikt') renderOverview(root); else renderDay(root);
    ['rest-bar', 'rep-bar'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old) old.remove();
    });
    var bar = repBar() || restBar();
    if (bar) document.body.appendChild(bar);

    document.getElementById('count').textContent = doneCount() + ' / ' + TOTAL;
    ['i-dag', 'oversikt'].forEach(function (r) {
      var tab = document.getElementById('tab-' + r);
      if (r === route) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    });
  }

  window.addEventListener('hashchange', function () { confirmReset = false; render(); });
  var speechBtn = document.getElementById('speech-toggle');
  if (speechBtn) speechBtn.addEventListener('click', toggleSpeech);
  renderSpeechButton();
  render();
})();
