// Lecteur de dossiers en double page. Pour ajouter un dossier : déposer les images
// dans assets/img/<id>/ et ajouter une entrée ci-dessous.
const DOSSIERS = {
  rubaya: {
    name: "À quel rythme s'étend la mine de Rubaya ?",
    pdf: "assets/pdf/rubaya.pdf",
    dir: "assets/img/rubaya/",
    first: 2, last: 10,
    cover: "cover-01.jpg",
    alt: "À quel rythme s'étend la mine de Rubaya ?"
  },
  israel: {
    name: "Trois Israël et une frontière invisible",
    pdf: "",                          // PDF de 31 Mo, pas encore en ligne
    dir: "assets/img/israel/",
    first: 2, last: 27,               // s-02.jpg … s-27.jpg (doubles pages)
    cover: "cover-01.jpg",
    alt: "Trois Israël et une frontière invisible"
  },
  canicule: {
    name: "Où la canicule tue-t-elle dans le Val-de-Marne ?",
    pdf: "assets/pdf/canicule.pdf",
    dir: "assets/img/canicule/",
    first: 2, last: 9,
    cover: "cover-01.jpg",
    alt: "Où la canicule tue-t-elle dans le Val-de-Marne ?"
  },
  "liban-bahrein": {
    name: "Protester au Liban et à Bahreïn",
    pdf: "assets/pdf/liban-bahrein.pdf",
    dir: "assets/img/liban-bahrein/",
    first: 2, last: 3,
    cover: "cover-01.jpg",
    alt: "Protester au Liban et à Bahreïn"
  },
  cv: {
    name: "Curriculum vitæ",
    pdf: "assets/pdf/cv-benjamin-bismuth.pdf",
    dir: "assets/img/cv/",
    pages: ["cv-01.jpg"],             // ajouter "cv-02.jpg" si le CV fait deux pages
    alt: "CV de Benjamin Bismuth"
  }
};

const $ = (id) => document.getElementById(id);
const viewer = $("viewer"), img = $("v-img"), thumbs = $("v-thumbs");
let current = null, pages = [], index = 0, lastFocus = null;

const pad = (n) => String(n).padStart(2, "0");

function buildPages(d) {
  if (d.pages) return d.pages.map((f, k) => ({ src: d.dir + f, label: `Page ${k + 1}` }));
  const list = [{ src: d.dir + d.cover, label: "Couverture" }];
  for (let i = d.first; i <= d.last; i++) {
    list.push({ src: `${d.dir}s-${pad(i)}.jpg`, label: `Double page ${i - d.first + 1}` });
  }
  return list;
}

function show(i) {
  index = Math.max(0, Math.min(pages.length - 1, i));
  const p = pages[index];
  img.src = p.src;
  img.alt = `${DOSSIERS[current].alt} — ${p.label}`;
  $("v-count").textContent = `${index + 1} / ${pages.length}`;
  $("v-prev").disabled = index === 0;
  $("v-next").disabled = index === pages.length - 1;
  [...thumbs.children].forEach((b, k) => {
    const on = k === index;
    b.setAttribute("aria-selected", on);
    if (on) b.scrollIntoView({ inline: "center", block: "nearest" });
  });
  // précharge la page suivante
  if (pages[index + 1]) new Image().src = pages[index + 1].src;
}

function open(id, start = 0) {
  current = id;
  const d = DOSSIERS[id];
  pages = buildPages(d);
  $("v-name").textContent = d.name;
  $("v-pdf").href = d.pdf || "#";
  $("v-pdf").hidden = !d.pdf;
  thumbs.innerHTML = "";
  pages.forEach((p, k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", p.label);
    b.innerHTML = `<img src="${p.src}" alt="" loading="lazy">`;
    b.addEventListener("click", () => show(k));
    thumbs.appendChild(b);
  });
  const single = pages.length < 2;
  thumbs.hidden = single;
  $("v-prev").hidden = $("v-next").hidden = single;
  lastFocus = document.activeElement;
  viewer.hidden = false;
  document.body.classList.add("lock");
  show(start);
  $("v-close").focus();
  history.replaceState(null, "", "#" + id);
}

function close() {
  viewer.hidden = true;
  document.body.classList.remove("lock");
  history.replaceState(null, "", location.pathname);
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll("[data-open]").forEach((el) =>
  el.addEventListener("click", () => open(el.dataset.open, Number(el.dataset.page || 0)))
);
$("v-close").addEventListener("click", close);
$("v-prev").addEventListener("click", () => show(index - 1));
$("v-next").addEventListener("click", () => show(index + 1));

document.addEventListener("keydown", (e) => {
  if (viewer.hidden) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowLeft") show(index - 1);
  else if (e.key === "ArrowRight") show(index + 1);
  else if (e.key === "Home") show(0);
  else if (e.key === "End") show(pages.length - 1);
});

// balayage tactile
let x0 = null;
viewer.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener("touchend", (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1));
  x0 = null;
});

// bouton clair / sombre, mémorisé dans le navigateur
$("theme").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// invitation à ouvrir la carte interactive : affichée après un court délai, jamais par-dessus le lecteur,
// et plus du tout une fois fermée (ou une fois la carte ouverte)
const invite = $("invite");
const inviteVue = () => { try { return localStorage.getItem("invite-carte") === "vue"; } catch (e) { return false; } };
const inviteFermer = () => { invite.hidden = true; try { localStorage.setItem("invite-carte", "vue"); } catch (e) {} };
if (!inviteVue()) setTimeout(() => { if (viewer.hidden) invite.hidden = false; }, 1500);
$("invite-fermer").addEventListener("click", inviteFermer);
invite.querySelector("a").addEventListener("click", inviteFermer);

// lien direct : monsite/#israel ouvre le lecteur
const hash = location.hash.slice(1);
if (DOSSIERS[hash]) open(hash);
