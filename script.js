(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };

  /* ------------------------------- Datos ------------------------------- */

  var NOMBRES = { girasol: "Girasol", "tulipán": "Tulipán", rosa: "Rosa amarilla", lirio: "Lirio" };

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

  /* ------------------------------- SVG de flores ------------------------------- */

  var D = function (d, dur) {
    return ' style="--d:' + d + 's;--dur:' + (dur || 0.8) + 's"';
  };

  function gir() {
    var s =
      '<path class="stem drawable" pathLength="1" d="M150 478 C 149 420 147 320 150 192" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 430 C 120 428 100 420 92 406 C 112 394 138 402 150 420 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 374 C 180 372 200 364 208 350 C 188 338 162 346 150 364 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.75, 0.6) + "/>" +
      '<circle class="center drawable" pathLength="1" cx="150" cy="150" r="30" fill="url(#sun)" stroke="#4a2a0c"' + D(1.05, 0.85) + "/>";
    var pt = "";
    for (var i = 0; i < 14; i++) {
      pt +=
        '<g transform="rotate(' +
        i * 25.714 +
        ' 150 150)"><path class="petal drawable" pathLength="1" d="M150 168 C 139 139 141 116 150 94 C 159 116 161 139 150 168 Z" fill="url(#petalSheen)" stroke="#d99b22"' +
        D(0.85 + i * 0.07, 0.55) +
        "/></g>";
    }
    var sem = "<g class='fill-only'>";
    for (var k = 0; k < 18; k++) {
      var rad = 8 + (k % 6) * 3.6;
      var ang = (k * 20 + 7) * (Math.PI / 180);
      var sx = 150 + rad * Math.cos(ang);
      var sy = 150 + rad * Math.sin(ang);
      sem += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="1.6" fill="#2c1703" opacity="0.9"/>';
    }
    sem += "</g>";
    return wrap(s, pt, sem, 150, 150);
  }

  function tul() {
    var s =
      '<path class="stem drawable" pathLength="1" d="M150 478 C 158 420 140 340 148 292" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 470 C 110 456 88 416 92 380 C 114 380 142 404 150 436 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 424 C 186 412 208 384 204 352 C 184 352 158 374 150 412 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.75, 0.6) + "/>";
    var pt =
      '<path class="petal drawable" pathLength="1" d="M136 296 C 112 282 96 244 100 200 C 120 180 148 172 152 186 C 154 212 150 252 149 296 Z" fill="url(#petalSheen)" stroke="#d99b22"' + D(0.85, 0.6) + "/>" +
      '<path class="petal drawable" pathLength="1" d="M164 296 C 188 282 204 244 200 200 C 180 180 152 172 148 186 C 146 212 150 252 151 296 Z" fill="url(#petalSheen)" stroke="#d99b22"' + D(0.95, 0.6) + "/>" +
      '<path class="petal drawable" pathLength="1" d="M150 306 C 148 268 136 200 146 150 C 154 184 149 258 150 302 Z" fill="url(#petalSheen)" stroke="#d99b22"' + D(1.05, 0.6) + "/>";
    return wrap(s, pt, "", 150, 270);
  }

  function ros() {
    var s =
      '<path class="stem drawable" pathLength="1" d="M150 478 C 162 428 138 360 148 292" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf fill-only" d="M141 428 L 120 420 L 143 418 Z" fill="#4f7c2f" stroke="#3a6622"/>' +
      '<path class="leaf fill-only" d="M159 372 L 180 364 L 157 362 Z" fill="#4f7c2f" stroke="#3a6622"/>' +
      '<path class="leaf drawable" pathLength="1" d="M150 452 C 120 444 102 424 102 404 C 126 402 146 422 150 446 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 346 C 180 338 198 318 198 298 C 174 296 154 316 150 340 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.75, 0.6) + "/>" +
      '<circle class="center drawable" pathLength="1" cx="150" cy="170" r="11" fill="#7a4a1e" stroke="#5c3410"' + D(0.0, 0.001) + "/>";
    var pt = "";
    for (var i = 0; i < 12; i++) {
      var ang = i * 137.5;
      var rad = 28 + i * 8;
      pt +=
        '<g transform="rotate(' + ang.toFixed(1) + ' 150 170) translate(0 ' + rad + ')"><path class="petal drawable" pathLength="1" d="M150 176 C 141 162 140 136 150 122 C 160 136 159 162 150 176 Z" fill="url(#roseGrad)" stroke="#c88a10"' +
        D(0.75 + i * 0.09, 0.5) +
        "/></g>";
    }
    return wrap(s, pt, "", 150, 170);
  }

  function lil() {
    var s =
      '<path class="stem drawable" pathLength="1" d="M150 478 C 143 380 159 300 150 246" stroke="#4f7c2f" fill="none"' + D(0.08, 0.7) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 434 C 126 428 110 414 108 400 C 128 392 142 402 150 420 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.5, 0.6) + "/>" +
      '<path class="leaf drawable" pathLength="1" d="M150 352 C 176 346 192 330 194 316 C 172 312 158 322 150 346 Z" fill="#4f7c2f" stroke="#3a6622"' + D(0.75, 0.6) + "/>";
    var pt = "";
    var angs = [-75, -45, -15, 15, 45, 75];
    for (var i = 0; i < angs.length; i++) {
      pt +=
        '<g transform="rotate(' + angs[i] + ' 150 250)"><path class="petal drawable" pathLength="1" d="M147 250 C 133 222 125 186 120 158 C 126 140 140 132 150 138 C 148 168 146 210 150 244 Z" fill="url(#petalSheen)" stroke="#d99b22"' +
        D(0.9 + i * 0.1, 0.55) +
        "/></g>";
    }
    var st = "<g class='fill-only'>" +
      '<path class="stamen" d="M150 248 L 150 180" stroke="#a86e00" fill="none"/>' +
      '<path class="stamen" d="M150 246 L 160 184" stroke="#a86e00" fill="none"/>' +
      '<path class="stamen" d="M150 246 L 140 184" stroke="#a86e00" fill="none"/>' +
      '<circle cx="150" cy="180" r="3" fill="#7a4a00"/>' +
      '<circle cx="160" cy="184" r="3" fill="#7a4a00"/>' +
      '<circle cx="140" cy="184" r="3" fill="#7a4a00"/>' +
      "</g>";
    return wrap(s, pt, st, 150, 250);
  }

  function wrap(base, pétalos, extra, ox, oy) {
    return (
      '<svg class="flor" viewBox="0 0 300 480" style="--ox:' + ox + 'px;--oy:' + oy + 'px">' +
      base +
      "<g class='petals'>" +
      pétalos +
      "</g>" +
      extra +
      "</svg>"
    );
  }

  var GENERADORES = { girasol: gir, "tulipán": tul, rosa: ros, lirio: lil };

  // duración total estimada del dibujado por flor (seg)
  var TOTALES = { girasol: 2.45, "tulipán": 1.75, rosa: 2.4, lirio: 2.05 };

  /* ------------------------------- Escenas ------------------------------- */

  var sc0 = $("#scene0"), sc1 = $("#scene1"), sc2 = $("#scene2");
  var wrapFlor = $("#florWrap"), florNombre = $("#florName");
  var nota = $("#note"), notaTxt = $("#noteText"), notaFade = $("#noteFade");

  var florActual = null;
  var poolMensajes = [];

  function mostrar(sc, on) {
    sc.hidden = !on;
    sc.classList.toggle("scene--active", on);
  }

  function elegirMensaje() {
    if (!poolMensajes.length) poolMensajes = MENSAJES.slice();
    var i = Math.floor(Math.random() * poolMensajes.length);
    return poolMensajes.splice(i, 1)[0];
  }

  function sembrarTarjetas() {
    var cajas = document.querySelectorAll(".card-svg");
    for (var i = 0; i < cajas.length; i++) {
      var t = cajas[i].getAttribute("data-flor");
      cajas[i].innerHTML = GENERADORES[t]();
    }
  }

  $("#btnStart").addEventListener("click", iniciar);
  $("#picker").addEventListener("click", function (e) {
    var card = e.target.closest(".flower-card");
    if (!card) return;
    cultivar(card.getAttribute("data-flor"));
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
    wrapFlor.innerHTML = "";
    nota.hidden = true;
    mostrar(sc1, false);
    mostrar(sc2, true);

    var svg = GENERADORES[tipo]();
    wrapFlor.innerHTML = svg;
    var el = wrapFlor.querySelector(".flor");
    var nombre = NOMBRES[tipo];

    var total = TOTALES[tipo] + 0.15;
    peticionRaf(function () {
      el.classList.add("done");
      peticionRaf(function () { el.classList.add("open"); });
    });

    setTimeout(function () {
      notaTxt.textContent = "" + nombre + " florece para ti. " + elegirMensaje();
      notaFade.textContent = FRASES_SUAVES[Math.floor(Math.random() * FRASES_SUAVES.length)];
      nota.hidden = false;
      florNombre.textContent = nombre;
      libarPetunias(18);
    }, (total + 1.1) * 1000);

    libarPetunias(10);
  }

  function volverAElegir() {
    mostrar(sc2, false);
    mostrar(sc1, true);
    poolMensajes = [];
  }

  /* ------------------------------- Pétalos (canvas) ------------------------------- */

  var cv = $("#petalCanvas"), ctx = cv.getContext("2d");
  var petalos = [], pointer = null, animId = null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (e) {
    pointer = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("pointerleave", function () { pointer = null; });

  var PALETAS = ["#ffd23e", "#f5b41c", "#ffe98a", "#f0b400"];

  function crearPetalo(temp) {
    return {
      x: Math.random() * cv.width,
      y: temp ? Math.random() * cv.height : -30 - Math.random() * 60,
      vy: 0.6 + Math.random() * 1.1,
      vx: (Math.random() - 0.5) * 0.6,
      r: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      c: PALETAS[Math.floor(Math.random() * PALETAS.length)],
    };
  }

  function libarPetunias(n) {
    for (var i = 0; i < n; i++) petalos.push(crearPetalo(false));
  }

  function dibujarPet(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    var h = c.r * 2.4, w = c.r;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w * 0.7, -h * 0.45, w * 0.7, h * 0.15, 0, h * 0.55);
    ctx.bezierCurveTo(-w * 0.7, h * 0.15, -w * 0.7, -h * 0.45, 0, -h);
    ctx.fillStyle = c.c;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.restore();
  }

  function vientoBase(t) {
    return Math.sin(t * 0.0012) * 0.5 + Math.sin(t * 0.0007) * 0.3;
  }

  function bucle(t) {
    var v = vientoBase(t || 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < petalos.length; i++) {
      var c = petalos[i];
      c.x += c.vx + v;
      c.y += c.vy;
      c.rot += c.vr;
      if (pointer) {
        var dx = c.x - pointer.x, dy = c.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0.01) {
          var f = (1 - dist / 150) * 2.4;
          c.x += (dx / dist) * f;
          c.y += (dy / dist) * f * 0.4 - 0.12;
          c.rotation_pulse = true;
        }
      }
      if (c.y > cv.height + 40 || c.x < -60 || c.x > cv.width + 60) {
        c.x = Math.random() * cv.width;
        c.y = -30 - Math.random() * 80;
      }
      dibujarPet(c);
    }
    animId = requestAnimationFrame(bucle);
  }

  if (!reduce) {
    resize();
    libarPetunias(8);
    animId = requestAnimationFrame(bucle);
  }

  /* ------------------------------- Certificado ------------------------------- */

  var certOverlay = $("#certOverlay"), certCv = $("#certCanvas");
  var cctx = certCv.getContext("2d");

  function fechaHoy() {
    var d = new Date();
    var op = { day: "numeric", month: "long", year: "numeric" };
    var f = d.toLocaleDateString("es-CL", op);
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
      cctx.beginPath();
      cctx.moveTo(0, 28);
      cctx.quadraticCurveTo(0, -12, 0, -30);
      cctx.lineTo(4, -24);
      cctx.quadraticCurveTo(4, -8, 4, 26);
      cctx.fillStyle = "#ffe98a";
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
      var angs = [-75, -45, -15, 15, 45, 75];
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
      cctx.beginPath();
      cctx.arc(0, -42, 2.6, 0, Math.PI * 2);
      cctx.fillStyle = "#7a4a00";
      cctx.fill();
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

    var msg = NOTA_SHORT[florActual] || "una flor amarilla, plantada con cuidado para ti";
    cctx.fillStyle = "#7a5a2e";
    cctx.font = "italic 400 22px Georgia, serif";
    cctx.fillText(msg, W / 2, 620);

    cctx.fillStyle = "#9a7a44";
    cctx.font = "400 17px Georgia, serif";
    cctx.fillText("Hecha con paciencia y codigo - para que nadie se quede sin flores", W / 2, 662);
  }

  var NOTA_SHORT = {
    girasol: "la que siempre mira hacia el sol",
    "tulipán": "la elegancia que se anuncia sola",
    rosa: "la amistad y la alegria",
    lirio: "la calma que se abre despacio",
  };

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

  /* ------------------------------- Compartir ------------------------------- */

  function mostrarToast(t) {
    var toast = $("#toast");
    toast.textContent = t;
    toast.classList.add("show");
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  $("#btnShare").addEventListener("click", function () {
    var texto = "Si algien te olvido hoy, esta pagina abre una flor amarilla solo para ti. " + location.href;
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
      mostrarToast("Enlace copiado. Comprartelo con quien lo necesite.");
    }, function () {
      mostrarToast("No pude copiar el enlace, pero puedes compartir la pagina asi: " + location.href);
    });
  }

  /* ------------------------------- Música (WebAudio) ------------------------------- */

  var actx = null, master = null, dly = null, musicOn = false, chordTimer = null, nextT = 0, chordIdx = 0;

  var FORMA = [0, -1, -3.5, 0.5, 2, -1]; // C / G / Am / F

  function notaFreq(base, semis) {
    return base * Math.pow(2, semis / 12);
  }

  function iniciarAudio() {
    if (actx) { if (actx.state === "suspended") actx.resume(); return; }
    actx = new (window.AudioContext || window.webkitAudioContext)();
    var comp = actx.dynamicsCompressor ? actx.createDynamicsCompressor() : null;
    master = actx.createGain();
    master.gain.value = 0.13;
    master.connect(comp || actx.destination);
    if (comp) comp.connect(actx.destination);
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
    var base = [261.63, 196.0, 220.0, 174.61, 261.63][chordIdx % 5];
    var semis = [0, -2, -4.5, 0];
    var ii = (chordIdx % 5) === 2 || (chordIdx % 5) === 3 ? [-2, 0, 2] : semis;
    var f = [];
    for (var k = 0; k < 3; k++) f.push(notaFreq(base, ii[k]) / (k === 1 ? 1 : 1));
    f.push(notaFreq(base, 2.5));
    var t = nextT;
    for (var i = 0; i < f.length; i++) {
      var t0 = t + i * (0.38 + Math.random() * 0.14);
      for (var p = 0; p < 2; p++) {
        var o = actx.createOscillator();
        o.type = p === 0 ? "sine" : "triangle";
        o.frequency.value = f[i] * (p === 1 ? 2 : 1);
        var gn = actx.createGain();
        gn.gain.setValueAtTime(0.0001, t0);
        gn.gain.linearRampToValueAtTime(p === 0 ? 0.16 : 0.06, t0 + 0.08);
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

  function peticionRaf(fn) {
    (window.requestAnimationFrame || function (c) { return setTimeout(c, 16); })(fn);
  }

  sembrarTarjetas();
})();