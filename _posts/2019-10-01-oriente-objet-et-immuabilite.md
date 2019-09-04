---
layout: post
title: L'immuabilité pour un code sans bug
date: 2019-10-01 13:00:00
image: '/images/immuabilite-objet/lock.jpg'
description: On est jamais sur ce que qu'un objet aura comme valeur dans le temps...
category: 'bonne-pratique'
tags:
- bonne pratique
- test
- orienté objet
twitter_text: L'immuabilité pour un code sans bug
introduction: L'immuabilité pour un code sans bug
github_username: worming004
linkedin_username: mathieu-scolas-1a048484
twitter_username: worming4
---

## Mon premier titre putaclick

Voilà un titre prétentieux. Je me dois déjà de préciser le contenu qui va suivre.

Seule les bonnes pratiques sont à l'origine de code sans bug et sans surprise. Elles sont nombreuses et toutes agissent sur différentes ficelles. Parfois sur l'extensibilité du code, sur la lisibilité, les performances, ...

Aujourd'hui la bonne pratique que je vous partage facilite l'évolution des objets dans ses futures itérations.

## Un exemple

```ts
class Person {
    private _nom: string = null;
    private _prenom: string = null;
    private _initiales: string = null;

    get Nom(): string {
        return this._nom;
    }
    set Nom(value: string) {
        this._nom = value;
    }

    get Prenom(): string {
        return this._prenom;
    }
    set Prenom(value: string) {
        this._prenom = value;
    }

    get Initiales(): string {
        return this._initiales;
    }

    initIntitiales(): void {
        this._initiales = this._prenom[0] + this._nom[0];
    }
}
```

Les initiales d'une personne dépendent du nom et du prénom. Rien d'exceptionnel. Mais un premier bug fait son apparition.
Le développeur a oublié de mettre à jour les initiales lorsque le nom et le prénom sont mis à jour.

### Le piège facile

Ce que j'observe fréquemment est cette solution:

```ts
    set Nom(value: string) {
        this._nom = value;
        this.initIntitiales();
    }

    set Prenom(value: string) {
        this._prenom = value;
        this.initIntitiales();
    }
```

La tentation est forte. Ainsi, le champ privé est tout le temps mis à jour. Mais lors d'une update future, un oubli peut vite arriver:

```ts
    private _deuxiemePrenom: string = null;

    get DeuxiemePrenom(): string {
        return this.deuxiemePrenom;
    }
    set DeuxiemePrenom(value: string) {
        this.deuxiemePrenom = value;
    }

    initIntitiales(): void {
        this._initiales = this._prenom[0] + this.deuxiemePrenom[0] + this._nom[0];
    }
```

Les initiales sont maintenant composées aussi d'un deuxième prénom. Aucun problème pour cette représentation.
Mais un bug est introduit dans sa gestion d'état. L'ajout d'une nouvelle propriété ne met pas correctement à jour les données internes.

Ça n'a l'air de rien dans ce petit exemple, mais dans un codebase beaucoup plus large, **l'oubli est fréquent**.

Il fallait donc appeler initIntitiales dans le setter du DeuxiemePrenom. Ou bien **réécrire**.
L'immuabilité peut aider de deux manières.

#### Réel problème

En réalité le souci est que l'update du deuxième prénom transforme l'objet personne dans un état intermédiaire. Cet état ne signifie plus ce qu'on espérait de lui. C'est dans le but d'éviter les états intermédiaires que je vous propose les deux solutions ci-dessous.

Note: _Oubliez le deuxième prénom. Il était présent uniquement pour l'exemple ci-dessus. Dans le reste de l'article, nous n'utiliserons que le nom et le prénom._

# L'immuabilité par construction

Combien de fois dans votre vie vous changez de nom ? Et quelle est la probabilité que vous changiez de nom au runtime ?
Vous obtenez votre nom et prénom à la naissance, et celle-ci ne change plus. Voici comment l'exprimer en orienté objet.

