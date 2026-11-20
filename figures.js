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

  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  // Skoen peker fremover, vinkelrett på leggen. Holdes over bakken.
  function shoe(knee, foot) {
    var dx = foot[0] - knee[0], dy = foot[1] - knee[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var v = [dy / len, -dx / len];
    var heel = [foot[0] - v[0] * 1.5, foot[1] - v[1] * 1.5];
    var toe = [foot[0] + v[0] * 5, foot[1] + v[1] * 5];
    var lift = Math.max(heel[1], toe[1]) - (GROUND - 2);
    if (lift > 0) { heel[1] -= lift; toe[1] -= lift; }
    return [heel, toe];
  }

  // Regner ut hjelpepunktene (ermer, shortskanter, sko, hode) for én stilling.
  function derive(p) {
    var d = {};
    Object.keys(p).forEach(function (k) { d[k] = p[k]; });
    d.chest = lerp(p.sh, p.hip, 0.15);
    d.waist = lerp(p.hip, p.sh, 0.12);
    d.neck = lerp(p.sh, p.head, 0.45);
    d.sleeveF = lerp(p.sh, p.elbF, 0.55);
    d.sleeveB = lerp(p.sh, p.elbB, 0.55);
    d.shortsF = lerp(p.hip, p.kneF, 0.55);
    d.shortsB = lerp(p.hip, p.kneB, 0.55);
    var sf = shoe(p.kneF, p.footF), sb = shoe(p.kneB, p.footB);
    d.heelF = sf[0]; d.toeF = sf[1];
    d.heelB = sb[0]; d.toeB = sb[1];
    d.hair = [p.head[0] - 1.3, p.head[1] - 1.5];
    d.face = [p.head[0] + 0.5, p.head[1] + 0.3];
    return d;
  }

  // Deler av kroppen, bakerst først: [fra, til, stil, tykkelse].
  var PARTS = [
    ['kneB', 'footB', 'skin back', 6],
    ['heelB', 'toeB', 'shoe back', 4.5],
    ['hip', 'kneB', 'skin back', 8],
    ['hip', 'shortsB', 'shorts back', 9.5],
    ['elbB', 'handB', 'skin back', 4.6],
    ['sh', 'elbB', 'skin back', 5.6],
    ['sh', 'sleeveB', 'shirt back', 7],
    ['neck', 'sh', 'skin', 5],
    ['kneF', 'footF', 'skin', 6],
    ['heelF', 'toeF', 'shoe', 4.5],
    ['hip', 'kneF', 'skin', 8],
    ['hip', 'shortsF', 'shorts', 9.5],
    ['chest', 'hip', 'shirt', 12],
    ['waist', 'hip', 'shorts', 12.6],
    ['elbF', 'handF', 'skin', 4.6],
    ['sh', 'elbF', 'skin', 5.6],
    ['sh', 'sleeveF', 'shirt', 7],
  ];

  function fmt(n) { return String(Math.round(n * 10) / 10); }

  function seg(d, a, b) {
    return fmt(d[a][0]) + ',' + fmt(d[a][1]) + ' ' + fmt(d[b][0]) + ',' + fmt(d[b][1]);
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
    if (a === b) return;
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

  function circle(A, B, key, r, cls, still, dur) {
    var c = el('circle', { cx: fmt((still ? B : A)[key][0]), cy: fmt((still ? B : A)[key][1]), r: r, class: cls });
    if (!still) {
      animate(c, 'cx', fmt(A[key][0]), fmt(B[key][0]), dur);
      animate(c, 'cy', fmt(A[key][1]), fmt(B[key][1]), dur);
    }
    return c;
  }

  // Lager en <svg> for øvelsen, eller null om øvelsen ikke har figur.
  function create(key, label) {
    var def = DEFS[key];
    if (!def) return null;
    var A = derive(def.poses[0]), B = derive(def.poses[1]);
    var still = reducedMotion();

    var svg = el('svg', {
      viewBox: '0 0 120 80', class: 'figure', role: 'img',
      'aria-label': label || 'Figur som viser øvelsen',
    });

    svg.appendChild(el('ellipse', { cx: 60, cy: GROUND + 1, rx: 52, ry: 2.5, class: 'fig-ground' }));
    (def.props || []).forEach(function (r) {
      svg.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 2, class: 'fig-prop' }));
    });

    PARTS.forEach(function (part) {
      var a = seg(A, part[0], part[1]), b = seg(B, part[0], part[1]);
      var line = el('polyline', {
        points: still ? b : a, 'stroke-width': part[3],
        class: 'fig-part ' + part[2],
      });
      if (!still) animate(line, 'points', a, b, def.dur);
      svg.appendChild(line);
      if (part[1] === 'handF') svg.appendChild(circle(A, B, 'handF', 2.8, 'fig-fill skin', still, def.dur));
    });

    svg.appendChild(circle(A, B, 'hair', 6.6, 'fig-fill hair', still, def.dur));
    svg.appendChild(circle(A, B, 'face', 5.8, 'fig-fill skin', still, def.dur));

    return svg;
  }

  return { create: create };
})();
