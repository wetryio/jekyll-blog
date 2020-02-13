---
date: 2020-01-18 12:38:42
layout: post
title: "Les fonctions pures au service de la lisibilité"
subtitle: Explications par des exemples
description: Utiliser des fonctions pures pour plus de lisibilité.
image: '/assets/img/angular-posts/clean-code.png'
category: 'bonne-pratique'
tags:
    - bonne pratique
    - rxjs
author: dgilson
---

Cet article sera donc composé marjoritèrement d'exemples afin de démontrer l'intérêt de cette bonne pratique et que vous puissiez en faire votre propre opinion.
*Ces exemples sont en TypeScript et RXJS.*

## Qu'est-ce qu'une fonction pure ?

Selon [Wikipédia](https://fr.wikipedia.org/wiki/Fonction_pure) :

> Une fonction pure est une fonction qui possède les propriétés suivantes:
> * Sa valeur de retour est la même pour les mêmes arguments
> * Son évaluation n'a pas d'effets de bord

Une fonction a un scope (définit entre les accolades) le principe reflété par les deux points mis en avent par cette définition et le fait que nous ne puissions **pas sortir de ce scope**, que ça soit pour récupérer des informations ou pour en sauver/modifier.
Cela signifie qu'il est interdit d'utiliser le mot clé `this` et que les seules données que l'on peut utiliser sont les **paramètres** de cette fonction.

```ts
const externalElement = 5;
function sum(param1, param2) {
    // Le scope de la fonction est ici
    return param1 + externalElement // Interdit
    externalElement = param1 + param2 // Interdit
    return param1 + param2; // Autorisé
}
sum(1, 2);
```

## Pourquoi utiliser des fonctions pures ?

### Sans fonctions

Commençons par voir ce que ça donne si vous mettez tout dans le constructeur d'une classe sans faire de découpe en fonction.
L'exemple est petit, mais est pourtant assez complexe pour les personnes qui ne sont pas familières avec RXJS.

```ts
class MyClass {
    public data$: Observable<DataModel[]>;
    public openedData$: Observable<DataModel[]>;
    public hasRejectedData$: Observable<boolean>;
    public refreshData$: Subject<void>;

    constructor(dataService: DataService) {
        // Récupération des données depuis le serveur
        const data$ = dataService.getData().pipe(
            map(response => {
                return response.map(item => {
                    return new DataModel({
                        info1 = item.theInfo1,
                        info2 = item.theInfo2,
                        opened = item.status === 'OPENED'
                        rejected = item.status === 'REJECTED'
                    });
                });
            }),
            catchError(error => of([]))
        );
        // Mise en place de la récupération et de la mise à jour des données depuis le serveur
        this.refreshData$ = new Subject<void>();
        this.data$ = merge(
            data$,
            refreshData$.mergeMap(data$)
        ).pipe(shareReplay());
        // Filtre des données
        this.openedData$ = this.data$.pipe(
            map(data => data.filter(item => item.opened))
        );
        // Vérifier s'il y a des données rejetées
        this.hasRejectedData$ = this.data$.pipe(
            map(data => data.some(item => item.rejected));
        );
    }
}
```

Ce code démontrer une partie de la puissance de RXJS, mais nous ne pouvons pas dire qu'il soit très lisible. Heureusement que j'ai mis des commentaires n'est-ce pas ?

### Avec fonctions

Découpons maintenant ce même code en fonctions afin de ne plus avoir que l'orchestration dans le constructeur.

```ts
class MyClass {
    public data$: Observable<DataModel[]>;
    public openedData$: Observable<DataModel[]>;
    public hasRejectedData$: Observable<boolean>;
    public refreshData$: Subject<void>;

    constructor(private dataService: DataService) {
        this.fetchDataFromServer();
        this.initDataRefresher();
        this.initFilteredDataObservable();
        this.initHasRejectedDataObservable();
    }

    private fetchDataFromServer(): void {
        this.data$ = this.dataService.getData().pipe(
            map(response => response.map(item => DataModel.fromDTO(item))),
            catchError(error => of([]))
        );
    }

    /**
     * This will mutate `MyClass.data$`
     * @requires MyClass.data$
     */
    private initDataRefresher(): void {
        this.refreshData$ = new Subject<void>();
        this.data$ = merge(
            this.data$,
            refreshData$.mergeMap(this.data$)
        ).pipe(shareReplay());
    }

    /**
     * @requires MyClass.data$
     */
    private initFilteredDataObservable(): void {
        this.openedData$ = this.data$.pipe(
            map(data => data.filter(item => item.opened))
        );
    }

    /**
     * @requires MyClass.data$
     */
    private initHasRejectedDataObservable(): void {
        this.hasRejectedData$ =this.data$.pipe(
            map(data => data.some(item => item.rejected));
        );
    }

}
```

La première chose que l'on peut remarquer est le fait qu'il n'y ait plus besoin de commentaire pour expliquer ce que le code fait; en effet il s'auto suffit.

Cependant, d'autres commentaires sont maintenant nécessaires afin d'éviter toute future erreur concernant l'ordre des appels.
De plus rien n'indique au compilateur qu'il y a un ordre à respecter, et un changement de celui-ci ne provoquerait aucune erreur durant la compilation.

### Avec fonctions pures

Voyons enfin à quoi le code ressemble en utilisant des fonctions pures.

```ts
class MyClass {
    public data$: Observable<DataModel[]>;
    public openedData$: Observable<DataModel[]>;
    public hasRejectedData$: Observable<boolean>;
    public refreshData$: Subject<void>;

    constructor(dataService: DataService) {
        const dataFetching$ = this.fetchDataFromServer(dataService);
        this.refreshData$ = new Subject<void>();
        this.data$ = this.getDataWithRefresher(dataFetching$, this.refreshData$);
        this.openedData$ = this.getOpenedData(this.data$);
        this.hasRejectedData$ = this.getHasRejectedData(this.data$);
    }

    private fetchDataFromServer(dataService: DataService): void {
        return dataService.getData().pipe(
            map(response => response.map(item => DataModel.fromDTO(item))),
            catchError(error => of([]))
        );
    }

    private getDataWithRefresher(dataFetcher$: Observable<DataModel[]>,
            refresher$: Subject<void>): Observable<DataModel[]>) {
        return merge(
            dataFetcher$,
            refresher$.mergeMap(dataFetcher$)
        ).pipe(shareReplay());
    }

    private getOpenedData(data$: Observable<DataModel[]>): Observable<DataModel[]>) {
        return data$.pipe(
            map(data => data.filter(item => item.opened))
        );
    }

    private getHasRejectedData(data$: Observable<DataModel[]>): Observable<boolean>) {
        return data$.pipe(
            map(data => data.some(item => item.rejected));
        );
    }

}
```

Plus aucun commentaire n'est nécessaire, mais surtout il n'est plus possible de se tromper d'ordre car le compilateur est au courant des contraintes existantes entre les différentes fonctions.
Enfin, un nouvel élément apporté par les fonctions pures est le fait que nous limitons fortement le nombre d'endroits où nous modifions la valeur des variables ce qui facilite la lecture, mais aussi tout refactor.

---

<div class="gratitude">
    <span>MERCI</span>
    <p>d'avoir pris le temps de lire cet article</p>
</div>
