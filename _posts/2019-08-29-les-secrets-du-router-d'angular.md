---
layout: post
title: "Les secrets du Router d'Angular"
date: 2019-08-29 19:22:26
image: 'https://kodcu.com/wp/wp-content/uploads/2019/06/routing-basics-icon@2x-1.png?fit=660%2C520&ssl=1&w=640'
description: En savoir plus sur le routing d'Angular.
category: 'documentation'
tags:
- angular
- routing
twitter_text: En savoir plus sur le routing d'Angular.
introduction: En savoir plus sur le routing d'Angular.
github_username: gilsdav
linkedin_username: david-gilson-innovate
---

Le routing est un élément inévitable dans une Application Web.
Nous allons donc nous concentrer sur cette partie du framework Angular.

## C'est quoi le routing ?

Le système de routing est la gestion de l'affichage via l'URL dans le navigateur. Le fait d'avoir l'url `/home` affichera des informations différentes de l'url `/contact` par exemple.

Pour que cela fonctionne, il faut que ça soit le JavaScript qui ai la main sur l'url à la place du navigateur. Cela est possible de plusieurs façons:
* **Path location** *(par défaut)*: utilise la fonction `pushState` de l'API HTML5 qui permet de changer l'URL sans que le navigateur ne se préocupe d'aller chercher la page sur l'URL. Exemple d'url: `http://localhost:4200/home`.

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

## Fonctionnement des routes

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
  loadChildren?: LoadChildren
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
    { path: 'signin', component: SigninComponent }, 
    { path: '**', redirectTo: '/home' }
];
```

Avec cette configuration nous pourons retrouver dans les router-outlet
* de `app.component.html`: les éléments de premier niveau (ContainerComponent ou SigninComponent);
* de `container.component.html`: les éléments de second niveau (HomeComponent, ContactComponent).

### Paramètres

TODO

### Le lazy-loading

Le lazy-loading permet de scinder votre "dist" en plusieurs fichiers qui ne seront chargés que si, et quand, une utilisation est nécessaire.

Si vous faite un recherche à ce propos sur google, vous tomberez probablement sur un syntaxe de ce type: `loadChildren: './admin/admin.module#AdminModule'`. Il s'agit d'une syntaxe maintenant dépréciée qui a été créée par Angular afin d'être décortiquée et d'utiliser les informations avec SystemJS.

A partir de la version 8 d'Angular, nous allons éviter SystemJS et utiliser la puissance du mécanisme d'[import de l'ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

Cependant le principe est le même dans les deux cas. Il s'agit de définir:
* où se trouver le fichier à charger (`import('./admin/admin.module')`),
* quelle classe du fichier représente le NgModule (`.then(m => m.AdminModule)`).

La nouvelle syntaxe complète est donc la suivante: `loadChildren: import('./admin/admin.module').then(m => m.AdminModule)`.
*Attention que vous ne pouvez pas modifier cette syntaxe (en ajoutant par exemple plus de code dans le `then`) car le build AOT ne la comprendra pas. Il est donc impératif de la respecter.*

```ts
const routes: Routes = [
    ...
    { path: 'admin', loadChildren: import('./admin/admin.module').then(m => m.AdminModule) },
    ...
];
```

### Données statiques

Si vous avez besoin de détarminer des données comme le titre dans la page celon l'url, il n'est pas conseillé de décortiquer l'url afin de comprendre le contexte.
Pour pouvoir faire cela, nous pourrions directement associer le titre à une route.

Cela est possible à l'aide de l'attribut `data` des routes.

```ts
const routes: Routes = [
    { path: '', component: ContainerComponent, children: [
        { path: 'home', component: HomeComponent, data: { myTitle: 'accueil' } },
        { path: 'contact', component: ContactComponent, data: { myTitle: 'contact' } },
    ] },
    ...
];
```

La donnée est récupérable à l'aide de l'`ActivatedRoute`.

```ts
constructor(private route: ActivatedRoute, private title: Title) {}

ngOnInit() {
    this.title.setTitle(this.route.snapshot.data.myTitle);
}
```

## Navigation

Il est possible naviguer aussi bien depuis l'HTML que le TypeScript. Découvrons comment.

### HTML

Pour naviguer nous allons utiliser la directive [`routerLink`](https://angular.io/api/router/RouterLink).

Cette directive devrait être uniquement utilisée sur des balises de lien (`a`) mais elle peut en réalité se mettre sur n'importe quelle balise HTML. Cependant, le fait de le mettre en attribut d'un `a` génère également un `href` afin de pouvoir naviguer même si le JavaScript est désactivé côté client et que vous utilisez Universal.

```ts
<a [routerLink]="['/admin','users']">Go to user list</a>
```

Nous pouvons utiliser un string ou un tableau de string dans le routerLink (contrairement en TypeScript), cela revient au même résultat mais je préconise le fait de toujours utiliser la même syntaxe et c'est le **tableau** qui se trouve être le plus utile. En effet cela permet de rendre une partie de l'url **dynamique** comme un paramètre.

```ts
<a [routerLink]="['/admin','users', id]">Go to user</a>
```

#### Paramètres

Les paramètres du routerLink se font via des inputs (attributs) de cette directive.

Nous pouvons ajouter des élements dans l'url:
* `queryParams`: permet d'utiliser les query params (exemple: `?param1=test1&param2=test2`)
* `fragment`: permet d'ajouter une ancre dans l'url (exemple: `#mon-ancre`)

