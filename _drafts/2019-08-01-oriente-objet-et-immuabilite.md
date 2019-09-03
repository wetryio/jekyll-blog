---
layout: post
title: L'immuabilité pour un code sans bug
date: 2019-08-01 13:00:00
image: '/images/immuabilite-objet/lock.jpg'
description: On est jamais sur ce que qu'un objet aura comme valeur dans le temps...
category: 'documentation'
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

Aujourd'hui la bonne pratique que je vous partage est pour le bienfait de l'évolution des objets pour ses futurs utilisations.

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

    get PreNom(): string {
        return this._prenom;
    }
    set PreNom(value: string) {
        this._prenom = value;
    }

    get Initiales(): string {
        return this._initiales;
    }

    initName(): void {
        this._initiales = this._prenom[0] + this._nom[0];
    }
}
```

Les initialies d'une personne dépendent du nom et du prénom. Rien d'exceptionnel. Mais un a un premier bug.
Le développeur a oublié de mettre à jour les initiales lorsque le nom et le prénom sont mis à jour.

## Le piège facile



L'immuabilité peut aider de deux manières.

## L'immuabilité par construction

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

    get PreNom(): string {
        return this._prenom;
    }

    get Initiales(): string {
        return this._initiales;
    }
}
```

L'objet construit est maintenant figé. Il n'est plus possible de modifier son état.
Mais comment mettre à jour son prénom me direz-vous ? Ne le faites pas. Il n'y aucun sens a modifier le prénom.

### Une personne PEUT changer de prénom

Oui, dans des cas particuliers le nom d'une personne peut changer. Mais est-ce vraiment le contexte auquel vous travaillez ? Peut-être qu'une interface administrateur totalement indépendant de votre application aura la capacité de changer le prénom. Dans un domaine complexe, inutile de s'embarasser avec des objets variables.

## Immuabilité par fonctions

## Private et Readonly

## Unit test friendly

## Design du monde réel

