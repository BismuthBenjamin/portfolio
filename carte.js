// Carte interactive du Val-de-Marne. Les classes et les couleurs sont celles des figures du dossier.
// Pour ajouter une carte : ajouter une entrée dans VUES.
const GRIS = "#d4d4d4";
const VUES = [
  { id: "age", onglet: "Âge", couche: "iris", champ: "p80",
    titre: "Les 80 ans et plus", sous: "part dans la population, 2021 (figure 1)",
    classes: [[3, "moins de 3 %", "#f2f0f7"], [4, "3 à 4 %", "#cbc9e2"], [5, "4 à 5 %", "#9e9ac8"], [6.5, "5 à 6,5 %", "#756bb1"], [Infinity, "6,5 % et plus", "#54278f"]] },
  { id: "isolement", onglet: "Isolement", couche: "iris", champ: "seuls",
    titre: "L'isolement", sous: "80 ans et plus vivant seuls, parmi ceux qui vivent à domicile, 2021 (figure 2)",
    classes: [[40, "moins de 40 %", "#eff3ff"], [45, "40 à 45 %", "#bdd7e7"], [50, "45 à 50 %", "#6baed6"], [60, "50 à 60 %", "#3182bd"], [Infinity, "60 % et plus", "#08519c"]] },
  { id: "facteurs", onglet: "Facteurs cumulés", couche: "iris", champ: "nbf",
    titre: "Les IRIS prioritaires", sous: "nombre de facteurs de risque élevés : âge, isolement, chaleur nocturne (figure 4)",
    classes: [[0.5, "aucun facteur élevé", "#fff0e8"], [1.5, "1 facteur", "#fcbba1"], [2.5, "2 facteurs", "#f6674a"], [Infinity, "3 facteurs : IRIS prioritaires (23)", "#99000d"]],
    note: "Un facteur est élevé quand le quartier est dans le tiers supérieur du département : 80 ans et plus ≥ 5,3 % ; 80 ans et plus vivant seuls ≥ 55 % ; note d'aléa nocturne ≥ 7,2." },
  { id: "deces", onglet: "Décès", couche: "communes", champ: "ratio",
    titre: "Où la canicule a-t-elle tué ?", sous: "décès des 80 ans et plus pendant six canicules (2018-2023), comparés aux décès attendus, par commune (figure 5)",
    classes: [[0.9, "moins que l'attendu (−10 % ou moins)", "#8fa9c2"], [1.1, "proche de l'attendu (± 10 %)", "#efebe4"], [1.3, "+10 à +30 %", "#f4a582"], [1.5, "+30 à +50 %", "#d6604d"], [Infinity, "+50 % et plus", "#8b0a14"]],
    note: "Département : 989 décès observés pour 912 attendus (+8 %). Les effectifs par commune sont faibles : seul un écart « significatif » se distingue nettement du hasard." },
  { id: "pauvrete", onglet: "Pauvreté", couche: "iris", champ: "pauv",
    titre: "La pauvreté", sous: "personnes sous le seuil de 60 % du niveau de vie médian, 2021 (figure 6)",
    classes: [[10, "moins de 10 %", "#fff5eb"], [15, "10 à 15 %", "#fdd0a2"], [20, "15 à 20 %", "#fd8d3c"], [30, "20 à 30 %", "#d94801"], [Infinity, "30 % et plus", "#7f2704"]] }
];

const $ = (id) => document.getElementById(id);
const fr = (v, nd = 0) => v.toLocaleString("fr-FR", { minimumFractionDigits: nd, maximumFractionDigits: nd });
const pct = (v, nd = 1) => (v == null ? "non disponible" : `${fr(v, nd)} %`);
const couleur = (vue, v) => (v == null ? GRIS : vue.classes.find((c) => v < c[0])[2]);

// ---------- thème clair / sombre (même bouton que sur l'accueil) ----------
$("theme").addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// ---------- carte ----------
const carte = L.map("carte", { zoomSnap: 0.25, zoomDelta: 0.5, attributionControl: false, minZoom: 10, maxZoom: 15 });
L.control.attribution({ prefix: false }).addAttribution("Fond : IGN · Réalisation : Benjamin Bismuth").addTo(carte);
const couches = {};
let vue = VUES[0], choisi = null;

const styleIris = (f) => ({ fillColor: couleur(vue, f.properties[vue.champ]), fillOpacity: 1, color: "#fff", weight: 0.4 });
const styleCom = (f) => (vue.couche === "communes"
  ? { fill: true, fillColor: couleur(vue, f.properties.ratio), fillOpacity: 1, color: "#333", weight: f.properties.signif === "sup" ? 3 : 1 }
  : { fill: false, color: "#333", weight: 1.1 });

function selectionner(layer, html) {
  if (choisi) choisi.groupe.resetStyle(choisi.layer);
  choisi = { layer, groupe: vue.couche === "communes" ? couches.communes : couches.iris };
  layer.setStyle({ color: "#111", weight: 3.2 });
  layer.bringToFront();
  if (vue.couche === "iris") couches.communes.bringToFront();
  $("fiche").innerHTML = html;
}

