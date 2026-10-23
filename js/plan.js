// Gartenplan: Bereiche wählen, Karte und Legende abgleichen, Anfrage-Vorschau füllen
(function () {
  document.documentElement.classList.add('js');

  var ZONEN = {
    bau:      { nr: 1, titel: 'Terrasse und Wege', satz: 'Terrassen, Wege und Einfahrten, neu angelegt oder umgestaltet.', bild: 'img/wege-640.jpg', alt: 'Beispielbild: gepflasterter Gartenweg mit Natursteinmauer und Hecken' },
    pflanzen: { nr: 2, titel: 'Beete und Pflanzen', satz: 'Pflanzen und Beete, die zu Ihrem Garten passen. „Viel Auswahl“, heißt es in einer Google-Bewertung.', bild: 'img/beet-640.jpg', alt: 'Beispielbild: Staudenbeet mit Katzenminze und Gräsern' },
    baum:     { nr: 3, titel: 'Bäume', satz: 'Schnitt und Pflege, damit Bäume gesund und sicher bleiben.', bild: 'img/baum-640.jpg', alt: 'Beispielbild: Baumpfleger mit Seil in der Baumkrone' },
    pflege:   { nr: 4, titel: 'Hecke und Rasen', satz: 'Hecke, Rasen und Beete in Form halten, einmalig oder regelmäßig.', bild: 'img/hecke-640.jpg', alt: 'Beispielbild: Heckenschnitt an einer hohen Hecke' }
  };

  var plan = document.getElementById('gartenplan');
  var papier = document.querySelector('.papier');
  var zonen = plan.querySelectorAll('.zone');
  var marken = plan.querySelectorAll('.marke-nr');
  var legs = document.querySelectorAll('.leg');
  var img = document.getElementById('zk-img');
  var aktiv = 'bau';
  var gesperrt = false; // nach Klick bleibt die Wahl stehen, Hover zeigt nur

  function zeige(z, hervorheben) {
    var d = ZONEN[z];
    if (!d) return;
    plan.classList.toggle('hat-wahl', !!hervorheben);
    zonen.forEach(function (el) { el.classList.toggle('an', el.dataset.z === z); });
    marken.forEach(function (el) { el.classList.toggle('an', el.dataset.z === z); });
    legs.forEach(function (el) {
      var an = el.dataset.z === z;
      el.classList.toggle('aktiv', an);
      el.setAttribute('aria-selected', an ? 'true' : 'false');
    });
    if (z === aktiv && img.getAttribute('src') === d.bild) return;
    aktiv = z;
    document.getElementById('zk-nr').textContent = d.nr;
    document.getElementById('zk-titel').textContent = d.titel;
    document.getElementById('zk-satz').textContent = d.satz;
    document.getElementById('zk-link').dataset.wahl = z;
    img.style.opacity = '0';
    setTimeout(function () { img.src = d.bild; img.alt = d.alt; img.style.opacity = '1'; }, 180);
  }

  zonen.forEach(function (el) {
    el.addEventListener('mouseenter', function () { if (!gesperrt) zeige(el.dataset.z, true); });
    el.addEventListener('click', function () { gesperrt = true; zeige(el.dataset.z, true); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gesperrt = true; zeige(el.dataset.z, true); } });
  });
  plan.addEventListener('mouseleave', function () { if (!gesperrt) plan.classList.remove('hat-wahl'); });
  legs.forEach(function (el) {
    el.addEventListener('click', function () { gesperrt = true; zeige(el.dataset.z, true); });
  });

  // Plan einmal ruhig einblenden, sobald er sichtbar ist
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { papier.classList.add('geladen'); o.disconnect(); }
    }).observe(papier);
  } else { papier.classList.add('geladen'); }

  // "Das anfragen" wählt den Bereich in der Anfrage vor
  document.getElementById('zk-link').addEventListener('click', function () {
    var z = this.dataset.wahl;
    var box = document.querySelector('.chips input[data-z="' + z + '"]');
    if (box && !box.checked) { box.checked = true; vorschau(); }
  });

  // Anfrage-Vorschau als Plankopf
  var form = document.getElementById('formular');
  function setze(id, wert, leer) {
    var el = document.getElementById(id);
    el.textContent = wert || leer;
    el.classList.toggle('leer', !wert);
  }
  function vorschau() {
    var was = [].slice.call(form.querySelectorAll('input[name="was"]:checked')).map(function (i) { return i.value; });
    var g = form.querySelector('input[name="groesse"]:checked');
    var w = form.querySelector('input[name="wann"]:checked');
    var f = document.getElementById('foto').files;
    setze('v-was', was.join(', '), 'noch nichts gewählt');
    setze('v-groesse', g && g.value, '–');
    setze('v-wann', w && w.value, '–');
    setze('v-name', document.getElementById('f-name').value.trim(), '–');
    setze('v-ort', document.getElementById('f-ort').value.trim(), '–');
    var n = f ? f.length : 0;
    setze('v-foto', n ? (n === 1 ? '1 Foto angehängt' : n + ' Fotos angehängt') : '', 'keine');
    document.getElementById('foto-text').textContent = n ? (n === 1 ? '1 Foto ausgewählt' : n + ' Fotos ausgewählt') : 'Foto vom Garten anhängen (optional)';
  }
  form.addEventListener('input', vorschau);
  form.addEventListener('change', vorschau);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('danke').hidden = false;
  });
  vorschau();
})();
