---
author: dgilson
layout: post
title: "Les secrets du Router d'Angular"
date: 2019-08-29 19:22:26
image: '/images/angular-posts/routing.jpg'
description: En savoir plus sur le routing d'Angular.
category: 'documentation'
tags:
- angular
- routing
redirect_from:
- /les-secrets-du-router-d'angular/
twitter_text: En savoir plus sur le routing d'Angular.
introduction: En savoir plus sur le routing d'Angular.
---

Le routing est un élément inévitable dans une Application Web.
Nous allons donc nous concentrer sur cette partie du framework Angular.

Si vous êtes uniquement intéressé pas un point précis du routing, n'hésitez pas à aller voir la [table des matières](#toc).

## C'est quoi le routing ?

Le système de routing est la gestion de l'affichage via l'URL dans le navigateur. Le fait d'avoir l'url `/home` affichera des informations différentes de l'url `/contact` par exemple.

Pour que cela fonctionne, il faut que ça soit le JavaScript qui ait la main sur l'url à la place du navigateur. Cela est possible de plusieurs façons:
* **Path location** *(par défaut)*: utilise la fonction `pushState` de l'API HTML5 qui permet de changer l'URL sans que le navigateur ne se préoccupe d'aller chercher la page sur l'URL. Exemple d'url: `http://localhost:4200/home`.

    *Gardez à l'esprit qu'il faudra configurer votre serveur de fichiers statiques pour qu'il ai un fallback non pas sur une page 404, mais sur l'`index.html`. Le serveur ne connaitra pas le dossier `home` en cas de rafraichissement de la page. Vous pouvez trouver les différentes configurations serveur [ici](https://angular.io/guide/deployment#server-configuration).*
* **Hash location** : utilise les fragments (aussi appelés "ancre") afin d'éviter toute communication des données du routing entre le navigateur et le serveur. Exemple d'url: `http://localhost:4200/#/home`.

    *Cela n'est donc pas compatible avec Angular Universal.*

Les bonnes pratiques pour la création d'urls sont les mêmes que pour la méthode `GET` des API REST.

## Aperçu du module

Le module à utiliser est le `RouterModule` qu'il faudra importer depuis le package `@angular/router`.

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

Concentrons-nous sur les éléments les plus utilisés d'une route (l'interface complète peut être retrouvée [ici](https://angular.io/api/router/Route)):

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

Vous pouvez remarquer deux paths étranges qui sont, en réalité, les seuls obligatoires pour le bon fonctionnement de notre routing:
* `''`: représente la racine de l'application. (exemple: `http://localhost:4200/`)
* `'**'`: représente toutes les urls n'existants pas dans la liste des routes donnée. C'est en quelque sorte notre page "404". (exemple: `http://localhost/blabla`)

L'option choisie dans cet exemple est de les rediriger vers la page "home" à l'aide de l'attribut `redirectTo`.
L'attribut `pathMatch` mis à la valeur `'full'` permet de déterminer que ce cas ne doit être exécuté que si le path est complètement vide (soit "/" ou ""), mais absolument rien d'autre.

Concentrons-nous maintenant sur les paths connus ("home" et "contact"). Vous pouvez voir que nous spécifions le composant à afficher dans ces deux cas, mais où vont-ils s'afficher ?
C'est là que le composant `<router-outlet></router-outlet>` entre en jeux. Ce composant vous permet de choisir où le composant géré par le router s'affichera dans votre application.

### Utilisation de router-outlet imbriqués

Prenons par exemple le fait que nous voulons le même header et le même footer sur toutes les pages de notre application sauf sur la page de connexion. Un premier réflex pourrait être d'ajouter ces composants dans l'`AppComponent` au même niveau que notre router-outlet.

*app.component.html :*
```html
<app-header></app-header>
<router-outlet></router-outlet>
<app-footer></app-footer>
```
Mais comment peut-on masquer ces éléments dans le cas où nous nous trouvons sur la page de connexion ? Non nous n'utiliserons pas de <del>`*ngIf`</del>  pour arriver à nos fins. Heureusement Angular nous permet de faire cela avec plusieurs router-outlet imbriqués.

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

Regardons maintenant comment arriver à remplir plusieurs router-outlet. Cela est possible grâce aux attributs `children` et `loadChildren` <sup>(lazy-loading)</sup>.

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

Avec cette configuration nous pourrons retrouver dans les router-outlet
* de `app.component.html`: les éléments de premier niveau (ContainerComponent ou SigninComponent);
* de `container.component.html`: les éléments de second niveau (HomeComponent, ContactComponent).

### Paramètres

Nous avons, jusqu'à présent, vu des routes statiques, mais comment peut-on rendre une partie de la route dynamique ?

Deux solutions sont possibles:
* **Path param** pour les paramètres requis (exemple: `/users/12345`)
* **Query param** pour les paramètres optionels (exemple: `/login?referrer=/profile`)

*Cela respecte encore une fois la norme REST.*

#### Path param

Les path params se définissent à l'aide du préfix `:` suivi de son nom.

```ts
// Paramètre unique
{ path: 'users/:id', component: UserListComponent }
// Plusieurs paramètres
{ path: 'users/:category/:id', component: UserListComponent }
```

Ce paramètre est alors récupérable via la route active.

```ts
// Synchrone
this.id = this.route.snapshot.params['id'];
// Asynchrone
this.route.params.subscribe(params => this.id = params['id']);
```

#### Query param

Dans ce cas, il n'y a rien à spécifier dans la configuration des routes.
Nous n'avons cas essayer de récupérer le paramètre optionnel.

```ts
// Synchrone
this.referrer = this.route.snapshot.queryParams['referrer'];
// Asynchrone
this.route.queryParams.subscribe(params => this.referrer = params['referrer']);
```

### Le lazy-loading

Le lazy-loading permet de scinder votre "dist" en plusieurs fichiers qui ne seront chargés que si, et quand, une utilisation est nécessaire.

Si vous faite une recherche à ce propos sur google, vous tomberez probablement sur un syntaxe de ce type: `loadChildren: './admin/admin.module#AdminModule'`. Il s'agit d'une syntaxe maintenant dépréciée qui a été créée par Angular afin d'être décortiquée et d'utiliser les informations avec SystemJS.

À partir de la version 8 d'Angular, nous allons éviter SystemJS et utiliser la puissance du mécanisme d'[import de l'ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

Cependant le principe est le même dans les deux cas. Il s'agit de définir:
* où trouver le fichier à charger (`import('./admin/admin.module')`),
* quelle classe du fichier représente le NgModule (`.then(m => m.AdminModule)`).

La nouvelle syntaxe complète est donc la suivante: `loadChildren: import('./admin/admin.module').then(m => m.AdminModule)`.
*Attention que vous ne pouvez pas modifier cette syntaxe (en ajoutant par exemple plus de code dans le `then`), car le build AOT ne la comprendra pas. Il est donc impératif de la respecter.*

```ts
const routes: Routes = [
    ...
    { path: 'admin', loadChildren: import('./admin/admin.module').then(m => m.AdminModule) },
    ...
];
```

### Données statiques

Si vous avez besoin de déterminer des données comme le titre dans la page selon l'url, il n'est pas conseillé de décortiquer l'url afin de comprendre le contexte.
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

Pour naviguer, nous allons utiliser la directive [`routerLink`](https://angular.io/api/router/RouterLink).

Cette directive devrait être uniquement utilisée sur des balises de lien (`a`), mais elle peut en réalité se mettre sur n'importe quelle balise HTML. Cependant, le fait de le mettre en attribut d'un `a` génère également un `href` afin de pouvoir naviguer même si le JavaScript est désactivé côté client et que vous utilisez Universal.

```html
<a [routerLink]="['/admin','users']">Go to user list</a>
```

Nous pouvons utiliser un string ou un tableau de string dans le routerLink (contrairement en TypeScript), cela revient au même résultat, mais je préconise le fait de toujours utiliser la même syntaxe et c'est le **tableau** qui se trouve être le plus utile. En effet cela permet de rendre une partie de l'url **dynamique** comme un paramètre.

```html
<a [routerLink]="['/admin','users', id]">Go to user</a>
```

#### Paramètres

Les paramètres du routerLink se font via des inputs (attributs) de cette directive.

Nous pouvons ajouter des éléments dans l'url:
* `queryParams`: permet d'utiliser les query params (exemple: `?param1=test1&param2=test2`)
* `fragment`: permet d'ajouter une ancre dans l'url (exemple: `#mon-ancre`)

```html
<a [routerLink]="['/admin','users', id]" [queryParams]="{param1: 'test1', param2: 'test2'}" fragment="email" >
    Go to user email
</a>
```

Ou gérer notre stratégie de "préservation de données" en cas de changement d'url
* `preserveQueryParams`: préserve les query params actuels (ne tient pas en compte les nouveaux)
* `mergeQueryParams`: merge les query params actuels et les nouveaux
* `preserveFragment`: garder le fragment au changement d'url

```html
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
    preserveFragment: true
});
```

Vous remarquerez que l'utilisation est sensiblement la même.

Jetons alors un coup d'oeil sur les paramètres additionnels que le navigate nous fournis:
* `skipLocationChange`: Naviguer vers une page sans que cela n'impact l'URL.
* `replaceUrl`: Remplacer l'url courante par la nouvelle (l'ancienne url ne sera plus disponible dans l'historique du navigateur).
* `relativeTo`: Faire une navigation relative à une route.

Il n'y a pas vraiment besoin de plus d'explication pour les deux premières options, mais la dernière demande peut-être un petit exemple:
> Nous sommes sur un utilisateur précis `/admin/users/1` et nous voulons faire un bouton transversal qui permet de remonter le "fil d'ariane" (autrement dit, nous voulons naviguer vers `/admin/users` sans connaitre cette url).

Nous allons pouvoir récupérer le parent de l'url active et demander une navigation relative à cette route.

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

Les options sont identiques à celles de la fonction `navigate` à l'exception prêt que les options modifiants l'url fournie en premier paramètre (comme `queryParams`, `fragment` ou `relativeTo`) ne fonctionneront pas.

## Configuration

### Globale

La configuration globale se fait au niveau de l'utilisation de la fonction statique `forRoot` du `RouterModule`.

Comme pour les routes, concentrons-nous sur les options les plus utilisés (l'interface est disponible [ici](https://angular.io/api/router/ExtraOptions)):

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

Comme expliqué [précédemment](#C'est-quoi-le-routing-?), il est possible de changer la stratégie de routing de l'API HTML5 en ancres, cela est possible via l'option `useHash`.

#### Lazy-load preloading

L'option `preloadingStrategy` permet de changer la stratégie de "préloading" pour les modules qui sont en lazy-loading. Le fait de changer cette option en `PreloadAllModules` ( `NoPreloading` est utilisé par défaut ) chargera tous les modules une fois que l'application sera est fonctionnelle.

#### Rafraichissement

Par défaut, si la route (pas spécialement l'url) source est identique à celle destination, Angular n'effectue aucun rafraichissement. Cela semble logique, mais peut ne pas être le comportement voulu surtout pour des routes avec paramètre.

Par défaut nous serons obligés d'écouter nous-mêmes les navigations:
```ts
this.router.events.pipe(filter(e => e instanceof NavigationEnd).subscribe((e) => { ... });
```

Pour éviter de devoir faire cela, nous pouvons appliquer l'option: `onSameUrlNavigation: 'reload'`.

#### Scroll

Si vos pages dépassent la hauteur de l'écran, vous aurez remarqué un comportement indésirable des SPA: le scroll reste le même d'une page à l'autre.

En effet le comportement d'un site normal voudrait que nous scrollions jusqu'au dessus à chaque changement de page.
De plus, l'ancre n'a aucune influence sur le comportement du scroll tant que vous ne rafraichissez pas la page.

Vous avez de la chance, deux options sont maintenant disponibles pour éviter ces problèmes et leur valeur par défaut va bientôt changer.

* `scrollPositionRestoration`: le comportent devient normal une fois mis à `'enabled'`.
* `anchorScrolling`: le scroll sur les ancres ne fonctionnera que si vous l'activez en lui attribuant la valeur `'enabled'`.

### Déployement sous dossier
Si votre url de base de votre site ressemble à `http://mondomaine.com/blog`, vous utilisez un sous-dossier (ici "blog").

Angular arrive à s'y retrouver grâce à la balise HTML [base](https://www.w3schools.com/TAGs/tag_base.asp). Ça valeur par défaut est `<base href="/">` ce qui définit qu'il n'y pas de sous dossier.

Vous pourriez directement changer cette valeur dans votre fichier `index.hml`, je préconise d'utiliser une configuration dynamique au moment du build dans votre `package.json`.

```sh
ng build --base-href=/blog
```

## Sécurité

Vous l'avez peut-être remarqué, nous n'avons pas traité tous paramètres de route précédemment cité dans l'article.
La raison et que ces trois paramètres restants méritent de créer une nouvelle section, car ils touchent la sécurité de votre application.

Le fait de supprimer le lien vers certaines routes n'est pas suffisant, car les utilisateurs pourraient se partager un lien ou sauver celui-ci en favoris. Il faut donc également bloquer l'accès à ces urls, et c'est là que les derniers paramètres interviennent. 

* `canActivate`: vérifie si l'utilisateur peut accéder à la route.
* `canDeactivate`: vérifie si l'utilisateur peut quitter à la route. *Cela ne bloque la navigation que dans le contexte de l'application, mais n'a aucun impact pour l'accès à un autre site (via le bouton back ou depuis un href par exemple)*.
* `canLoad`: vérifie si l'utilisateur peut charger un module qui a la stratégie du lazy-loading.

Chacun de ces paramètres attend un tableau de ce qu'on appelle des **guards**.

Le rôle d'un gard est de déterminer si, pour lui, l'utilisateur a le droit d'accéder à la ressource demandée.

Un guard est un injectable qui implémente une interface (une interface par type de responsabilité).

```ts
// canActivate
@Injectable(providedIn: 'root')
class CanActivateGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|boolean {
        return true;
    }
}
// canDeactivate
@Injectable(providedIn: 'root')
class CanDeactivateGuard implements CanDeactivate {
    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|boolean {
        return true;
    }
}
// canLoad
@Injectable(providedIn: 'root')
class CanLoadGuard implements CanLoad {
    canLoad(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|boolean {
        return true;
    }
}
```
Il est possible de retourner un `boolean` ou un `Observable` de boolean. Cela dépend si vous savez calculer directement la valeur ou si elle nécessite un appel asynchrone.

Il ne nous reste plus qu'à les utiliser dans nos routes.
```ts
{
    path: 'users/:id',
    component: UserListComponent,
    canActivate: [CanActivateGuard],
    canDeactivate: [CanDeactivateGuard]
},
{
    path: 'admin',
    loadChildren: import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [CanLoadGuard]
},
```

---

<div class="gratitude">
    <span>MERCI</span>
    <p>d'avoir pris le temps de lire cet article</p>
</div>

---

<div id="toc"></div>
**Table des matières**
1. TOC
{:toc}
