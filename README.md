# [Nom du club] — site du club de basket

Page d’accueil du club, réalisée à partir de la maquette Claude Design « Page d’accueil »
(export d’origine conservé dans `Page d’accueil-html.zip`).

HTML, CSS et JavaScript simples : aucune dépendance, aucune étape de compilation.

## Voir le site en local

```sh
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Organisation des fichiers

```
index.html              la page
assets/css/styles.css   les styles (couleurs et polices en tête de fichier)
assets/js/main.js       menu mobile, compte à rebours, formulaire d’inscription
assets/img/             parquet, salle, cuir, ballon et icône d’onglet
```

## À compléter avant la mise en ligne

Les textes entre crochets sont des emplacements à remplacer (chercher `[` dans `index.html`) :

- `[Nom du club]`, `[NOM DU CLUB]`, `[Ville]` et `[ANNÉE]` (écusson du pied de page), y compris dans le `<title>` et les balises `<meta>` ;
- `[Adversaire]` dans l’agenda ;
- `[Jours et horaires]` et `[Montant]` dans les cartes des catégories ;
- `[Logo partenaire]` ;
- l’adresse du gymnase dans le pied de page.

Les liens des réseaux sociaux et plusieurs liens du pied de page (mentions légales, boutique, contact…)
pointent pour l’instant vers le haut de la page (`#top`) : il faudra les faire pointer vers les vraies adresses.

## Changer la couleur du club

Modifier `--accent` en haut de `assets/css/styles.css` (orange `#EF6A23` par défaut).
La maquette prévoyait aussi `#F04A3E` (rouge), `#35A5FF` (bleu ciel) et `#F5B414` (jaune).
Penser à reporter la couleur dans `assets/img/favicon.svg`.

## Mettre à jour l’agenda

Chaque rendez-vous est un `<li class="ticket">` de la section « Agenda ».

Pour un **match à domicile**, ajouter l’attribut `data-match-label` sur le `<li>` : le bloc
« Prochain match à domicile » affiche alors ce texte et un compte à rebours jusqu’à la date
indiquée dans la balise `<time>` du billet. Garder le fuseau horaire dans cette date
(`+02:00` en heure d’été, `+01:00` en heure d’hiver) :

```html
<li class="ticket" data-match-label="Seniors masculins contre [Adversaire], samedi 3 octobre à 20&nbsp;h&nbsp;30.">
  …
  <time datetime="2026-10-03T20:30+02:00">Samedi 3 octobre, 20&nbsp;h&nbsp;30</time>
```

Une fois tous les matchs passés, le compte à rebours disparaît tout seul.
Le texte du tableau lumineux défilant (`.led-text`, présent deux fois à l’identique) se modifie à la main.

## Recevoir les demandes d’inscription

En l’état, le formulaire vérifie l’adresse e-mail et affiche la confirmation, mais **n’envoie la demande nulle part**.
Pour la recevoir par e-mail, créer un formulaire sur un service comme [Formspree](https://formspree.io)
puis indiquer son adresse dans l’attribut `action` du formulaire :

```html
<form class="join-form" id="form-inscription" action="https://formspree.io/f/votre-identifiant" method="post" novalidate>
```

Champs envoyés : `email` et `categorie` (`mini`, `jeunes` ou `adultes`).
En cas d’échec de l’envoi, un message invite la personne à réessayer.

## Mettre en ligne avec GitHub Pages

1. Dans le dépôt GitHub : **Settings → Pages**.
2. Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site est publié à l’adresse `https://<votre-compte>.github.io/Basket-site-/`.

Tous les chemins sont relatifs : le site fonctionne aussi dans un sous-dossier ou chez un autre hébergeur.

## Accessibilité

Navigation au clavier avec focus visible, lien d’évitement « Aller au contenu », textes alternatifs
sur les schémas, et animations coupées pour les personnes qui ont activé « Réduire les animations »
dans les réglages de leur appareil.
