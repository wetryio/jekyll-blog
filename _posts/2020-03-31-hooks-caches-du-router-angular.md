---
date: 2020-03-31 21:10:21
layout: post
title: "Hooks cachés du router Angular"
subtitle:
description: Comment j'ai pu "augmenter" le router pour gérer un système d'onglet applicatif via des routes.
image: /assets/img/angular-posts/angular-iceberg.png
optimized_image:
category: 'documentation'
tags:
- angular
- form
author: dgilson
---

Nous allons parler ici d'éléments tellement bien cachés, qu'il n'y a pas moyen de savoir que ça existe sans aller voir dans le code source d'Angular, et c'est bien dommage de la part des développeurs du Framework.

### Comment et pourquoi avoir découvert ça ?

Il est intéressant de savoir que la doc Angular que j'utilise n'est rien d'autre que le code source. Ça me permet de découvrir des fonctionnalités (même accessible sans hack) parfois absentes de la doc.
C'est en cherchant comment "annuler" une navigation de manière globale (sans devoir appliquer un guard sur chaque route) que j'ai découvert ce qu'ils ont appelé des "hooks".

Il n'y en a que deux:
* **beforePreactivation**: lancé avant même d'avoir vérifié les guards
* **afterPreactivation**: lancé après les guards et les resolvers (construction complète des données à pouvoir injecter dans le composant "router-outlet")

Personnellement ça m'intéressait de pouvoir tout de même compter sur le mécanisme de guards pour gérer les permissions, j'ai donc choisi d'implémenter let hook "afterPreactivation".

### Mais qu'est ce que j'entends par "caché" ?

Il vous est surement déjà arrivé de voir un attribut / une méthode Angular sans pouvoir vraiment y accéder à cause de son accès privé.
Dans ce cas si, ils ne l'ont pas mise en privée, mais en `internal`, ce qui a comme résultat de ne pas générer l'élément dans la définition (.d.ts). Impossible, donc, pour ces utilisateurs de savoir qu'elle existe.

```ts
/**
  * Hooks that enable you to pause navigation,
  * either before or after the preactivation phase.
  * Used by `RouterModule`.
  *
  * @internal
  */
hooks: {beforePreactivation: RouterHook, afterPreactivation: RouterHook} = {
    beforePreactivation: defaultRouterHook,
    afterPreactivation: defaultRouterHook
};
```

### Bien, mais comment les utiliser alors ?

Il ne faut pas oublier que nous travaillons en JavaScript.

Nous avons dès lors deux moyens d'accéder à cette propriété `hooks` et donc de bypasser la vérification TypeScript.

1. Utiliser un `as any`: ça fonctionne, mais ça pollue notre code.
2. Utiliser le commentaire `@ts-ignore`: ignore les problèmes TypeScript uniquement pour la ligne qui suit.

Une chose à laquelle il faut également faire attention est le fait que, comme indiqué dans le commentaire de la propriété **hooks**, ces fonctions sont utilisées dans le `RouterModule`. Pour être plus précis, il n'y a que la méthode **afterPreactivation** qui soit utilisée hors tests unitaires pour le moment.
Cela veut dire qu'il ne faut pas oublier d'appeler la fonction de base en plus de notre surcharge, un peu comme l'obligation d'appeler la méthode "super()" dans un constructeur en cas d'extension de classe.

### À quoi ressemblent ces hooks ?

Ce hook n'est rien d'autre qu'une lambda retournant une instance de `Observable<void>`.

```ts
export type RouterHook = (snapshot: RouterStateSnapshot, runExtras: {
    appliedUrlTree: UrlTree,
    rawUrlTree: UrlTree,
    skipLocationChange: boolean,
    replaceUrl: boolean,
    navigationId: number
}) => Observable<void>;
```

Nous ne devons donc rien "calculer", nous avons uniquement la main sur si ou quand le routeur pourra continuer plus loin (ici l'activation de la route dans le(s) `router-outlet`).

En effet j'aimerais que dans certains cas, il n'affiche pas lui-même le composant, mais qu'il me laisse le gérer.

### Implémentation

Pour créer ce hook nous allons travailler dans le module `app-routing.module.ts`.

Pour commencer, nous aurons besoin du router, nous l'injectons alors dans le constructeur.
```ts
constructor(router: Router) {}
```

Cela nous permet de préparer tout ce dont on a besoin:
1. Le dictionnaire `hooks`,
2. Le sujet `events` que vous avez plutôt l'habitude d'utiliser en tant qu'Observable.

```ts
// @ts-ignore
const routerHooks: { beforePreactivation: RouterHook, afterPreactivation: RouterHook } = router.hooks;
// @ts-ignore
const eventsSubject = (router.events as Subject<RouterEvent>);
const previousAfterPreactivation = routerHooks.afterPreactivation;
```

Nous pouvons maintenant écraser le hook de notre choix.

```ts
routerHooks.afterPreactivation = (...args) => {
    // Faites votre business personnalisé ici
    return previousAfterPreactivation(...args);
};
```

Enfin il nous reste à annuler la suite de l'activation de la route en stoppant le sujet. Cela est possible simplement grâce à l'opérateur `filter` de **RXJS**.

Cependant, si vous décidez d'annuler la suite, je vous conseille d'au minimum émettre un évènement de type `NavigationCancel` afin de garder une cohérence dans le reste de l'application.

```ts
routerHooks.afterPreactivation = (...args) => {
    const canNavigate = false;
    if (!canNavigate) {
        eventsSubject.next(
            new NavigationCancel(args[1].navigationId, router.serializeUrl(args[1].rawUrlTree), 'raison annulation')
        );
        // Le ActivatedRouteSnapshot est disponible via : args[0].root
    }
    return previousAfterPreactivation(...args).pipe(filter(() => canNavigate));
};
```

### Résultat final
Voici un exemple qui annule la navigation si un QueryParam informe le router que l'utilisateur veut ouvrir ce composant en "mode onglet applicatif" et non pas en navigation classique.

```ts
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor(router: Router) {
        // Réupération des éléments internes
        // @ts-ignore
        const routerHooks: { beforePreactivation: RouterHook, afterPreactivation: RouterHook } = router.hooks;
        // @ts-ignore
        const eventsSubject = (router.events as Subject<RouterEvent>);
        const previousAfterPreactivation = routerHooks.afterPreactivation;
        // Mise en place d'un afterPreactivation personalisé
        routerHooks.afterPreactivation = (...args) => {
            const canNavigate = !args[0].url.includes('asTab=');
            if (!canNavigate) {
                eventsSubject.next(
                    new NavigationCancel(args[1].navigationId, router.serializeUrl(args[1].rawUrlTree), 'tab')
                );
                console.log(args[0].root);
            }
            return previousAfterPreactivation(...args).pipe(filter(() => canNavigate));
        };
    }
}
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