function ficheIris(p) {
  if (p.p80 == null && p.seuls == null) {
    return `<h2>${p.nom}</h2><p class="fiche-lieu">${p.com}</p><p>Zone d'activité ou quartier trop peu peuplé : pas de données publiées.</p>`;
  }
  const facteurs = [["âge", p.f_age], ["isolement", p.f_seuls], ["chaleur nocturne", p.f_chaleur]].filter((x) => x[1] === 1).map((x) => x[0]);
  return `<h2>${p.nom}</h2><p class="fiche-lieu">${p.com}</p>
    <dl>
      <div><dt>80 ans et plus</dt><dd>${pct(p.p80)}${p.pop80 != null ? ` <small>(${fr(p.pop80)} personnes)</small>` : ""}</dd></div>
      <div><dt>Vivant seuls</dt><dd>${pct(p.seuls)}</dd></div>
      <div><dt>Chaleur la nuit</dt><dd>${p.chaleur == null ? "non disponible" : `note ${fr(p.chaleur, 1)}`}${p.alea_fort != null ? ` <small>(${fr(p.alea_fort)} % de la surface en aléa fort)</small>` : ""}</dd></div>
      <div><dt>Taux de pauvreté</dt><dd>${p.pauv == null ? "non publié" : pct(p.pauv, 0)}</dd></div>
      <div><dt>Facteurs élevés</dt><dd>${p.nbf == null ? "non disponible" : `${fr(p.nbf)} sur 3`}${facteurs.length ? ` <small>(${facteurs.join(", ")})</small>` : ""}</dd></div>
    </dl>`;
}

function ficheCommune(p) {
  const signe = p.exces > 0 ? "+" : p.exces < 0 ? "−" : "";
  return `<h2>${p.nom}</h2><p class="fiche-lieu">Décès des 80 ans et plus pendant six canicules (2018-2023)</p>
    <dl>
      <div><dt>Décès observés</dt><dd>${fr(p.obs)}</dd></div>
      <div><dt>Décès attendus</dt><dd>${fr(p.att, 1)}</dd></div>
      <div><dt>Écart</dt><dd>${signe}${fr(Math.abs(p.exces))} % <small>(${p.signif === "sup" ? "écart significatif" : "non significatif"}, rapport entre ${fr(p.ic_bas, 2)} et ${fr(p.ic_haut, 2)})</small></dd></div>
      <div><dt>80 ans et plus</dt><dd>${fr(p.pop80)} personnes</dd></div>
      <div><dt>Taux de pauvreté</dt><dd>${pct(p.pauv, 0)}</dd></div>
    </dl>`;
}

function afficher(v) {
  vue = v;
  choisi = null;
  [...$("onglets").children].forEach((b) => b.setAttribute("aria-selected", b.dataset.id === v.id));
  $("leg-titre").textContent = v.titre;
  $("leg-sous").textContent = v.sous;
  $("leg-liste").innerHTML = v.classes.map((c) => `<li><span style="background:${c[2]}"></span>${c[1]}</li>`).join("")
    + (v.couche === "iris" ? `<li><span style="background:${GRIS}"></span>zone d'activité ou sans données</li>` : `<li><span class="trait"></span>écart significatif (contour épais)</li>`);
  $("leg-note").textContent = v.note || "";
  $("fiche").innerHTML = `<p class="fiche-vide">Clique sur la carte pour afficher les chiffres ${v.couche === "iris" ? "d'un quartier" : "d'une commune"}.</p>`;
  const iris = v.couche === "iris";
  if (iris) { carte.addLayer(couches.iris); couches.iris.setStyle(styleIris); } else { carte.removeLayer(couches.iris); }
  couches.communes.setStyle(styleCom);
  couches.communes.eachLayer((l) => { const el = l.getElement(); if (el) el.style.pointerEvents = iris ? "none" : "auto"; });
  couches.eau.bringToFront();
  couches.communes.bringToFront();
}

Promise.all(["iris", "communes", "eau"].map((n) => fetch(`assets/data/${n}.geojson`).then((r) => r.json()))).then(([iris, communes, eau]) => {
  couches.iris = L.geoJSON(iris, {
    style: styleIris,
    onEachFeature: (f, l) => {
      l.bindTooltip(`${f.properties.nom} · ${f.properties.com}`, { sticky: true, direction: "top", className: "bulle" });
      l.on("click", () => selectionner(l, ficheIris(f.properties)));
    }
  });
  couches.eau = L.geoJSON(eau, { style: { color: "#7fa6d6", weight: 2, interactive: false } }).addTo(carte);
  couches.communes = L.geoJSON(communes, {
    style: styleCom,
    onEachFeature: (f, l) => {
      l.bindTooltip(f.properties.nom, { sticky: true, direction: "top", className: "bulle" });
      l.on("click", () => { if (vue.couche === "communes") selectionner(l, ficheCommune(f.properties)); });
    }
  }).addTo(carte);

  const emprise = couches.communes.getBounds();
  carte.fitBounds(emprise, { padding: [12, 12] });
  carte.setMaxBounds(emprise.pad(0.35));
  carte.setMinZoom(carte.getZoom() - 0.5);

  $("onglets").innerHTML = VUES.map((v) => `<button type="button" role="tab" data-id="${v.id}">${v.onglet}</button>`).join("");
  [...$("onglets").children].forEach((b, k) => b.addEventListener("click", () => afficher(VUES[k])));
  const depart = VUES.find((v) => v.id === location.hash.slice(1)) || VUES[2];
  afficher(depart);
}).catch(() => {
  $("fiche").innerHTML = `<p class="fiche-vide">Les données de la carte n'ont pas pu être chargées.</p>`;
});
