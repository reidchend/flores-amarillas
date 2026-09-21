(function () {
  "use strict";

  var N = 9; // flores
  var SPACING = 0.5;
  var BASE_DELAY = 0.25;

  // (left %, tamaño, bloom base en segundos; z crece con el orden)
  var FLORES = [
    [50, 1.06, 0],
    [36, 0.92, 1],
    [64, 0.92, 2],
    [25, 0.8, 3],
    [75, 0.8, 4],
    [43, 0.86, 5],
    [57, 0.86, 6],
    [13, 0.66, 7],
    [87, 0.66, 8],
  ];

  var TALLA = 190; // px de ancho de la flor central

  function petPath(a, fill) {
    return (
      '<g transform="rotate(' +
      a +
      ' 40 42)"><path class="petal" d="M40 48 C 26 36 26 16 40 5 C 54 16 54 36 40 48 Z" fill="' +
      fill +
      '" style="--i:' +
      Math.round(a / 45) +
      '"/></g>'
    );
  }

  function semillas() {
    var s = "";
    var anillos = [
      [7, 10],
      [11, 14],
      [15, 8],
    ];
    for (var r = 0; r < anillos.length; r++) {
      var rad = anillos[r][0];
      var n = anillos[r][1];
      for (var k = 0; k < n; k++) {
        var ang = (k * 360) / n + r * 17;
        var x = 40 + rad * Math.cos((ang * Math.PI) / 180);
        var y = 42 + rad * Math.sin((ang * Math.PI) / 180);
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.4" fill="#3b1e06" opacity="0.8"/>';
      }
    }
    return s;
  }

  function florSVG(pos, tam, t) {
    var w = Math.round(TALLA * tam);
    var tras = "";
    var delan = "";
    for (var i = 0; i < 8; i++) {
      tras += petPath(i * 45 + 22.5, "url(#petGradDeep)");
      delan += petPath(i * 45, "url(#petGrad)");
    }
    var s =
      '<div class="sway" style="--sway-delay:' +
      (pos[2] * 0.4).toFixed(2) +
      's;z-index:' +
      (pos[2] + 2) +
      '">' +
      '<svg class="flower" style="left:calc(' +
      pos[0] +
      '% - ' +
      w / 2 +
      'px);width:' +
      w +
      'px;--s-base:' +
      t.toFixed(2) +
      's" viewBox="0 0 80 200">' +
      '<g class="stem">' +
      '<rect x="37.5" y="40" width="6" height="158" rx="3" fill="url(#stemGrad)"/>' +
      '<path class="leaf" d="M40 118 C 20 110 9 97 14 84 C 31 90 42 102 40 118 Z" fill="url(#leafGrad)"/>' +
      '<path class="leaf" d="M40 152 C 60 144 71 131 66 118 C 49 124 38 136 40 152 Z" fill="url(#leafGrad)"/>' +
      "</g>" +
      '<g class="petals-back">' +
      tras +
      "</g>" +
      '<g class="head-inner">' +
      delan +
      '<circle cx="40" cy="42" r="17" fill="url(#centerGrad)" stroke="#2f1806" stroke-width="1.5"/>' +
      "<g>" +
      semillas() +
      "</g>" +
      "</g>" +
      "</svg></div>";
    return s;
  }

  function ramitos(pos, tam, t) {
    var w = Math.round(TALLA * 0.5 * tam);
    var s =
      '<div class="sway" style="--sway-delay:' +
      (pos[2] * 0.5).toFixed(2) +
      's;z-index:1">' +
      '<svg class="leaf" viewBox="0 0 80 200" style="left:calc(' +
      pos[0] +
      '% - ' +
      w / 2 +
      'px);width:' +
      w +
      'px;--s-base:' +
      t.toFixed(2) +
      's;transform-origin:50% 100%;transform-box:view-box">' +
      '<path d="M40 200 C 32 150 34 90 40 30" stroke="url(#stemGrad)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path class="leaf" d="M40 90 C 24 80 12 74 6 84 C 22 92 36 96 40 90 Z" fill="url(#leafGrad)"/>' +
      '<path class="leaf" d="M40 60 C 56 50 68 44 74 54 C 58 62 44 66 40 60 Z" fill="url(#leafGrad)"/>' +
      "</svg></div>";
    return s;
  }

  var bouquet = document.getElementById("bouquet");
  var wrap = document.getElementById("bouquetWrap");
  var bow = document.getElementById("bow");
  var hero = document.getElementById("hero");
  var btn = document.getElementById("btn");
  var replay = document.getElementById("replay");
  var again = document.getElementById("again");

  var sprayTimer = null;

  function spawnPetalo() {
    var p = document.createElement("div");
    p.className = "fal f" + (1 + Math.floor(Math.random() * 3));
    var dx = Math.round((Math.random() - 0.5) * 560);
    var rot = 180 + Math.random() * 360;
    var dir = Math.random() < 0.5 ? -1 : 1;
    p.style.left = 4 + Math.random() * 92 + "vw";
    p.style.width = 12 + Math.random() * 9 + "px";
    p.style.height = 16 + Math.random() * 11 + "px";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--rot", rot.toFixed(0));
    p.style.setProperty("--rot-dir", dir);
    document.body.appendChild(p);
    var dur = p.classList.contains("f1") ? 8000 : p.classList.contains("f2") ? 11000 : 14000;
    setTimeout(function () {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, dur + 400);
  }

  function construir() {
    bouquet.innerHTML = "";
    bow.classList.remove("show");
    wrap.classList.remove("show");

    for (var i = 0; i < FLORES.length; i++) {
      var f = FLORES[i];
      bouquet.insertAdjacentHTML("beforeend", florSVG(f, f[1] * 1.28, BASE_DELAY + i * SPACING));
    }

    var ramos = [
      [16, 0.8, 3.4],
      [84, 0.8, 3.6],
      [50.5, 0.9, 3.9],
      [27, 0.7, 3.2],
      [73, 0.7, 3.3],
    ];
    for (var r = 0; r < ramos.length; r++) {
      bouquet.insertAdjacentHTML("beforeend", ramitos(ramos[r], ramos[r][1], ramos[r][2]));
    }

    requestAnimationFrame(function () {
      wrap.classList.add("show");
      requestAnimationFrame(function () {
        var sw = bouquet.querySelectorAll(".sway");
        for (var j = 0; j < sw.length; j++) sw[j].classList.add("in");
      });
    });

    setTimeout(function () {
      bow.classList.add("show");
    }, BASE_DELAY + FLORES.length * SPACING + 900);

    if (sprayTimer) clearInterval(sprayTimer);
    sprayTimer = setInterval(spawnPetalo, 650);
    setTimeout(function () {
      if (sprayTimer) clearInterval(sprayTimer);
    }, 12000);

    hero.classList.add("away");
    replay.hidden = false;
  }

  btn.addEventListener("click", construir);

  again.addEventListener("click", function () {
    hero.classList.remove("away");
    replay.hidden = true;
    var p = document.querySelectorAll(".fal");
    for (var i = 0; i < p.length; i++) if (p[i].parentNode) p[i].parentNode.removeChild(p[i]);
    setTimeout(construir, 350);
  });
})();