// Met en page le contenu défini dans cv.html (objet CV). Rien à modifier ici pour changer le texte.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // un texte "À COMPLÉTER" est surligné pour qu'on ne l'oublie pas avant d'envoyer le CV
  const txt = (s) => (/À COMPLÉTER/.test(s) ? `<mark>${esc(s)}</mark>` : esc(s));
  const liste = (items) => `<ul>${items.map((i) => `<li>${txt(i)}</li>`).join("")}</ul>`;

  const bloc = (titre, contenu) => `<section class="bloc"><h2>${esc(titre)}</h2>${contenu}</section>`;

  const entree = (e) => `
    <div class="entree">
      <div class="tete">
        <h3>${txt(e.titre)}</h3>
        ${e.dates ? `<span class="dates">${txt(e.dates)}</span>` : ""}
      </div>
      ${e.lieu ? `<p class="lieu">${txt(e.lieu)}</p>` : ""}
      ${e.detail ? `<p>${txt(e.detail)}</p>` : ""}
    </div>`;

  // colonne de gauche : photo, contact, compétences, langues, centres d'intérêt
  let cote = CV.photo ? `<img class="photo" src="${esc(CV.photo)}" alt="Photo de ${esc(CV.nom)}">` : "";
  cote += bloc("Contact", liste(CV.contact));
  cote += bloc("Compétences", CV.competences.map((g) => `<h3>${esc(g.groupe)}</h3>${liste(g.items)}`).join(""));
  if (CV.langues && CV.langues.length) cote += bloc("Langues", liste(CV.langues));
  if (CV.interets && CV.interets.length) cote += bloc("Centres d'intérêt", liste(CV.interets));

  // colonne de droite : nom, profil, formation, travaux, expérience
  let corps = `
    <header class="entete">
      <h1>${esc(CV.nom)}</h1>
      <p class="titre">${esc(CV.titre)}</p>
    </header>
    <p class="accroche">${txt(CV.accroche)}</p>`;
  corps += bloc("Formation", CV.formation.map(entree).join(""));
  if (CV.travaux && CV.travaux.length) {
    const lien = CV.portfolio ? `<p class="lien">Dossiers complets : ${esc(CV.portfolio)}</p>` : "";
    corps += bloc("Travaux", CV.travaux.map(entree).join("") + lien);
  }
  corps += bloc("Expérience", CV.experience.map(entree).join(""));

  document.getElementById("cv").innerHTML = `<aside class="cote">${cote}</aside><div class="corps">${corps}</div>`;
})();
