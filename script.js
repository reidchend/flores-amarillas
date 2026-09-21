(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };

  /* ============================ Utilidades ============================ */

  var FW = 430, FH = 560;

  function hexRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpC(c1, c2, t) {
    var a = hexRgb(c1), b = hexRgb(c2);
    return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")";
  }
  function ease(c) { var t = Math.min(1, Math.max(0, c)); return 1 - Math.pow(1 - t, 3); }

  var spriteCache = {};
  function sprite(color) {
    if (spriteCache[color]) return spriteCache[color];
    var c = document.createElement("canvas");
    c.width = 28; c.height = 28;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(14, 14, 0, 14, 14, 14);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 28, 28);
    spriteCache[color] = c;
    return c;
  }

  /* ============================ Geometría de flores ============================ */

  var P = {
    stem: "#4f7c2f", stemDk: "#37631f",
    leaf: "#6fae56", leafDk: "#4f7c2f",
    petBase: "#eea600", petTip: "#ffefad",
    roseDk: "#e8a21c",
    center: "#7a4a1e", centerDk: "#593110", seed: "#2c1703",
    gold: "#ffe98a", stam: "#a86e00", anther: "#7a4a00",
  };

  var ISMOBILE = window.matchMedia && window.matchMedia("(max-width:600px)").matches;
  var DS = ISMOBILE ? 0.6 : 1;

  function makePart(ox, oy, tx, ty, c, r, d, glow) {
    return {
      ox: ox, oy: oy, x: ox, y: oy, tx: tx, ty: ty,
      c: c, r: r, d: d, glow: !!glow,
      dur: 0.5 + Math.random() * 0.55,
      tA: 0, on: false, done: false,
      phase: Math.random() * 6.28, pulse: 0.5 + Math.random() * 1.1,
      fr: 0.8 + Math.random() * 1.4,
    };
  }

  function rayo(cx, cy, thDeg, largo, ancho, d0, dst, list) {
    var th = (thDeg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
    var n = Math.max(4, Math.round(largo / 6 * DS));
    for (var k = 0; k < n; k++) {
      var q = k / (n - 1);
      var px = cx + q * largo * c + Math.sin(q * 6.283) * 3;
      var py = cy + q * largo * s;
      list.push(makePart(cx, cy, px, py, q < 0.5 ? P.stem : P.stemDk, ancho, d0 + q * dst, false));
    }
  }

  function strobe(cx, cy, angDeg, bendAng, largo, aMax, dmpPow, d0, qdur, list) {
    // tallo con ligera curva
    var th = (angDeg * Math.PI) / 180;
    var bend = (bendAng * Math.PI) / 180;
    var c = Math.cos(th), s = Math.sin(th), bc = Math.cos(bend), bs = Math.sin(bend);
    var n = Math.round((largo / 4) * DS);
    for (var k = 0; k < n; k++) {
      var q = k / (n - 1);
      var off = q * largo;
      var yf = Math.sin(q * Math.PI);
      var w = aMax * yf;
      for (var m = -1; m <= 1; m++) {
        var px = cx + off * c + (q * q * 10 * bc + m * w * bc);
        var py = cy + off * s + (q * q * 10 * bs + m * w * bs);
        list.push(makePart(cx, cy, px, py, m === 0 ? P.leaf : P.leafDk, 2.4 + Math.random() * 1.6, d0 + q * qdur, false));
      }
    }
  }

  function petaloRad(cx, cy, thDeg, offR, L, A, bulbo, curva, d0, qstep, list) {
    var th = (thDeg * Math.PI) / 180;
    var c = Math.cos(th), s = Math.sin(th);
    var nx = -s, ny = c;
    var nq = Math.max(6, Math.round(26 * DS));
    for (var q = 0; q <= 1.0001; q += 1 / nq) {
      var dist = offR + q * L;
      var w = q < 0.03 ? 0.6 : A * Math.pow(Math.sin(Math.PI * (q * 0.94 + 0.05)), 0.8);
      var bendX = curva * q * q * 12 * nx;
      var bendY = curva * q * q * 12 * ny;
      var ex = cx + dist * c + bendX;
      var ey = cy + dist * s + bendY;
      var col = lerpC(P.petBase, P.petTip, q + 0.18);
      for (var m = -1; m <= 1; m++) {
        var px = ex + m * w * nx;
        var py = ey + m * w * ny;
        list.push(makePart(cx + offR * 0.1 * c, cy + offR * 0.1 * s, px, py, col, 2.5 + Math.random() * 1.5, d0 + q * qstep, false));
      }
    }
  }

  function disco(cx, cy, R, color, d0, list, density) {
    var N = Math.round((density || 70) * DS);
    for (var k = 0; k < N; k++) {
      var ang = Math.random() * 6.283;
      var rr = R * Math.sqrt(Math.random() * 0.96 + 0.04);
      list.push(makePart(cx, cy, cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), color, 2.4 + Math.random() * 1.4, d0, false));
    }
  }

  function semillas(cx, cy, d0, list) {
    for (var k = 0; k < 20; k++) {
      var ang = k * 0.314 + Math.random() * 0.1;
      var rr = (8 + (k % 5) * 4) * (ISMOBILE ? 0.85 : 1);
      list.push(makePart(cx, cy, cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), P.seed, 1.6, d0, false));
    }
  }

  function chispas(cx, cy, rad, n, d0, list) {
    for (var k = 0; k < n; k++) {
      var ang = Math.random() * 6.283;
      var rr = rad * (0.4 + Math.random() * 0.9);
      list.push(makePart(cx, cy, cx + rr * Math.cos(ang), cy + rr * Math.sin(ang) * 0.9, Math.random() < 0.5 ? P.gold : "#fff3b0", 2 + Math.random() * 1.4, d0 + Math.random() * 0.5, true));
    }
  }

  /* ------------------------- Girasol ------------------------- */
  function geoGirasol() {
    var a = [];
    // energía / semilla de luz
    chispas(150, 150, 60, 16, 0, a);
    rayo(150, 478, -90, 286, 3.6, 0.28, 0.85, a);
    // hojas
    strobe(150, 442, -100, 60, 62, 20, 0.35, 1.05, 0.55, a);
    strobe(150, 392, -80, 120, 56, 18, 0.32, 1.25, 0.55, a);
    // pétalos
    for (var i = 0; i < 14; i++) {
      petaloRad(150, 150, -90 + i * (360 / 14), 30, 70, 15, 0.32, 0, 1.55 + i * 0.055, 0.4, a);
    }
    disco(150, 150, 30, P.center, 2.2, a);
    disco(150, 150, 24, P.centerDk, 2.3, a, 40);
    semillas(150, 150, 2.45, a);
    chispas(150, 150, 40, 14, 2.6, a);
    return a;
  }

  /* ------------------------- Tulipán ------------------------- */
  function geoTulipan() {
    var a = [];
    chispas(150, 240, 50, 12, 0, a);
    rayo(150, 478, -90, 186, 3.6, 0.28, 0.85, a);
    strobe(150, 480, -92, 65, 72, 20, 0.3, 1.0, 0.55, a);
    strobe(150, 428, -88, 115, 62, 18, 0.3, 1.15, 0.55, a);
    // copa de tres pétalos
    petaloRad(150, 284, -90, 0, 150, 22, 0.4, 0, 1.45, 0.45, a);
    petaloRad(150, 290, -50, 0, 146, 26, 0.38, -9, 1.58, 0.45, a);
    petaloRad(150, 290, -130, 0, 146, 26, 0.38, 9, 1.58, 0.45, a);
    disco(150, 296, 14, "#7a4a1e", 2.35, a, 30);
    chispas(150, 190, 26, 10, 2.5, a);
    return a;
  }

  /* ------------------------- Rosa ------------------------- */
  function geoRosa() {
    var a = [];
    chispas(150, 170, 55, 14, 0, a);
    rayo(150, 478, -90, 190, 3.6, 0.28, 0.85, a);
    strobe(150, 452, -96, 92, 60, 18, 0.3, 1.0, 0.55, a);
    strobe(150, 352, -84, 88, 54, 16, 0.3, 1.15, 0.55, a);
    for (var k = 0; k < 12; k++) {
      var th = k * 137.5 - 80;
      var off = 12 + k * 9.5;
      petaloRad(150, 170, th, off, 46, 26, 0.4, 7, 1.35 + k * 0.09, 0.34, a);
    }
    disco(150, 170, 15, P.roseDk, 2.6, a, 45);
    chispas(150, 170, 34, 12, 2.8, a);
    return a;
  }

  /* ------------------------- Lirio ------------------------- */
  function geoLirio() {
    var a = [];
    chispas(150, 220, 45, 10, 0, a);
    rayo(150, 478, -90, 228, 3.4, 0.28, 0.85, a);
    strobe(150, 452, -96, 110, 62, 16, 0.28, 1.0, 0.55, a);
    strobe(150, 352, -84, 70, 52, 14, 0.28, 1.12, 0.55, a);
    var angs = [-72, -42, -12, 12, 42, 72];
    for (var i = 0; i < angs.length; i++) {
      petaloRad(150, 256, -90 + angs[i], 0, 96, 24, 0.5, 0, 1.4 + i * 0.09, 0.42, a);
    }
    // estambres
    stambreCon(150, 258, 150, 178, 2.55, a);
    stambreCon(150, 256, 160, 182, 2.7, a);
    stambreCon(150, 256, 140, 182, 2.7, a);
    chispas(150, 150, 30, 10, 2.9, a);
    return a;
  }

  function stambreCon(x0, y0, x1, y1, d0, list) {
    var n = 4;
    for (var k = 0; k < n; k++) {
      var q = k / (n - 1);
      list.push(makePart(x0, y0, lerp(x0, x1, q), lerp(y0, y1, q), P.stam, 1.8, d0, false));
    }
    list.push(makePart(x0, y0, x1, y1, P.anther, 2.4, d0 + 0.35, false));
  }

  var GEOS = { girasol: geoGirasol, "tulipán": geoTulipan, rosa: geoRosa, lirio: geoLirio };
  var NOMBRES = { girasol: "Girasol", "tulipán": "Tulipán", rosa: "Rosa amarilla", lirio: "Lirio" };

  /* ============================ Motor de la flor ============================ */

  var florCv = $("#florCanvas"), fctx = florCv.getContext("2d");
  florCv.width = FW * 2; florCv.height = FH * 2;
  fctx.scale(2, 2);

  var flor = { parts: [], t0: 0, on: false, maxD: 0 };

  function construirFlor(tipo) {
    flor.parts = GEOS[tipo]();
    flor.on = true;
    flor.t0 = performance.now();
    var md = 0;
    for (var i = 0; i < flor.parts.length; i++) if (flor.parts[i].d > md) md = flor.parts[i].d;
    flor.maxD = md;
    // limpiar el aire: partículas de polen ambiental al brotar
    hiloCam();
    return md;
  }

  function stepFlor(now) {
    if (!flor.on) return;
    var t = (now - flor.t0) / 1000;
    fctx.clearRect(0, 0, FW, FH);
    fctx.save();
    fctx.translate(150, 470);
    fctx.rotate(Math.sin(now * 0.0013) * 0.015);
    fctx.translate(-150, -470);
    for (var i = 0; i < flor.parts.length; i++) {
      var p = flor.parts[i];
      if (t >= p.d) {
        if (!p.on) { p.on = true; p.tA = t; }
        var age = t - p.tA;
        if (!p.done) {
          var tt = ease(age / p.dur);
          if (tt >= 1) p.done = true;
          p.x = lerp(p.ox, p.tx, tt);
          p.y = lerp(p.oy, p.ty, tt);
        } else {
          p.x = p.tx + Math.sin(now * 0.001 * p.fr + p.phase) * p.pulse * 0.7;
          p.y = p.ty + Math.cos(now * 0.0008 * p.fr + p.phase * 1.3) * p.pulse * 0.7;
        }
      } else {
        p.on = false;
        p.x = p.ox; p.y = p.oy;
      }
      if (p.on) {
        var spr = sprite(p.c);
        var rr = p.r * (p.glow ? 1.7 : 1);
        if (p.glow) {
          fctx.globalAlpha = 0.6 + Math.sin(now * 0.002 + p.phase) * 0.25;
        } else {
          fctx.globalAlpha = 1;
        }
        fctx.drawImage(spr, p.x - rr, p.y - rr, rr * 2, rr * 2);
      }
    }
    fctx.globalAlpha = 1;
    fctx.restore();
  }

  /* ============================ Pétalos ambientales ============================ */

  var cv = $("#petalCanvas"), ctx = cv.getContext("2d");
  var petalos = [], pointer = null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  var florActual = null;
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

    flor.on = false;
    var maxD = construirFlor(tipo);
    florNombre.textContent = NOMBRES[tipo];
    hiloCam();

    var wait = (maxD + 0.9) * 1000;
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
      rosa: "la amistad y la alegria",
      lirio: "la calma que se abre despacio",
    };
    cctx.fillStyle = "#7a5a2e";
    cctx.font = "italic 400 22px Georgia, serif";
    cctx.fillText(NOTA_SHORT[florActual] || "una flor amarilla plantada para ti", W / 2, 620);

    cctx.fillStyle = "#9a7a44";
    cctx.font = "400 17px Georgia, serif";
    cctx.fillText("Hecha con paciencia y codigo, para que nadie se quede sin flores", W / 2, 662);
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
    var texto = "Si alguien te olvido hoy, esta pagina abre una flor amarilla solo para ti. " + location.href;
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

  sembrarTarjetas();
})();