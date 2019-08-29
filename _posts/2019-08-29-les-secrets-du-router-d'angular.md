---
layout: post
title: "Les secrets du Router d'Angular"
date: 2019-08-29 19:22:26
image: 'https://kodcu.com/wp/wp-content/uploads/2019/06/routing-basics-icon@2x-1.png?fit=660%2C520&ssl=1&w=640'
description: 
category: 'documentation'
tags:
- angular
- routing
twitter_text:
introduction:
---

Le routing est un élément inévitable dans une Application Web.
Nous allons donc nous concentrer sur cette partie du frawmework Angular.

## C'est quoi le routing ?

Le système de routing est la gestion de l'affichage via l'URL dans le navigateur. Le fait d'avoir l'url `/home` affichera des informations différentes de l'url `/contact` par exemple.

Pour que cela fonctionne, il faut que ça soit le JavaScript qui ai la main sur l'url à la place du navigateur. Cela est possible de plusieurs façons:
* **Path location** *(par défaut)*: utilise la fonction `pushstate` de l'API HTML5 qui permet de changer l'URL sans que le navigateur ne se préocupe d'aller chercher la page sur l'URL. Exemple d'url: `http://localhost:4200/home`.

    *Gardez à l'esprit qu'il faudra configurer votre server de fichiers statiques pour qu'il ai un fallback non pas sur une page 404 mais sur l'`index.html`. Le serveur ne connaitra pas le dossier `home` en cas de rafraichissement de la page. Vous pouvez trouver les différentes configurations serveur [ici](https://angular.io/guide/deployment#server-configuration).*
* **Hash location** : utilise les fragments (aussi appellés "ancre") afin d'éviter toute communication des données du routing entre le navigateur et le serveur. Exemple d'url: `http://localhost:4200/#/home`.

    *Cela n'est donc pas compatible avec Angular Universal.*

Les bonnes pratiques pour la création d'urls sont les même que pour la méthode `GET` des API REST.

## Aperçu du module

Le module a utiliser est le `RouterModule` qu'il faudra importer depuis le package `@angular/router`.

Ce module contient deux fonctions statiques dont vous commencez probablement à avoir l'habitude:
* `forRoot`: permet d'initialiser tout (principalement des services) ce qui ne doit être initialisé qu'une seule fois par application. L'initialisation du routing principal se fera également ici. Il faudra donc limiter l'utilisation de cette fonction à l'`App(Routing)Module`.
* `forChild`: permet d'initialiser les routes d'un module chargé en **lazy-loading**. La découpe du routing en plusieurs fichiers est donc possible.

L'utilisation d'**aucune de ces fonctions** permet d'utiliser le système de route (comme la directive `routerLink`), dans un module séparé, sans ajouter de configuration supplémentaire.

```ts
// AppRoutingModule
RouterModule.forRoot(routes)
// FeatureRoutingModule
RouterModule.forChild(routes)
// SharedModule
RouterModule
```

## Fonctionnement de base des routes

Concentrons nous sur les éléments les plus utilisés d'une route (l'interface complète peut être retrouvée [ici](https://angular.io/api/router/Route)):

```ts
interface Route {
  path?: string
  pathMatch?: string
  component?: Type<any>
  redirectTo?: string
  canActivate?: any[]
  canDeactivate?: any[]
  canLoad?: any[]
  data?: Data
  children?: Routes
  loadChildren?: LoadChildren,
  ...
}
```

### Utilisation simple

Voici une utilisation très simple:
```ts
const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'contact', component: ContactComponent },
    { path: '**', redirectTo: '/home' }
];
```

Vous pouvez remarquer deux path étranges qui sont, en réalité, les seuls obligatoires pour le bon fonctionnement de notre routing:
* `''`: représente la racine de l'application. (exemple: `http://localhost:4200/`)
* `'**'`: représente toutes les urls n'existants pas dans la liste des routes donnée. Celle est en quelque sorte notre page "404". (exemple: `http://localhost/blabla`)

L'option choisie dans cette exemple est de les rediriger vers la page "home" à l'aide de l'attribut `redirectTo`.
L'attibut `pathMatch` mis à la valeur `full` permet de déterminer que ce cas ne doit être exécuté que si le path complètement vide (soit "/" ou "") mais absolument rien d'autre.

Concentrons nous maintenant sur les path connus ("home" et "contact"). Vous pouvez voir que nous spécifions le composant à afficher dans ces deux cas, mais où vont-ils s'afficher ?
C'est là que le composant `<router-outlet></router-outlet>` entre en jeux. Ce composant vous permet de choisir où le composant géré par le router s'affichera dans votre application.

### Utilisation de router-outlet imbriqués

Prenons par exemple le fait que nous voulons le même header et le même footer sur toutes les pages de notre application sauf sur la page de connexion. Un premier réflex pourait être d'ajouter ces composant dans l'`AppComponent` au même niveau que notre router-outlet.

*app.component.html :*
```html
<app-header></app-header>
<router-outlet></router-outlet>
<app-footer></app-footer>
```
Mais comment peux-t'on masquer ces éléments dans le cas où nous nous trouvons sur la page de connexion ? Non nous n'utiliserons pas de <del>`*ngIf`</del>  pour arriver à notre faim. Heureusement Angular nous permet de pouvoir avec plusieurs router-outlet imbriqués.

Créons alors un nouveau composant "container" qui s'occupera d'ajouter le header ainsi que le footer seulement dans certains cas et nettoyons notre AppComponent.

*app.component.html :*
```html
<router-outlet></router-outlet>
```

*container.component.html :*
```html
<app-header></app-header>
<router-outlet></router-outlet>
<app-footer></app-footer>
```

Regardons maintenant comment arriver à remplir plusieurs router-outlet. Cela est possible grâce aux attributs `children` et `loadChildren` <sup>(lazy-loadig)</sup>.

```ts
const routes: Routes = [
    { path: '', component: ContainerComponent, children: [
        { path: 'home', component: HomeComponent },
        { path: 'contact', component: ContactComponent },
    ] },
    { path: 'signin': component: SigninComponent }, 
    { path: '**', redirectTo: '/home' }
];
```

Avec cette configuration nous pourons retrouver dans les router-outlet
* de `app.component.html`: les éléments de premier niveau (ContainerComponent ou SigninComponent);
* de `container.component.html`: les éléments de second niveau (HomeComponent, ContactComponent).

### Le lazy-loading

## Configurations

## Sécurité



