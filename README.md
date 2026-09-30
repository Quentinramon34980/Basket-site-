# BC Valbrune — site du club de basket

Site du club en trois pages : l’accueil, réalisé à partir de la maquette Claude Design « Page d’accueil »
(export d’origine conservé dans `Page d’accueil-html.zip`), puis une page événements et une page contact
dans le même style.

HTML, CSS et JavaScript simples : aucune dépendance, aucune étape de compilation.

## Voir le site en local

```sh
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Organisation des fichiers

```
index.html              l’accueil
evenements.html         calendrier de la saison, filtres, appel aux bénévoles
contact.html            formulaire, accès au gymnase, questions fréquentes
assets/css/styles.css   les styles (couleurs, polices et courbe de mouvement en tête de fichier)
assets/js/main.js       menu, animations, compte à rebours, formulaires
assets/img/             parquet, salle, cuir, ballon et icône d’onglet
```

## Contenu fictif à remplacer

Le club et toutes ses informations sont inventés pour que le site soit complet. Avant la mise en ligne,
remplacer dans `index.html`, `evenements.html` et `contact.html` :

- le nom **BC Valbrune**, la ville de **Valbrune** et l’année de création **1978** (écusson du pied de page),
  y compris dans les `<title>` et les balises `<meta>` ;
- l’adresse : **Gymnase des Tilleuls, 12 avenue Jean-Jaurès, 26400 Valbrune** (pied de page des deux pages
  et section « Venir au gymnase ») ;
- le téléphone **04 65 71 26 40**, dans une tranche réservée par l’Arcep aux œuvres de fiction, et l’e-mail
  **contact@bc-valbrune.fr** ;
- les adversaires de l’agenda (**ES Castelmoure**, **Saint-Aurèle Basket**) ;
- les 17 rendez-vous de la page événements : adversaires (Union Basket Lestrade, AS Belcombe,
  Étoile de Montcalvy), lieux, horaires et tarifs (stages à **95 €**, loto, soirée du club) ;
- les horaires d’entraînement et les cotisations (**130 €**, **160 €**, **190 €**) des cartes des catégories,
  repris dans les questions fréquentes ;
- les cinq partenaires (Ville de Valbrune, Maison Fabre, Garage Delorme, Pharmacie des Tilleuls, Le Comptoir du Sport) ;
- les comptes Instagram, Facebook et YouTube (`bcvalbrune`) ;
- les permanences, les lignes de bus, le parking et le plan d’accès de la page contact.

Les liens « Mentions légales » et « Confidentialité » renvoient encore en haut de page : ces pages restent à écrire.

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
<li class="ticket" data-match-label="Seniors masculins contre l’ES Castelmoure, samedi 3 octobre à 20&nbsp;h&nbsp;30.">
  …
  <time datetime="2026-10-03T20:30+02:00">Samedi 3 octobre, 20&nbsp;h&nbsp;30</time>
```

Une fois tous les matchs passés, le compte à rebours disparaît tout seul.
Le texte du tableau lumineux défilant (`.led-text`, présent deux fois à l’identique) se modifie à la main.

## Mettre à jour la page événements

Chaque rendez-vous est un `<li class="event">` rangé dans le `<section class="month">` de son mois.
Pour en ajouter un, copier un rendez-vous du même type et adapter :

- `data-type` : `matchs`, `stages` ou `club` (c’est ce que lisent les filtres) ;
- la classe `event--stages` ou `event--club` pour la couleur du talon (aucune pour un match) ;
- la date dans la balise `<time datetime="…">`, avec son fuseau horaire ;
- `data-end="…"` quand le rendez-vous dure plusieurs heures ou plusieurs jours ;
- `data-match-label="…"` pour un match à domicile : le tableau d’affichage en haut de la page
  compte alors jusqu’à lui, comme sur l’accueil.

Le nombre de rendez-vous se calcule tout seul, et un rendez-vous terminé passe automatiquement en grisé
avec la mention « Terminé ». Un lien vers `evenements.html#stages` (ou `#matchs`, `#club`) ouvre le
calendrier déjà filtré : c’est ce qu’utilise « Stages vacances » dans le pied de page.

## Recevoir les inscriptions et les messages

En l’état, les deux formulaires vérifient ce qui est saisi et affichent leur confirmation, mais
**n’envoient rien**. Pour recevoir les demandes par e-mail, créer un formulaire sur un service comme
[Formspree](https://formspree.io) puis indiquer son adresse dans l’attribut `action` de chaque formulaire :

```html
<form class="join-form" id="form-inscription" action="https://formspree.io/f/votre-identifiant" method="post" novalidate>
<form class="contact-form" id="form-contact" action="https://formspree.io/f/votre-identifiant" method="post" novalidate>
```

Champs envoyés :

- inscription (accueil) : `email` et `categorie` (`mini`, `jeunes` ou `adultes`) ;
- contact : `sujet` (`inscription`, `partenariat`, `benevolat`, `boutique` ou `autre`), `nom`, `email`,
  `telephone` et `message`.

En cas d’échec de l’envoi, un message invite la personne à réessayer.

Un lien vers `contact.html#partenariat` (ou `#benevolat`, `#boutique`…) ouvre la page contact avec ce sujet
déjà choisi : c’est ce qu’utilisent « Devenir partenaire », « Devenir bénévole » et « Boutique du club ».

## Animations

Chaque mouvement a un rôle, et tous partagent la même courbe (`--ease-out`) :

- **apparition au défilement** : les blocs marqués `data-reveal` montent en fondu quand ils arrivent à l’écran,
  en cascade dans un `data-reveal-stagger` ; les graphiques racontent leur donnée (les tirs s’inscrivent un à un,
  le bilan de janvier s’étend, le trajet à pied se dessine sur le plan) ;
- **parallaxe** : sur l’accueil, le terrain dessiné, le ballon, le fond de la salle et le ballon de l’inscription
  défilent à des vitesses différentes (`data-parallax-hero` et `data-parallax`) ;
- **survol** : les cartes des catégories se soulèvent et mènent à l’inscription, les boutons s’enfoncent au clic,
  le tableau lumineux s’arrête pour être lu, le + des questions fréquentes devient une croix ;
- **curseur** (souris uniquement) : le ballon et le badge de l’accueil suivent légèrement le curseur,
  les maillots se balancent vers lui, un projecteur éclaire les cartes sombres du club ;
- **page événements** : le compte à rebours y devient le tableau d’affichage de la salle, les rendez-vous
  glissent jusqu’à leur nouvelle place quand on change de filtre, et le nom du mois reste à côté de ses
  rendez-vous pendant le défilement ;
- **repères** : un point orange signale dans le menu la section en cours ou la page ouverte,
  et les pages s’enchaînent en fondu dans les navigateurs compatibles.

Pour retirer un effet sur un élément, supprimer son attribut `data-reveal` ou `data-parallax…`.
Tout mouvement est coupé pour les personnes qui ont activé « Réduire les animations » sur leur appareil :
le contenu s’affiche alors directement.

## Mettre en ligne avec GitHub Pages

1. Dans le dépôt GitHub : **Settings → Pages**.
2. Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site est publié à l’adresse `https://<votre-compte>.github.io/Basket-site-/`.

Tous les chemins sont relatifs : le site fonctionne aussi dans un sous-dossier ou chez un autre hébergeur.

## Accessibilité

Navigation au clavier avec focus visible, lien d’évitement « Aller au contenu », textes alternatifs
sur les schémas et le plan, messages d’erreur des formulaires liés à leur champ et lus par les
lecteurs d’écran, et animations coupées pour les personnes qui ont activé « Réduire les animations ».