```ts
<a [routerLink]="['/admin','users', id]" [queryParams]="{param1: 'test1', param2: 'test2'}" fragment="email" >
    Go to user email
</a>
```

Ou gérer notre stratégie de "présevation de données" en cas de changement d'url
* `preserveQueryParams`: préserve les query params actuels (ne tien pas en compte les nouveaux)
* `mergeQueryParams`: merge les query params actuels et les nouveaux
* `preserveFragment`: garder le fragment au changement d'url

```ts
<a [routerLink]="['/admin','users', otherId]"  preserveQueryParams preserveFragment >
    Go to other user
</a>
```

### TypeScript

L'API TypeScript pour la navigation ([Router](https://angular.io/api/router/Router)) permet de naviguer dans notre application de deux façons (via deux fonctions):
* `navigate`: utilisation similaire au routerLink
* `navigateByUrl`: naviguer à l'aide d'une url déjà construite (exemple: `/admin/users/1?param1=test1`)

Pour avoir accès à cette API, il vous suffit d'injecter `Router`.

```ts
constructor(private router: Router) {}
```

#### Navigate

Commençons par reproduire un exemple complet du routerLink avec la fonction navigate.
```ts
this.router.navigate(['/admin','users', this.id], {
    queryParams: {param1: 'test1', param2: 'test2'},
    queryParamsHandling: 'merge'
    preserveFragment: true,
});
```

Vous remarquerez que l'utilisation est sensiblement la même.

Jetons alors un coup d'oeil sur les paramètres additionels que le navigate nous fournis:
* `skipLocationChange`: Naviguer vers une page sans que cela n'impact l'URL.
* `replaceUrl`: Remplacer l'url courante par la nouvelle (l'ancienne url ne sera plus disponible dans l'historique du navigateur).
* `relativeTo`: Faire une navigation relative à une route.

Il n'y a pas vraiment besoin de plus d'explication pour les deux premières options, mais la dernière demande peut-être un petit exemple:
> Nous somme sur un utilisateur précis `/admin/users/1` et nous voulons faire un bouton transversal qui permet de remonter le "fil d'ariane" (autrement dit, nous voulons naviguer vers `/admin/users` sans connaite cette url).

Nous alons pouvoir récupérer le parent de l'url active et demander une navigation relative à cette route.

```ts
constructor(private route: ActivatedRoute, private router: Router) {}
...
// Navigation vers le parent
this.router.navigate(['.'], { relativeTo: this.route.parent });
// Navigation vers un autre enfant
this.router.navigate([otherId], { relativeTo: this.route.parent });
```

#### NavigateByUrl

Si vous connaissez déjà l'url de destination (exemple: `/admin/users/1?param1=test1`), utilisez la fonction `navigateByUrl`.
```ts
this.router.navigateByUrl(`/admin/users/1?param1=test1`, { preserveFragment: true });
```

Les options sont identiques à celles de la fonction `navigate` à l'exception pret que les options modifiants l'url fournie en premier paramètres (comme `queryParams`, `fragment` ou `relativeTo`) ne fonctionneront pas.

## Configuration

### Globale

La configuration global se fait au niveau de l'utilisation de la fonction statique `forRoot` du `RouterModule`.

Comme pour les routes, concentrons nous sur les options les plus utilisés (l'interface est disponible [ici](https://angular.io/api/router/ExtraOptions)):

```ts
interface ExtraOptions {
  useHash?: boolean
  preloadingStrategy?: PreloadAllModules | NoPreloading
  onSameUrlNavigation?: 'reload' | 'ignore'
  scrollPositionRestoration?: 'disabled' | 'enabled' | 'top'
  anchorScrolling?: 'disabled' | 'enabled'
  ...
}
```

Comme expliqué [précédement](#C'est-quoi-le-routing-?), il est possible de changer la stratégie de routing de l'API HTML5 en ancres, cela est possible via l'option `useHash`.

#### Lazy-load preloading

L'option `preloadingStrategy` permet de changer la stratégie de "préloading" pour les modules qui sont en lazy-loading. Le fait de changer cette option en `PreloadAllModules` ( `NoPreloading` est utilisé par défaut ) chargera tous les modules une fois que l'application sera est fonctionnelle.

#### Rafraichissement

Par défaut, si la route (pas spécialement l'url) source est identique à celle destination, Angular n'effectue aucun rafraichissement. Cela semble logique mais peut ne pas être le comportement voulu surtout pour des routes avec paramètre.

Par défaut nous seront obliger d'écouter nous même les navigations:
```ts
this.router.events.pipe(filter(e => e instanceof NavigationEnd).subscribe((e) => { ... });
```

Pour éviter de devoir faire cela, nous pouvons appliquer l'option: `onSameUrlNavigation: 'reload'`.

#### Scroll



### Déployement sous dossier
Si votre url de base de votre site ressemble à `http://mondomaine.com/blog`, vous utilisez un sous dossier (ici "blog").

## Sécurité



