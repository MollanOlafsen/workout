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
      poses: pushupPoses([18, 70], [90, 70], [88, 45], [86, 61], [79, 63]),
    },
    // Incline-armhevinger: hendene på en benk
    pi: {
      dur: 2.2,
      props: [{ x: 80, y: 56, w: 26, h: 16 }],
      poses: pushupPoses([18, 70], [90, 56], [88, 31], [85, 46], [79, 50]),
    },
    // Decline-armhevinger: føttene på en benk
    pd: {
      dur: 2.2,
      props: [{ x: 8, y: 58, w: 26, h: 14 }],
      poses: pushupPoses([22, 57], [90, 70], [88, 45], [86, 60], [79, 63]),
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
          kneF: [34, 66.5], footF: [18, 70], kneB: [34, 66.5], footB: [18, 70],
          elbF: [84, 70], handF: [97, 70], elbB: [84, 70], handB: [97, 70],
        }),
        pose({
          head: [93, 52.5], sh: [84, 55.5], hip: [51, 62],
          kneF: [34, 66], footF: [18, 70], kneB: [34, 66], footB: [18, 70],
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

  // Lemmer: punktrekker som tegnes som streker. Bakerste først.
  var LIMBS = [
    { pts: ['hip', 'kneB', 'footB'], back: true },
    { pts: ['sh', 'elbB', 'handB'], back: true },
    { pts: ['sh', 'hip'] },
    { pts: ['hip', 'kneF', 'footF'] },
    { pts: ['sh', 'elbF', 'handF'] },
  ];

  function fmt(n) { return String(Math.round(n * 10) / 10); }

  function pointsFor(p, keys) {
    return keys.map(function (k) { return fmt(p[k][0]) + ',' + fmt(p[k][1]); }).join(' ');
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

  function animate(target, attr, a, b, dur) {
    target.appendChild(el('animate', {
      attributeName: attr,
      values: a + ';' + b + ';' + a,
      keyTimes: '0;0.5;1',
      calcMode: 'spline',
      keySplines: '0.45 0 0.55 1;0.45 0 0.55 1',
      dur: dur + 's',
      repeatCount: 'indefinite',
    }));
  }

  // Lager en <svg> for øvelsen, eller null om øvelsen ikke har figur.
  function create(key, label) {
    var def = DEFS[key];
    if (!def) return null;
    var A = def.poses[0], B = def.poses[1];
    var still = reducedMotion();

    var svg = el('svg', {
      viewBox: '0 0 120 80', class: 'figure', role: 'img',
      'aria-label': label || 'Figur som viser øvelsen',
    });

    svg.appendChild(el('line', { x1: 4, y1: GROUND, x2: 116, y2: GROUND, class: 'fig-ground' }));
    (def.props || []).forEach(function (r) {
      svg.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'fig-prop' }));
    });

    LIMBS.forEach(function (limb) {
      var a = pointsFor(A, limb.pts), b = pointsFor(B, limb.pts);
      var line = el('polyline', { points: still ? b : a, class: limb.back ? 'fig-limb back' : 'fig-limb' });
      if (!still) animate(line, 'points', a, b, def.dur);
      svg.appendChild(line);
    });

    var head = el('circle', { cx: fmt((still ? B : A).head[0]), cy: fmt((still ? B : A).head[1]), r: 5.5, class: 'fig-head' });
    if (!still) {
      animate(head, 'cx', fmt(A.head[0]), fmt(B.head[0]), def.dur);
      animate(head, 'cy', fmt(A.head[1]), fmt(B.head[1]), def.dur);
    }
    svg.appendChild(head);

    return svg;
  }

  return { create: create };
})();
