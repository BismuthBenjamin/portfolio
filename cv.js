// Met en page le contenu défini dans cv.html (objet CV). Rien à modifier ici pour changer le texte.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // un texte "À COMPLÉTER" est surligné pour qu'on ne l'oublie pas avant d'envoyer le CV
  const txt = (s) => (/À COMPLÉTER/.test(s) ? `<mark>${esc(s)}</mark>` : esc(s));
  const liste = (items) => `<ul>${items.map((i) => `<li>${txt(i)}</li>`).join("")}</ul>`;
  const bloc = (titre, contenu) => `<section class="bloc"><h2><span>${esc(titre)}</span></h2>${contenu}</section>`;
  const plein = (a) => a && a.length;

  const entree = (e) => `
    <div class="entree">
      <div class="tete">
        <h3>${txt(e.titre)}</h3>
        ${e.dates ? `<span class="dates">${txt(e.dates)}</span>` : ""}
      </div>
      ${e.lieu ? `<p class="lieu">${txt(e.lieu)}</p>` : ""}
      ${plein(e.points) ? liste(e.points) : ""}
      ${e.cours ? `<p class="cours"><b>Cours :</b> ${txt(e.cours)}</p>` : ""}
    </div>`;

  // bandeau : poste recherché, nom, contact, photo
  const bandeau = `
    <header class="bandeau">
      <div>
        <h1>${esc(CV.poste)}</h1>
        <p class="nom">${esc(CV.nom)}</p>
        <p class="contact">${CV.contact.map((c) => `<span>${esc(c)}</span>`).join("")}</p>
      </div>
      ${CV.photo ? `<img class="photo" src="${esc(CV.photo)}" alt="Photo de ${esc(CV.nom)}">` : ""}
    </header>`;

  const principal = bloc("Expérience professionnelle", CV.experience.map(entree).join(""))
    + bloc("Formation", CV.formation.map(entree).join(""));

  let cote = "";
  if (plein(CV.savoirEtre)) cote += bloc("Savoir-être", liste(CV.savoirEtre));
  if (plein(CV.competences)) cote += bloc("Compétences", liste(CV.competences));
  if (plein(CV.logiciels)) {
    cote += bloc("Logiciels", `<ul>${CV.logiciels.map((l) => `<li><b>${esc(l.nom)}</b>${l.usage ? ` : ${esc(l.usage)}` : ""}</li>`).join("")}</ul>`);
  }
  if (plein(CV.langues)) cote += bloc("Langues", liste(CV.langues));
  if (plein(CV.interets)) cote += bloc("Intérêts", liste(CV.interets));

  document.getElementById("cv").innerHTML = bandeau
    + `<div class="profil">${bloc("Profil", `<p>${txt(CV.profil)}</p>`)}</div>`
    + `<div class="colonnes"><div class="principal">${principal}</div><aside class="cote">${cote}</aside></div>`;
})();
