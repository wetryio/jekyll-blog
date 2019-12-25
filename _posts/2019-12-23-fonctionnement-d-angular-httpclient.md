---
date: 2019-12-23 22:33:43
layout: post
title: "Fonctionnement d'Angular: HttpClient"
subtitle: Qu'y a-t-il derrière le module HttpClientModule ?
description: Démystification du client http Angular
image: /images/angular-posts/http-client/principal.png
optimized_image:
category: 'demystification'
tags:
    - angular
    - http
    - api
author: dgilson
---

Dans les autres Frameworks JavaScript, il n'y a plus vraiment de système par défaut pour créer un client HTTP. Il nous faut donc choisir entre créer un service avec l'API historique [XMLHttpRequest](https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest), l'API plus récente [Fetch](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API) ou encore une librairie externe (utilisant une de ces APIs) comme [Axios](https://github.com/axios/axios).

Angular 2+ vous proposant sa propre solution (cela ne vous empêche pas d'utiliser celles précédemment citées), je pense intéressant de se pencher sur la façon dont ils ont implémenté ce que vous avez probablement l'habitude d'utiliser: `HttpClientModule`.

## Architecture

Comme d'habitude, HttpClient a été fait de façon très modulaire afin de pouvoir remplacer n'importe quelle partie.

![http-client-architecture-de-base](/images/angular-posts/http-client/http-client-1.png)
Les éléments en bleu représentent les "idées" (interfaces) qui sont par défaut implémentées par les éléments en gris.

Démarrons par le bas du schéma.

### Requêtes/Réponses

Une requête est créée quand vous appelez une méthode du `HttpClient` comme `.get(...)` ou `.request(...)`.

La réponse, elle, n'est pas créée par `HttpClient` mais par `HttpBackend` qui s'occupe notamment de déterminer s'il s'agit d'un succès ou d'une erreur.

### HttpHandler

L'HttpHandler est la façon de traiter une requête (`HttpRequest`) et sa réponse (`HttpResponse`).

Le handler principal implémenté par défaut s'appel `HttpInterceptingHandler` et comme son nom l'indique, c'est lui qui détermine comment et dans quel ordre exécuter les **intercepteurs** avant l'appel réel (qui lui se fait via l'HttpBackend).

### HttpBackend

L'HttpBackend implémente lui aussi HttpHandler mais mérite une section à part.

Le backend par défaut s'appel `HttpXhrBackend` et c'est dans celuis-ci que se trouve toute la logique automatique comme:
* l'ajout du header `Content-Type`,
* la détection d'erreurs cors (retour du statut 0),
* la création du cas de succès ou d'erreur depuis le statut HTTP (200 <= succès < 300)
* le parsing du payload en Json
* ...

HttpXhrBackend utilise l'élément XhrFactory afin de créer un élément de type `XMLHttpRequest`.

### XhrFactory

L'XhrFactory ne fait pas grand-chose, mais vous comprendrez l'importance du découplage de cette logique quand nous parlerons du SSR (server-side rendering).

Son implémentation par défaut est le `BrowserXhr` et ne fait rien de plus que:
```ts
    new XMLHttpRequest()
```

## SSR (Angular Universal)

NodeJS n'étant pas pourvu de l'API pour créer un élément XMLHttpRequest, le module `ServerModule` nous fournit une autre implémentation de XhrFactory qui utilise la librairie [xhr2](https://github.com/pwnall/node-xhr2).
```ts
    new xhr2.XMLHttpRequest();
```

![http-client-architecture-ssr](/images/angular-posts/http-client/http-client-2.png)

## Testing

Un des avantages d'utiliser la solution d'Angular est bien entendu son écosystème pour les tests unitaires.

Vous utilisez probablement déjà le module `HttpClientTestingModule,` mais quel est l'impact sur l'architecture du `HttpClientModule` ?

Première chose bonne à savoir: il est inutile d'importer `HttpClientModule` en même temps, car `HttpClientTestingModule` le fait déjà.

Le testing module n'utilise pas `HttpXhrBackend` mais sa propre implémentation du backend: `HttpClientTestingBackend`.

Vous l'aurez deviné, sa logique est bien différente. Il stocke les différents appels dans un tableau afin de pouvoir vérifier s'ils ont bien tous été gérés dans le test, le cas contraire indique que nous ne nous attendons pas à ce qu'il y ait un appel à ce moment-là.

Ce module redéfinis également le type `Request` afin de pouvoir retourner une valeur nous-mêmes via une méthode `.flush(...)`.

![http-client-architecture-testing](/images/angular-posts/http-client/http-client-3.png)

## In-memory web api

Dans le panel d'outils proposé par Angular, il est également possible de mettre en place un mécanisme de mocks dynamiques via le module `HttpClientInMemoryWebApiModule`.

Vous devez configurer une DB "in memory" ce qui va vous mettre à disposition des end-points [CRUD](https://fr.wikipedia.org/wiki/CRUD).

Ce module contient également sa propre implémentation du backend: `HttpClientBackendService`.

Contrairement au module de "testing", celui-ci a également une dépendance vers XhrFactory afin de permettre la configuration d'un `PassThruBackend` dans le cas où une URL n'est pas connue du mécanisme InMemory.

![http-client-architecture-in-memory](/images/angular-posts/http-client/http-client-4.png)

## Schéma récapitulatif

Voici un schéma complet de se dont j'ai parlé dans cet article.

![http-client-architecture-complet](/images/angular-posts/http-client/http-client-5.png)

J'espère, avec cet article, avoir démistifié une partie du module HttpClient.

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
