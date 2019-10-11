---
date: 2019-10-05 12:11:43
layout: post
title: "Fonctionnement de redux"
subtitle:
description:
image: /images/angular-posts/redux-post.jpg
category: 'documentation'
tags:
- javascript
- store
author: dgilson
---

Redux est un, des plus populaires, gestionnaire d'état centralisé pour applications JavaScript.
Un mécanisme comme celui de redux peut semble complexe mais nous allons voir que c'est en fait tout le contraire. 

## C'est quoi ?

### L'état

L'état d'une application représente toutes les données qui varient selon l’utilisation de l’application.
* La réponse d’un service web,
* Le token d’authentification,
* Des données entrées par un utilisateur (filtre/recherche)
* Gestion de l’interface (langue/messages),
* Gestion de l’historique des routes,
* Etc.

### Le store

Le store est un gestionnaire d’état.
* Il initialise/modélise un état de base;
* Il connait et peut donner son état à un instant T;
* Il peut modifier son état à la demande (lui et lui seul);
* Il monitor et observe les changements d’état.

## Pourquoi utiliser un store ?

L'utilisation d'un store permet de s'assurer que les données soient les même partout dans l'application et ainsi mettre en place une unique source de vérité. En plus d'éviter un lot d'erreurs, il facilite le testing et améliore les performances. 

En effet, redux se base sur l'immuabilité pour éviter de devoir faire une vérification en profondeur (`equal`). C'est donc une égalité simple (`===`) qui sera utilisée.

### Impacts pour Angular
L'architecture imposée par la mise en place d'un store nous facilite la mise en place d'un des mécanismes principaux pour l'amélioration des performance: `ChangeDetection.OnPush`.

## Fonctionnement

![placeholder](/images/angular-posts/redux.png "Redux schema")

### L'état
Contrairement à Flux, Redux à un arbre d'état unique 


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
