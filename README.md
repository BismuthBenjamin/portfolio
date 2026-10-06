# Portfolio — Benjamin Bismuth

Site statique (HTML, CSS, JS, sans dépendance) pour GitHub Pages.

## Mettre en ligne

1. Crée un dépôt GitHub (par exemple `portfolio`) et envoie tout le contenu de ce dossier à la racine.
2. Dépôt > Settings > Pages > Source : `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le site apparaît sur `https://TON-PSEUDO.github.io/portfolio/`. Pour une adresse plus courte, nomme le dépôt `TON-PSEUDO.github.io`.

Les PDF pèsent 31 Mo et 11 Mo : sous la limite GitHub (100 Mo par fichier), mais tu peux les compresser si tu veux un dépôt plus léger.

## À personnaliser

- `index.html` : cherche `TODO` (email, LinkedIn, GitHub).
- Lien direct vers un dossier : `…/#israel` ou `…/#canicule`.

## Ajouter un dossier

1. Exporte les pages en JPEG dans `assets/img/<id>/` (`cover-01.jpg`, `s-02.jpg`, `s-03.jpg`…).
2. Ajoute l'entrée dans `DOSSIERS` en haut de `app.js`.
3. Copie un bloc `<section class="dossier">` dans `index.html`. Sur chaque image, `data-page` indique la page où s'ouvre le lecteur (0 = couverture, 1 = `s-02`, etc.).

Commande pour régénérer les images depuis un PDF :

```
pdftoppm -jpeg -jpegopt quality=78 -scale-to-x 1500 -scale-to-y -1 -f 2 -l N dossier.pdf assets/img/<id>/s
```
