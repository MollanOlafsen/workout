// Små animerte figurer som viser hver øvelse.
// Hver øvelse har to stillinger (A og B). Figuren glir frem og tilbake mellom dem.
// Koordinatene er i et 120 × 80-rutenett, sett fra siden med ansiktet mot høyre.
// Bakerste arm og bein tegnes lysere enn de fremste.

var FIGURES = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var GROUND = 72;

  // Én stilling: punkt = [x, y].
  // head, sh (skulder), hip, kneF/footF og kneB/footB (fremre og bakre bein),
  // elbF/handF og elbB/handB (fremre og bakre arm).
  function pose(p) { return p; }

  // Armhevinger med hendene i bakken. Rett kropp fra føttene til skuldrene.
  function pushupPoses(feet, hands, upSh, downSh, downElb) {
    function along(sh, t) {
      return [feet[0] + (sh[0] - feet[0]) * t, feet[1] + (sh[1] - feet[1]) * t];
    }
    function make(sh, elb) {
      var hip = along(sh, 0.5), knee = along(sh, 0.25);
      var head = [sh[0] + 9, sh[1] - 3];
      return pose({
        head: head, sh: sh, hip: hip,
        kneF: knee, footF: feet, kneB: knee, footB: feet,
        elbF: elb, handF: hands, elbB: elb, handB: hands,
      });
    }
    var upElb = [(upSh[0] + hands[0]) / 2, (upSh[1] + hands[1]) / 2];
    return [make(upSh, upElb), make(downSh, downElb)];
  }

  var DEFS = {
    // Armhevinger
    pu: {
      dur: 2.2,
      poses: pushupPoses([18, 66], [90, 70], [88, 45], [86, 61], [79, 63]),
    },
    // Incline-armhevinger: hendene på en benk
    pi: {
      dur: 2.2,
      props: [{ x: 80, y: 56, w: 26, h: 16 }],
      poses: pushupPoses([18, 66], [90, 56], [88, 31], [85, 46], [79, 50]),
    },
    // Decline-armhevinger: føttene på en benk
    pd: {
      dur: 2.2,
      props: [{ x: 8, y: 58, w: 26, h: 14 }],
      poses: pushupPoses([22, 53], [90, 70], [88, 45], [86, 60], [79, 63]),
    },
    // Knebøy
    sq: {
      dur: 2.4,
      poses: [
        pose({
          head: [59, 14], sh: [59, 22], hip: [59, 42],
          kneF: [61, 57], footF: [62, 72], kneB: [58, 57], footB: [58, 72],
          elbF: [67, 25], handF: [77, 26], elbB: [66, 26], handB: [75, 27],
        }),
        pose({
          head: [61, 31], sh: [57, 38], hip: [47, 56],
          kneF: [65, 57], footF: [62, 72], kneB: [62, 59], footB: [58, 72],
          elbF: [67, 38], handF: [78, 38], elbB: [66, 39], handB: [76, 39],
        }),
      ],
    },
    // Utfall
    lu: {
      dur: 2.4,
      poses: [
        pose({
          head: [55, 16], sh: [55, 24], hip: [55, 44],
          kneF: [63, 58], footF: [70, 72], kneB: [45, 58], footB: [36, 72],
          elbF: [61, 33], handF: [59, 43], elbB: [49, 33], handB: [51, 43],
        }),
        pose({
          head: [54, 28], sh: [54, 36], hip: [53, 56],
          kneF: [69, 56], footF: [70, 72], kneB: [46, 69], footB: [36, 72],
          elbF: [60, 45], handF: [58, 55], elbB: [48, 45], handB: [50, 55],
        }),
      ],
    },
    // Planke på underarmene. Rolig pust, nesten stille.
    pl: {
      dur: 3,
      poses: [
        pose({
          head: [93, 53], sh: [84, 56], hip: [51, 63],
          kneF: [34, 64.5], footF: [18, 66], kneB: [34, 64.5], footB: [18, 66],
          elbF: [84, 70], handF: [97, 70], elbB: [84, 70], handB: [97, 70],
        }),
        pose({
          head: [93, 52.5], sh: [84, 55.5], hip: [51, 62],
          kneF: [34, 64], footF: [18, 66], kneB: [34, 64], footB: [18, 66],
          elbF: [84, 70], handF: [97, 70], elbB: [84, 70], handB: [97, 70],
        }),
      ],
    },
    // Høye kneløft: løping på stedet
    kn: {
      dur: 0.9,
      poses: [
        pose({
          head: [60, 15], sh: [60, 23], hip: [60, 43],
          kneF: [72, 38], footF: [69, 53], kneB: [61, 57], footB: [60, 71],
          elbF: [55, 32], handF: [51, 40], elbB: [66, 31], handB: [72, 24],
        }),
        pose({
          head: [60, 15], sh: [60, 23], hip: [60, 43],
          kneF: [61, 57], footF: [60, 71], kneB: [72, 38], footB: [69, 53],
          elbF: [66, 31], handF: [72, 24], elbB: [55, 32], handB: [51, 40],
        }),
      ],
    },
  };

  // ---- Tegning ----------------------------------------------------------
  //
  // Kroppen bygges av avsmalnende «kapsler» (to sirkler med ulik radius og
  // flaten mellom dem), slik at lår, legger og armer får form.
  // Figuren tegnes på nytt hvert bilde, så bevegelsen blir jevn.

  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function add(a, v, s) { return [a[0] + v[0] * s, a[1] + v[1] * s]; }
  function unit(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / l, dy / l];
  }
  // Vinkelrett på en retning, mot «forsiden» (mot høyre når figuren står).
  function front(u) { return [-u[1], u[0]]; }

  // Skoen peker fremover, vinkelrett på leggen. Holdes over bakken.
  function shoe(knee, foot) {
    var v = front(unit(foot, knee));
    var heel = add(foot, v, -1.2), toe = add(foot, v, 4.6);
    var lift = Math.max(heel[1], toe[1]) - (GROUND - 1.8);
    if (lift > 0) { heel[1] -= lift; toe[1] -= lift; }
    return [heel, toe];
  }

  // Regner ut hjelpepunktene for én stilling.
  function derive(p) {
    var d = {};
    Object.keys(p).forEach(function (k) { d[k] = p[k]; });
    var up = unit(p.hip, p.sh), f = front(up);
    d.chest = lerp(p.sh, p.hip, 0.2);
    d.waist = lerp(p.hip, p.sh, 0.18);
    d.neck = lerp(p.sh, p.head, 0.5);
    d.hiA = add(lerp(p.sh, p.hip, 0.22), f, 2.4);
    d.hiB = add(lerp(p.sh, p.hip, 0.7), f, 2.1);
    d.sleeveF = lerp(p.sh, p.elbF, 0.5);
    d.sleeveB = lerp(p.sh, p.elbB, 0.5);
    d.shortsF = lerp(p.hip, p.kneF, 0.55);
    d.shortsB = lerp(p.hip, p.kneB, 0.55);
    var sf = shoe(p.kneF, p.footF), sb = shoe(p.kneB, p.footB);
    d.heelF = sf[0]; d.toeF = sf[1]; d.heelB = sb[0]; d.toeB = sb[1];
    var hu = unit(p.sh, p.head), hf = front(hu);
    d.hair = add(add(p.head, hf, -1.1), hu, 0.9);
    d.face = add(p.head, hf, 0.35);
    d.ear = add(p.head, hf, -0.9);
    d.nose = add(add(p.head, hf, 5.3), hu, -0.4);
    return d;
  }

  // Kroppsdeler, bakerst først.
  // ['c', fra, radius, til, radius, farge] = kapsel, ['o', punkt, radius, farge] = sirkel.
  var PARTS = [
    ['c', 'kneB', 3.0, 'footB', 2.0, 'skin-b'],
    ['c', 'heelB', 1.8, 'toeB', 1.6, 'shoe-b'],
    ['c', 'hip', 4.6, 'kneB', 3.2, 'skin-b'],
    ['c', 'hip', 4.9, 'shortsB', 4.0, 'shorts-b'],
    ['c', 'elbB', 2.2, 'handB', 1.6, 'skin-b'],
    ['o', 'handB', 2.0, 'skin-b'],
    ['c', 'sh', 2.9, 'elbB', 2.2, 'skin-b'],
    ['c', 'sh', 3.4, 'sleeveB', 3.0, 'shirt-b'],
    ['c', 'sh', 2.1, 'neck', 2.0, 'skin'],
    ['c', 'kneF', 3.0, 'footF', 2.0, 'skin'],
    ['c', 'heelF', 1.8, 'toeF', 1.6, 'shoe'],
    ['c', 'hip', 4.6, 'kneF', 3.2, 'skin'],
    ['c', 'chest', 5.4, 'waist', 4.5, 'shirt'],
    ['c', 'hiA', 1.3, 'hiB', 1.0, 'shirt-hi'],
    ['c', 'waist', 4.6, 'hip', 4.9, 'shorts'],
    ['c', 'hip', 4.9, 'shortsF', 4.0, 'shorts'],
    ['o', 'hair', 5.7, 'hair'],
    ['o', 'face', 5.2, 'skin'],
    ['o', 'nose', 1.1, 'skin'],
    ['o', 'ear', 1.3, 'ear'],
    ['c', 'sh', 2.9, 'elbF', 2.2, 'skin'],
    ['c', 'sh', 3.4, 'sleeveF', 3.0, 'shirt'],
    ['c', 'elbF', 2.2, 'handF', 1.6, 'skin'],
    ['o', 'handF', 2.0, 'skin'],
  ];

  function fmt(n) { return String(Math.round(n * 100) / 100); }
  function pt(p) { return fmt(p[0]) + ' ' + fmt(p[1]); }

  function circlePath(c, r) {
    return 'M' + pt([c[0] - r, c[1]]) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0' +
      'a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z';
  }

  function capsulePath(a, ra, b, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy);
    if (l < 0.01) return circlePath(a, Math.max(ra, rb));
    var n = [-dy / l, dx / l];
    return 'M' + pt(add(a, n, ra)) + 'L' + pt(add(b, n, rb)) +
      'A' + rb + ' ' + rb + ' 0 0 0 ' + pt(add(b, n, -rb)) +
      'L' + pt(add(a, n, -ra)) +
      'A' + ra + ' ' + ra + ' 0 0 0 ' + pt(add(a, n, ra)) + 'Z';
  }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function mix(A, B, t) {
    var p = {};
    Object.keys(A).forEach(function (k) { p[k] = lerp(A[k], B[k], t); });
    return p;
  }

  function draw(fig, t) {
    var d = derive(mix(fig.A, fig.B, t));
    PARTS.forEach(function (part, i) {
      fig.paths[i].setAttribute('d', part[0] === 'c'
        ? capsulePath(d[part[1]], part[2], d[part[3]], part[4])
        : circlePath(d[part[1]], part[2]));
    });
  }

  // Én felles animasjonsløkke for alle figurer på siden.
  var live = [];
  var running = false;
  function tick(now) {
    live = live.filter(function (fig) { return fig.svg.isConnected; });
    live.forEach(function (fig) {
      var phase = (now / 1000 / fig.dur) % 1;
      draw(fig, (1 - Math.cos(phase * 2 * Math.PI)) / 2);
    });
    if (live.length) requestAnimationFrame(tick); else running = false;
  }

  // Lager en <svg> for øvelsen, eller null om øvelsen ikke har figur.
  // opts.pose: 0 eller 1 tegner én fast stilling (brukes til forhåndsvisning).
  function create(key, label, opts) {
    var def = DEFS[key];
    if (!def) return null;
    opts = opts || {};

    var svg = el('svg', {
      viewBox: '0 0 120 80', class: 'figure', role: 'img',
      'aria-label': label || 'Figur som viser øvelsen',
    });
    svg.appendChild(el('ellipse', { cx: 60, cy: GROUND + 1, rx: 50, ry: 2.4, class: 'fig-ground' }));
    (def.props || []).forEach(function (r) {
      svg.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 2, class: 'fig-prop' }));
    });

    var fig = { svg: svg, A: def.poses[0], B: def.poses[1], dur: def.dur, paths: [] };
    PARTS.forEach(function (part) {
      var path = el('path', { class: 'fig-' + part[part.length - 1] });
      fig.paths.push(path);
      svg.appendChild(path);
    });

    var fixed = opts.pose !== undefined ? opts.pose : (reducedMotion() ? 1 : null);
    draw(fig, fixed === null ? 0 : fixed);
    if (fixed === null) {
      live.push(fig);
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    return svg;
  }

  return { create: create };
})();
