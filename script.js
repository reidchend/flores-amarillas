(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };

  /* ============================ Utilidades ============================ */

  var FW = 430, FH = 560;

  function lin(a, b, t) { return a + (b - a) * t; }
  function backOut(c) { var c1 = 1.70158, c3 = c1 + 1, t = c - 1; return 1 + c3 * t * t * t + c1 * t * t; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  // T se actualiza cada frame en stepFlor
  var T = 0;
  function prog(s, d) {
    if (T < s) return 0;
    if (T >= s + d) return 1;
    return (T - s) / d;
  }
  function progBack(s, d) {
    var p = prog(s, d);
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return backOut(p);
  }

  var C = {
    petA: "#f0a800", petM: "#ffd23e", petT: "#fff0a8",
    stem: "#4f7c2f", stemD: "#37631f",
    leaf: "#6fae56", leafD: "#3a6622",
    roseD: "#e8a21c", roseM: "#f5b41c",
    center: "#8a5a1e", centerD: "#593110", seed: "#2c1703",
    stroke: "#c98a10", stam: "#a86e00", anther: "#7a4a1e",
    gold: "#ffe98a",
  };

  /* ============================ Motor de la flor ============================ */

  var florCv = $("#florCanvas"), fctx = florCv.getContext("2d");
  florCv.width = FW * 2; florCv.height = FH * 2;
  fctx.scale(2, 2);

  var flor = { tipo: null, t0: 0, on: false, maxD: 3.6 };

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MAXD = { girasol: 3.7, "tulipán": 3.5, rosa: 3.8, lirio: 3.6 };
  var MAXD_FAST = 0.55;

  /* ---------- ayudantes de dibujo ---------- */

  function gradV2(x0, y0, x1, y1, s0, s1, s2, p2) {
    var g = fctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, s0);
    g.addColorStop(p2 || 0.55, s1);
    g.addColorStop(1, s2 === undefined ? s1 : s2);
    return g;
  }

  function pathLen(x0, y0, cx, my, y1) {
    var n = 40, L = 0, px = x0, py = y0;
    for (var i = 1; i <= n; i++) {
      var t = i / n, u = 1 - t;
      var x = u * u * x0 + 2 * u * t * cx + t * t * x0;
      var y = u * u * y0 + 2 * u * t * my + t * t * y1;
      L += Math.hypot(x - px, y - py);
      px = x; py = y;
    }
    return L;
  }

  function tallo(x0, y0, cxm, cym, y1, lw, s, d) {
    var p = prog(s, d);
    if (p <= 0) return;
    var L = pathLen(x0, y0, cxm, cym, y1);
    fctx.save();
    fctx.lineCap = "round";
    fctx.strokeStyle = gradV2(0, y0, 0, y1, C.stem, C.stem); // la curva define el color
    fctx.lineWidth = lw;
    fctx.beginPath();
    fctx.moveTo(x0, y0);
    fctx.quadraticCurveTo(cxm, cym, x0, y1);
    fctx.setLineDash([L * p, L * 8]);
    fctx.stroke();
    fctx.restore();
  }

  function hoja(x0, y0, angRad, dir, L, W, s, d) {
    var p = progBack(s, d);
    if (p <= 0) return;
    fctx.save();
    fctx.translate(x0, y0);
    fctx.rotate(angRad);
    fctx.rotate((1 - p) * 0.85 * dir); // desplegarse
    fctx.scale(p, p);
    fctx.beginPath();
    fctx.moveTo(0, 0);
    fctx.bezierCurveTo(-W * 0.6, L * 0.28, -W * 0.95, L * 0.62, 0, L);
    fctx.bezierCurveTo(W * 0.95, L * 0.62, W * 0.6, L * 0.28, 0, 0);
    fctx.closePath();
    fctx.fillStyle = C.leaf;
    fctx.strokeStyle = C.leafD;
    fctx.lineWidth = 1.6;
    fctx.fill();
    fctx.stroke();
    fctx.beginPath();
    fctx.moveTo(0, 0);
    fctx.quadraticCurveTo(0, L * 0.5, 0, L);
    fctx.strokeStyle = "rgba(58,102,34,0.45)";
    fctx.lineWidth = 1;
    fctx.stroke();
    fctx.restore();
  }

  function petalShape(w, len, tipBend) {
    var tb = tipBend * len * 0.10;
    fctx.beginPath();
    fctx.moveTo(0, 0);
    fctx.bezierCurveTo(-w * 1.05, -len * 0.35, -w * 0.62, -len * 0.88, tb, -len);
    fctx.bezierCurveTo(w * 0.62, -len * 0.88, w * 1.05, -len * 0.35, 0, 0);
    fctx.closePath();
  }

  function dibPetalRot(cx, cy, angRad, w, len, tipBend, fillA, s, d) {
    var p = progBack(s, d);
    if (p <= 0) return;
    var alpha = clamp((p - 0.04) / 0.1, 0, 1);
    fctx.save();
    fctx.translate(cx, cy);
    fctx.rotate(angRad);
    fctx.rotate(-(1 - p) * 0.16);
    fctx.scale(p, p);
    petalShape(w, len, tipBend);
    fctx.fillStyle = gradV2(0, 0, 0, -len, fillA[0], fillA[1], fillA[2]);
    fctx.strokeStyle = C.stroke;
    fctx.lineWidth = 1.3;
    fctx.globalAlpha = alpha;
    fctx.fill();
    fctx.stroke();
    fctx.restore();
  }

  function disco(cx, cy, R, s) {
    var p = progBack(s, 0.55);
    if (p <= 0) return;
    fctx.save();
    fctx.translate(cx, cy);
    fctx.scale(p, p);
    var g = fctx.createRadialGradient(-R * 0.32, -R * 0.34, R * 0.12, 0, 0, R);
    g.addColorStop(0, C.center);
    g.addColorStop(1, C.centerD);
    fctx.beginPath();
    fctx.arc(0, 0, R, 0, 6.2832);
    fctx.fillStyle = g;
    fctx.fill();
    fctx.strokeStyle = "rgba(42,20,2,0.5)";
    fctx.lineWidth = 1.4;
    fctx.stroke();
    fctx.restore();
  }

  function semillas(cx, cy, n, r0, r1, s) {
    for (var i = 0; i < n; i++) {
      var p = progBack(s + (i % 4) * 0.06, 0.4);
      if (p <= 0) continue;
      var ang = i * (6.2832 / n) + 0.35;
      var rr = lin(r0, r1, (i % 4) / 3);
      fctx.save();
      fctx.translate(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang));
      fctx.beginPath();
      fctx.arc(0, 0, 1.8, 0, 6.2832);
      fctx.fillStyle = C.seed;
      fctx.fill();
      fctx.restore();
    }
  }

  function chispas(cx, cy, rmin, rmax, n, s, step) {
    for (var i = 0; i < n; i++) {
      var st = s + i * (step || 0.05);
      var p = progBack(st, 0.5);
      if (p <= 0) continue;
      var ang = i * 2.399963 + 0.5;
      var rr = lin(rmin, rmax, (i % 7) / 6) * (0.8 + 0.2 * Math.sin(st * 7));
      var tw = 0.55 + 0.45 * Math.sin((st + i) * 9 + T * 2.8);
      fctx.save();
      fctx.translate(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang) * 0.9);
      fctx.rotate(ang);
      fctx.beginPath();
      fctx.moveTo(0, -3.4 * p);
      fctx.lineTo(1.3 * p, -1.1 * p);
      fctx.lineTo(3.4 * p, 0);
      fctx.lineTo(1.3 * p, 1.1 * p);
      fctx.lineTo(0, 3.4 * p);
      fctx.lineTo(-1.3 * p, 1.1 * p);
      fctx.lineTo(-3.4 * p, 0);
      fctx.lineTo(-1.3 * p, -1.1 * p);
      fctx.closePath();
      fctx.fillStyle = C.gold;
      fctx.globalAlpha = tw;
      fctx.fill();
      fctx.restore();
    }
  }

  function halo(cx, cy, r) {
    var p = clamp(T / (flor.maxD - 0.6), 0, 1);
    var g = fctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(255,210,62," + (0.10 + p * 0.08) + ")");
    g.addColorStop(1, "rgba(255,210,62,0)");
    fctx.beginPath();
    fctx.arc(cx, cy, r, 0, 6.2832);
    fctx.fillStyle = g;
    fctx.fill();
  }

  /* ---------- las cuatro flores ---------- */

  function drGirasol() {
    halo(150, 160, 150);
    tallo(150, 478, 143, 300, 168, 5.2, 0.12, 0.9);
    hoja(150, 432, -2.05, 1, 72, 40, 0.55, 0.62);
    hoja(150, 396, -1.05, -1, 62, 34, 0.8, 0.62);
    for (var i = 0; i < 16; i++) {
      dibPetalRot(150, 150, (-90 + i * 22.5) * 0.0174533, 20, 82, 0.4, [C.petA, C.petM, C.petT], 1.35 + i * 0.075, 0.5);
    }
    disco(150, 150, 30, 2.65);
    semillas(150, 150, 16, 9, 24, 2.85);
    chispas(150, 150, 42, 92, 14, 3.1);
  }

  function tulPetal(shape, s, d) {
    var p = progBack(s, d);
    if (p <= 0) return;
    var alpha = clamp((p - 0.05) / 0.1, 0, 1);
    var g = shape === 2
      ? gradV2(0, 0, 0, -160, C.petT, C.petT, "#fff9dd")
      : gradV2(0, 0, 0, -140, C.petA, C.petM, C.petT);
    fctx.save();
    fctx.translate(150, 300);
    fctx.scale(1, p);
    fctx.globalAlpha = alpha;
    fctx.beginPath();
    if (shape === 0) {
      fctx.moveTo(-6, -4);
      fctx.bezierCurveTo(-30, -20, -44, -56, -38, -100);
      fctx.bezierCurveTo(-22, -120, 2, -132, 8, -116);
      fctx.bezierCurveTo(10, -92, 6, -48, 2, -4);
    } else if (shape === 1) {
      fctx.moveTo(6, -4);
      fctx.bezierCurveTo(30, -20, 44, -56, 38, -100);
      fctx.bezierCurveTo(22, -120, -2, -132, -8, -116);
      fctx.bezierCurveTo(-10, -92, -6, -48, -2, -4);
    } else {
      fctx.moveTo(0, 8);
      fctx.bezierCurveTo(-5, -36, -12, -106, -4, -152);
      fctx.bezierCurveTo(4, -114, 0, -42, -2, -10);
    }
    fctx.closePath();
    fctx.fillStyle = g;
    fctx.strokeStyle = C.stroke;
    fctx.lineWidth = 1.4;
    fctx.fill();
    fctx.stroke();
    fctx.restore();
  }

  function drTulip() {
    halo(150, 200, 130);
    tallo(150, 478, 158, 362, 296, 5, 0.12, 0.8);
    hoja(150, 462, -2.3, 1, 84, 42, 0.5, 0.6);
    hoja(150, 420, -0.9, -1, 68, 36, 0.72, 0.6);
    tulPetal(0, 1.45, 0.62);
    tulPetal(1, 1.62, 0.62);
    tulPetal(2, 1.92, 0.7);
    disco(150, 300, 11, 2.3);
    chispas(150, 160, 40, 84, 10, 2.75);
  }

  function drRosa() {
    halo(150, 160, 140);
    tallo(150, 478, 162, 380, 292, 5, 0.12, 0.9);
    hoja(150, 456, -2.15, 1, 78, 40, 0.5, 0.6);
    hoja(150, 366, -1.2, -1, 64, 34, 0.78, 0.6);
    for (var i = 0; i < 22; i++) {
      var col = i < 5 ? [C.roseD, C.roseM] : i < 11 ? [C.roseM, C.petM] : i < 17 ? [C.petM, C.petT] : [C.petT, C.petM];
      dibPetalRot(150, 170, i * 2.399963, 13, 30, 0.2, [col[0], col[1], col[1]], 1.3 + i * 0.09, 0.42);
    }
    disco(150, 170, 14, 3.35);
    chispas(150, 170, 40, 86, 12, 3.45);
  }

  function petalLil(w, len) {
    fctx.beginPath();
    fctx.moveTo(0, 0);
    fctx.bezierCurveTo(-w * 1.05, -len * 0.42, -w * 1.0, -len * 0.85, -w * 0.42, -len * 1.06);
    fctx.bezierCurveTo(-w * 0.12, -len * 1.12, w * 0.12, -len * 1.12, w * 0.42, -len * 1.06);
    fctx.bezierCurveTo(w * 1.0, -len * 0.85, w * 1.05, -len * 0.42, 0, 0);
    fctx.closePath();
  }

  function dibPetalLil(cx, cy, angRad, w, len, tipBend, fillA, s, d) {
    var p = progBack(s, d);
    if (p <= 0) return;
    var alpha = clamp((p - 0.04) / 0.1, 0, 1);
    var rec = lin(-0.5, 0, p);
    fctx.save();
    fctx.translate(cx, cy);
    fctx.rotate(angRad);
    fctx.rotate(rec);
    fctx.scale(p, p);
    petalLil(w, len);
    fctx.fillStyle = gradV2(0, 0, 0, -len, fillA[0], fillA[1], fillA[2]);
    fctx.strokeStyle = C.stroke;
    fctx.lineWidth = 1.3;
    fctx.globalAlpha = alpha;
    fctx.fill();
    fctx.stroke();
    fctx.restore();
  }

  function estambre(x1, sx, s, d) {
    var p = prog(s, d);
    if (p <= 0) return;
    fctx.save();
    fctx.lineCap = "round";
    fctx.strokeStyle = C.stam;
    fctx.lineWidth = 2;
    fctx.beginPath();
    fctx.moveTo(150, 256);
    fctx.lineTo(x1, 256 - lin(0, 76, p) * Math.sin(0.3));
    fctx.stroke();
    var a2 = progBack(s + 0.18, 0.4);
    if (a2 > 0) {
      fctx.beginPath();
      fctx.arc(x1, 256 - lin(0, 76, p) * Math.sin(0.3), 3, 0, 6.2832);
      fctx.fillStyle = C.anther;
      fctx.fill();
    }
    fctx.restore();
  }

  function drLirio() {
    halo(150, 190, 140);
    tallo(150, 478, 140, 340, 248, 5, 0.12, 0.95);
    hoja(150, 452, -2.1, 1, 82, 40, 0.55, 0.6);
    hoja(150, 340, -1.0, -1, 60, 32, 0.8, 0.6);
    for (var i = 0; i < 6; i++) {
      var ang = (-90 + (i - 2.5) * 24) * 0.0174533;
      dibPetalLil(150, 256, ang, 15, 96, 0, [C.petA, C.petM, C.petT], 1.5 + i * 0.12, 0.6);
    }
    estambre(150, 0, 2.45, 0.5);
    estambre(158, -6, 2.6, 0.5);
    estambre(142, 6, 2.6, 0.5);
    disco(150, 254, 9, 2.7);
    chispas(150, 160, 40, 78, 8, 2.95);
  }

  var DRAW = { girasol: drGirasol, "tulipán": drTulip, rosa: drRosa, lirio: drLirio };

  function construirFlor(tipo) {
    flor.tipo = tipo;
    flor.on = true;
    flor.t0 = performance.now();
    flor.maxD = reduce ? MAXD_FAST : MAXD[tipo];
    hiloCam();
    return flor.maxD;
  }

  function stepFlor(now) {
    if (!flor.on) return;
    var t = (now - flor.t0) / 1000;
    T = reduce ? t * 10 : t;
    fctx.clearRect(0, 0, FW, FH);
    fctx.globalAlpha = 1;
    var s = Math.sin(now * 0.0013);
    fctx.save();
    fctx.translate(FW / 2 - 150, 0); // centra el eje 150 en el lienzo (FW/2 = 215)
    fctx.translate(150, 475);
    fctx.rotate(s * 0.016);
    fctx.translate(-150, -475);
    DRAW[flor.tipo]();
    fctx.restore();
  }

  /* ============================ Pétalos ambientales ============================ */

  var cv = $("#petalCanvas"), ctx = cv.getContext("2d");
  var petalos = [], pointer = null;

  function resizeCv() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCv);
  window.addEventListener("pointermove", function (e) { pointer = { x: e.clientX, y: e.clientY }; });
  window.addEventListener("pointerleave", function () { pointer = null; });

  var PALETAS = ["#ffd23e", "#f5b41c", "#ffe98a", "#f0b400"];

  function crearPeta() {
    return {
      x: Math.random() * cv.width,
      y: -30 - Math.random() * 60,
      vy: 0.6 + Math.random() * 1.1,
      vx: (Math.random() - 0.5) * 0.6,
      r: 6 + Math.random() * 6,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.02,
      c: PALETAS[Math.floor(Math.random() * PALETAS.length)],
    };
  }

  function hiloCam() {
    for (var i = 0; i < 4; i++) petalos.push(crearPeta());
  }

  function dibujarPeta(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    var h = c.r * 2.4, w = c.r;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w * 0.7, -h * 0.45, w * 0.7, h * 0.15, 0, h * 0.55);
    ctx.bezierCurveTo(-w * 0.7, h * 0.15, -w * 0.7, -h * 0.45, 0, -h);
    ctx.fillStyle = c.c;
    ctx.globalAlpha = 0.72;
    ctx.fill();
    ctx.restore();
  }

  function bucle(t) {
    if (!reduce) {
      var v = Math.sin(t * 0.0012) * 0.5 + Math.sin(t * 0.0007) * 0.3;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < petalos.length; i++) {
        var c = petalos[i];
        c.x += c.vx + v;
        c.y += c.vy;
        c.rot += c.vr;
        if (pointer) {
          var dx = c.x - pointer.x, dy = c.y - pointer.y;
          var ds = Math.sqrt(dx * dx + dy * dy);
          if (ds < 150 && ds > 0.01) {
            var f = (1 - ds / 150) * 2.4;
            c.x += (dx / ds) * f;
            c.y += (dy / ds) * f * 0.4 - 0.12;
          }
        }
        if (c.y > cv.height + 40 || c.x < -60 || c.x > cv.width + 60) {
          c.x = Math.random() * cv.width;
          c.y = -30 - Math.random() * 80;
        }
        dibujarPeta(c);
      }
    }
    stepFlor(t);
    requestAnimationFrame(bucle);
  }

  resizeCv();
  hiloCam();
  requestAnimationFrame(bucle);

  /* ============================ Tarjetas (miniaturas SVG) ============================ */

  var D = function (d, dur) { return ' style="--d:' + d + 's;--dur:' + (dur || 0.8) + 's"'; };

  function girMini() {
    var s =
      '<path class="stem drawable" d="M150 478 C 149 420 147 320 150 192" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" d="M150 430 C 120 428 100 420 92 406 C 112 394 138 402 150 420 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>" +
      '<circle class="center drawable" cx="150" cy="150" r="30" fill="#7a4a1e" stroke="#4a2a0c"' + D(1.05, 0.85) + "/>";
    var pt = "";
    for (var i = 0; i < 14; i++) {
      pt += '<g transform="rotate(' + i * 25.714 + ' 150 150)"><path class="petal drawable" d="M150 168 C 139 139 141 116 150 94 C 159 116 161 139 150 168 Z" fill="#ffd23e" stroke="#d99b22"' + D(0.85 + i * 0.07, 0.55) + "/></g>";
    }
    return wrapMini(s, pt, "", 150, 150);
  }
  function tulMini() {
    var s =
      '<path class="stem drawable" d="M150 478 C 158 420 140 340 148 292" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" d="M150 470 C 110 456 88 416 92 380 C 114 380 142 404 150 436 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>";
    var pt =
      '<path class="petal drawable" d="M136 296 C 112 282 96 244 100 200 C 120 180 148 172 152 186 C 154 212 150 252 149 296 Z" fill="#ffd23e" stroke="#d99b22"' + D(0.85, 0.6) + "/>" +
      '<path class="petal drawable" d="M164 296 C 188 282 204 244 200 200 C 180 180 152 172 148 186 C 146 212 150 252 151 296 Z" fill="#ffd23e" stroke="#d99b22"' + D(0.95, 0.6) + "/>" +
      '<path class="petal drawable" d="M150 306 C 148 268 136 200 146 150 C 154 184 149 258 150 302 Z" fill="#ffe98a" stroke="#d99b22"' + D(1.05, 0.6) + "/>";
    return wrapMini(s, pt, "", 150, 270);
  }
  function rosMini() {
    var s =
      '<path class="stem drawable" d="M150 478 C 162 428 138 360 148 292" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" d="M150 452 C 120 444 102 424 102 404 C 126 402 146 422 150 446 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>";
    var pt = "";
    for (var i = 0; i < 12; i++) {
      var ang = i * 137.5, rad = 28 + i * 8;
      pt += '<g transform="rotate(' + ang.toFixed(1) + ' 150 170) translate(0 ' + rad + ')"><path class="petal drawable" d="M150 176 C 141 162 140 136 150 122 C 160 136 159 162 150 176 Z" fill="#e8a21c" stroke="#c88a10"' + D(0.75 + i * 0.09, 0.5) + "/></g>";
    }
    return wrapMini(s, pt, "", 150, 170);
  }
  function lilMini() {
    var s =
      '<path class="stem drawable" d="M150 478 C 143 380 159 300 150 246" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" d="M150 434 C 126 428 110 414 108 400 C 128 392 142 402 150 420 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>";
    var pt = "";
    var angs = [-75, -45, -15, 15, 45, 75];
    for (var i = 0; i < angs.length; i++) {
      pt += '<g transform="rotate(' + angs[i] + ' 150 250)"><path class="petal drawable" d="M147 250 C 133 222 125 186 120 158 C 126 140 140 132 150 138 C 148 168 146 210 150 244 Z" fill="#ffd23e" stroke="#d99b22"' + D(0.9 + i * 0.1, 0.55) + "/></g>";
    }
    return wrapMini(s, pt, "", 150, 250);
  }
  function wrapMini(base, pet, extra, ox, oy) {
    return '<svg class="flor" viewBox="0 0 300 480"><g class="petals">' + base + "<g>" + pet + "</g>" + extra + "</g></svg>";
  }

  var GENERADORES = { girasol: girMini, "tulipán": tulMini, rosa: rosMini, lirio: lilMini };

  function sembrarTarjetas() {
    var cajas = document.querySelectorAll(".card-svg");
    for (var i = 0; i < cajas.length; i++) {
      var t = cajas[i].getAttribute("data-flor");
      cajas[i].innerHTML = GENERADORES[t]();
    }
  }

  /* ============================ Escenas ============================ */

  var sc0 = $("#scene0"), sc1 = $("#scene1"), sc2 = $("#scene2");
  var florNombre = $("#florName");
  var nota = $("#note"), notaTxt = $("#noteText"), notaFade = $("#noteFade");

  var poolMensajes = [];

  function mostrar(sc, on) {
    sc.hidden = !on;
    sc.classList.toggle("scene--active", on);
  }

  var MENSAJES = [
    "Tu valor no lo mide un ramo, pero hoy uno entero se abrió solo para ti.",
    "Mereces florecer a tu propio ritmo, sin apuros y sin permiso.",
    "Hice esta página para recordarte que eres importante, aunque hoy no te lo dijeran.",
    "Alguien va a estar orgullosísimo de ti hoy. Empieza por ti.",
    "No necesitas flores para brillar, pero qué bien acompañan a la hora de creerlo.",
    "Está floreciendo aquí, ahora, delante de tus ojos. Igual que tú.",
    "Las flores se marchitan; lo que queda es cómo te hizo sentir este momento.",
    "Eres la parte protagonista de tu propia historia, no su decoración.",
    "Permítete recibir. Llevas tiempo dándolo todo, y esto es solo tuyo.",
    "Estás más cerca de tu propia primavera de lo que imaginas.",
    "Que este gesto te recuerde que también mereces que te cuiden.",
    "Sentirse olvidada no significa serlo. Aquí, hoy, alguien pensó en ti.",
  ];
  var FRASES_SUAVES = [
    "Guárdala para uno de esos días en los que dudes de ti.",
    "Puedes ponerla en tu galería: es tuya.",
    "Bórrala cuando quieras, pero que hoy te recuerde algo bonito.",
  ];

  function elegirMensaje() {
    if (!poolMensajes.length) poolMensajes = MENSAJES.slice();
    var i = Math.floor(Math.random() * poolMensajes.length);
    return poolMensajes.splice(i, 1)[0];
  }

  $("#btnStart").addEventListener("click", iniciar);
  $("#picker").addEventListener("click", function (e) {
    var card = e.target.closest(".flower-card");
    if (card) cultivar(card.getAttribute("data-flor"));
  });
  $("#btnAgain").addEventListener("click", volverAElegir);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !sc0.hidden) iniciar();
  });

  function iniciar() {
    musicaEmpezar();
    mostrar(sc0, false);
    mostrar(sc1, true);
  }

  function cultivar(tipo) {
    florActual = tipo;
    florNombre.textContent = "";
    nota.hidden = true;
    mostrar(sc1, false);
    mostrar(sc2, true);

    var maxD = construirFlor(tipo);
    florNombre.textContent = NOMBRES[tipo];

    var wait = reduce ? 1400 : (maxD + 0.9) * 1000;
    setTimeout(function () {
      notaTxt.textContent = NOMBRES[tipo] + " florece para ti. " + elegirMensaje();
      notaFade.textContent = FRASES_SUAVES[Math.floor(Math.random() * FRASES_SUAVES.length)];
      nota.hidden = false;
    }, wait);
  }

  function volverAElegir() {
    mostrar(sc2, false);
    mostrar(sc1, true);
    poolMensajes = [];
  }

  /* ============================ Certificado ============================ */

  var certOverlay = $("#certOverlay"), certCv = $("#certCanvas");
  var cctx = certCv.getContext("2d");

  function fechaHoy() {
    var d = new Date();
    var f = d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  function florCanvas(tipo, x, y, s) {
    cctx.save();
    cctx.translate(x, y);
    cctx.scale(s, s);
    if (tipo === "girasol") {
      for (var i = 0; i < 14; i++) {
        cctx.save();
        cctx.rotate((i * 25.714 * Math.PI) / 180);
        cctx.beginPath();
        cctx.moveTo(0, 0);
        cctx.quadraticCurveTo(-11, -20, 0, -40);
        cctx.quadraticCurveTo(11, -20, 0, 0);
        cctx.fillStyle = "#ffd23e";
        cctx.fill();
        cctx.restore();
      }
      cctx.beginPath();
      cctx.arc(0, 0, 13, 0, Math.PI * 2);
      cctx.fillStyle = "#593110";
      cctx.fill();
    } else if (tipo === "tulipán") {
      cctx.beginPath();
      cctx.moveTo(-14, 26);
      cctx.quadraticCurveTo(-22, -2, -8, -26);
      cctx.quadraticCurveTo(0, -20, 0, 24);
      cctx.fillStyle = "#ffd23e";
      cctx.fill();
      cctx.beginPath();
      cctx.moveTo(14, 26);
      cctx.quadraticCurveTo(22, -2, 8, -26);
      cctx.quadraticCurveTo(0, -20, 0, 24);
      cctx.fillStyle = "#f5b41c";
      cctx.fill();
    } else if (tipo === "rosa") {
      for (var k = 0; k < 12; k++) {
        var rad = 4 + k * 3.4;
        cctx.beginPath();
        cctx.arc(0, 0, rad, 0, Math.PI * 2);
        cctx.fillStyle = k < 8 ? "#f5b41c" : "#e8a21c";
        cctx.fill();
      }
      cctx.beginPath();
      cctx.arc(0, 0, 4, 0, Math.PI * 2);
      cctx.fillStyle = "#7a4a1e";
      cctx.fill();
    } else {
      var angs = [-72, -42, 0, 42, 72];
      for (var j = 0; j < angs.length; j++) {
        cctx.save();
        cctx.rotate((angs[j] * Math.PI) / 180);
        cctx.beginPath();
        cctx.moveTo(0, 0);
        cctx.bezierCurveTo(-6, -16, -8, -30, -2, -44);
        cctx.bezierCurveTo(4, -30, 4, -16, 0, 0);
        cctx.fillStyle = "#ffd23e";
        cctx.fill();
        cctx.restore();
      }
      cctx.beginPath();
      cctx.moveTo(0, 0);
      cctx.lineTo(0, -42);
      cctx.strokeStyle = "#a86e00";
      cctx.lineWidth = 2;
      cctx.stroke();
    }
    cctx.restore();
  }

  function pintarCert() {
    var W = 1000, H = 700;
    cctx.clearRect(0, 0, W, H);
    var g = cctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#fffbee");
    g.addColorStop(1, "#ffe6a0");
    cctx.fillStyle = g;
    cctx.fillRect(0, 0, W, H);

    cctx.strokeStyle = "#d9a21c";
    cctx.lineWidth = 3;
    cctx.strokeRect(28, 28, W - 56, H - 56);
    cctx.strokeStyle = "#e8c25c";
    cctx.lineWidth = 1.5;
    cctx.strokeRect(38, 38, W - 76, H - 76);

    cctx.textAlign = "center";
    cctx.fillStyle = "#8a5a12";
    cctx.font = "600 26px Georgia, serif";
    cctx.fillText("D Í A   D E   L A S   F L O R E S   A M A R I L L A S", W / 2, 108);

    cctx.fillStyle = "#b07600";
    cctx.font = "italic 500 34px Georgia, serif";
    cctx.fillText(fechaHoy(), W / 2, 152);

    cctx.fillStyle = "#4a3114";
    cctx.font = "italic 700 76px Georgia, serif";
    cctx.fillText("Para ti", W / 2, 300);

    florCanvas(florActual, W / 2, 468, 1);

    cctx.fillStyle = "#5c3f17";
    cctx.font = "italic 500 32px Georgia, serif";
    cctx.fillText("Porque mereces ser protagonista, y no espectadora.", W / 2, 576);

    var NOTA_SHORT = {
      girasol: "la que siempre mira hacia el sol",
      "tulipán": "la elegancia que se anuncia sola",
      rosa: "la amistad y la alegría",
      lirio: "la calma que se abre despacio",
    };
    cctx.fillStyle = "#7a5a2e";
    cctx.font = "italic 400 22px Georgia, serif";
    cctx.fillText(NOTA_SHORT[florActual] || "una flor amarilla plantada para ti", W / 2, 620);

    cctx.fillStyle = "#9a7a44";
    cctx.font = "400 17px Georgia, serif";
    cctx.fillText("Hecha con paciencia y código, para que nadie se quede sin flores", W / 2, 662);
  }

  $("#btnSave").addEventListener("click", function () {
    pintarCert();
    certOverlay.hidden = false;
    $("#certHint").textContent = "Esta flor y este texto son enteramente tuyos.";
  });
  $("#btnCloseCert").addEventListener("click", function () { certOverlay.hidden = true; });
  certOverlay.addEventListener("click", function (e) {
    if (e.target === certOverlay) certOverlay.hidden = true;
  });
  $("#btnDownload").addEventListener("click", function () {
    var a = document.createElement("a");
    a.download = "mi-flor-amarilla-" + new Date().toISOString().slice(0, 10) + ".png";
    a.href = certCv.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    mostrarToast("Imagen guardada. Que te recuerde lo que vales.");
  });

  /* ============================ Compartir ============================ */

  function mostrarToast(t) {
    var toast = $("#toast");
    toast.textContent = t;
    toast.classList.add("show");
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  $("#btnShare").addEventListener("click", function () {
    var texto = "Si alguien te olvidó hoy, esta página abre una flor amarilla solo para ti. " + location.href;
    if (navigator.share) {
      navigator.share({ title: "Una flor amarilla para ti", text: texto, url: location.href })
        .catch(function () { if (navigator.clipboard) copiar(texto); });
      return;
    }
    if (navigator.clipboard) copiar(texto);
    else mostrarToast("Comparte este enlace: " + location.href);
  });

  function copiar(t) {
    navigator.clipboard.writeText(t).then(function () {
      mostrarToast("Enlace copiado. Compártelo con quien lo necesite.");
    }, function () {
      mostrarToast("No pude copiar el enlace; puedes compartir la página copiando la url: " + location.href);
    });
  }

  /* ============================ Música ============================ */

  var actx = null, master = null, dly = null, musicOn = false, chordTimer = null, nextT = 0, chordIdx = 0;

  function notaFreq(base, semis) {
    return base * Math.pow(2, semis / 12);
  }

  function iniciarAudio() {
    if (actx) { if (actx.state === "suspended") actx.resume(); return; }
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.12;
    master.connect(actx.destination);
    dly = actx.createDelay(1);
    dly.delayTime.value = 0.42;
    var fb = actx.createGain();
    fb.gain.value = 0.34;
    var wet = actx.createGain();
    wet.gain.value = 0.4;
    dly.connect(fb);
    fb.connect(dly);
    dly.connect(wet);
    wet.connect(master);
    nextT = actx.currentTime + 0.2;
  }

  function acorde() {
    var bases = [261.63, 196.0, 220.0, 174.61, 261.63];
    var base = bases[chordIdx % bases.length];
    var f = [
      notaFreq(base, 0),
      notaFreq(base, 4),
      notaFreq(base, 7),
      notaFreq(base, 11.5),
    ];
    var t = nextT;
    for (var i = 0; i < f.length; i++) {
      var t0 = t + i * (0.38 + Math.random() * 0.14);
      for (var p = 0; p < 2; p++) {
        var o = actx.createOscillator();
        o.type = p === 0 ? "sine" : "triangle";
        o.frequency.value = f[i] * (p === 1 ? 2 : 1);
        var gn = actx.createGain();
        gn.gain.setValueAtTime(0.0001, t0);
        gn.gain.linearRampToValueAtTime(p === 0 ? 0.15 : 0.055, t0 + 0.08);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
        o.connect(gn);
        gn.connect(master);
        gn.connect(dly);
        o.start(t0);
        o.stop(t0 + 3);
      }
    }
    nextT = t + 2.5;
    chordIdx++;
  }

  function schedule() {
    while (nextT < actx.currentTime + 1.6) acorde();
  }

  function musicaEmpezar() {
    iniciarAudio();
    if (musicOn) return;
    musicOn = true;
    if (!chordTimer) {
      chordTimer = setInterval(schedule, 260);
      schedule();
    }
    setEstadoMusica();
  }

  function setEstadoMusica() {
    var b = $("#musicBtn");
    b.setAttribute("aria-pressed", String(musicOn));
    b.setAttribute("aria-label", musicOn ? "Silenciar música" : "Activar música suave");
    b.textContent = musicOn ? "Música ♫" : "Música";
  }

  $("#musicBtn").addEventListener("click", function () {
    iniciarAudio();
    if (musicOn) {
      musicOn = false;
      clearInterval(chordTimer);
      chordTimer = null;
    } else {
      musicaEmpezar();
    }
    setEstadoMusica();
  });

  var NOMBRES = { girasol: "Girasol", "tulipán": "Tulipán", rosa: "Rosa amarilla", lirio: "Lirio" };
  var florActual = null;

  sembrarTarjetas();
})();