```ts
class Person {
    private _nom: string = null;
    private _prenom: string = null;
    private _initiales: string = null;

    constructor(Nom: string, Prenom: string) {
        this._nom = Nom;
        this._prenom = Prenom;
        this._initiales = Prenom[0] + Nom[0];
    }

    get Nom(): string {
        return this._nom;
    }

    get Prenom(): string {
        return this._prenom;
    }

    get Initiales(): string {
        return this._initiales;
    }
}
```

L'objet construit est maintenant figé. Il n'est plus possible de modifier son état.
Mais comment mettre à jour son prénom me direz-vous ? Ne le faites pas. Il n'y a aucun sens à modifier le prénom.

## Une personne PEUT changer de prénom

Oui, dans des cas particuliers le nom d'une personne peut changer. Mais est-ce vraiment le **contexte** auquel vous travaillez ? Peut-être qu'une interface pour administrateur totalement indépendante de votre application aura la capacité de changer le prénom. Dans un domaine complexe, inutile de s'embarrasser avec des objets variables.

## Private et Readonly

Notez que les champs _nom et _prenom sont encore variables. On peut, intérieurement modifier ces deux-ci.
Le mot-clé readonly y remédie facilement.

```ts
    readonly _nom: string = null;
    readonly _prenom: string = null;
```

De cette manière, la classe est certifiée **figée**. Elle ne peut plus être modifiée, et ne portera aucune mauvaise surprise une fois sa construction terminée.

# Immuabilité par expression

Une autre manière est d'exprimer en interne les initiales via une expression, et plus un champ. Comme ceci:

```ts
get Initiales(): string {
    return this._prenom[0] + this._nom[0];
}
```

Les initiales dépendent **directement** du nom et du prénom de la classe. Il est donc inutile de calculer dans une méthode intermédiaire l'état des initiales.

## Et la performance dans tout ça ?

Je dois dire, appeler plusieurs fois le getter Initiales introduit une légère baisse de performance. Il y a ici un compromis entre une facilité de lecture, et une opération de concaténation susceptible d'être appelé plusieurs fois au lieu d'une.

Il y a ici un compromis entre **stabilité du code** et performance (en termes de lecture et d'écriture).

# Laquelle choisir ?

Les deux ! Observez la simplicité du résultat:

```ts
class Person {
    constructor(readonly nom: string, readonly prenom: string) {

    }

    get Nom(): string {
        return this.nom;
    }

    get Prenom(): string {
        return this.prenom;
    }

    get Initiales(): string {
        return this.prenom[0] + this.nom[0];
    }
}
```

# Introduction nombreuse d'avantage supplémentaire

Je vous ai cité que cette représentation d'une classe personne est source de réduction de bug. D'autres avantages sont introduits implicitement.

* La définition du getter _Initiales_ est proche de son expression. Il n'est pas nécessaire de chercher dans le codebase ailleurs.
* Le nombre de variables sont réduits. À la lecture, il faut retenir moins d'informations.
* Le design est proche du monde réel. Un prénom et un nom ne changent pas !
* Se lit en un coup d'oeil. La règle des 5 secondes est assurée.
* Surface minimum du code. Réduire les interfaces à une utilité hyper simpliste facilite la modification de la classe dans le futur.
* 0 surprise. Tout est initialisé à un seul endroit et n'a pas de responsabilité cachée. Modifier un nom ne fait rien d'autre que ce qui est promis.
* Objet typé comme règle business. Un objet typé contient lui-même ses règles de cohérences. Avec la configuration strictNullChecks, vous êtes sûr qu'il ne peut exister une personne avec un nom null. Vous évitez ainsi un état interdit dans votre application.

# Les bonnes pratiques sont pour les développeurs.

Cet article vous expose une façon de designer des objets afin d'éviter les bugs dans un avenir proche et lointain. Souvenez-vous que ce ne sont pas les machines qui causent les bugs, mais les humains. Chaque simplification du code sert à vous-même et à votre prochain.

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
