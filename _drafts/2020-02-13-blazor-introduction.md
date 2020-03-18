 ---
author: pgrasseels
layout: post
title: "Blazor Introduction"
date: 2020-02-13 11:20:00
image: '/images/blazor/blazor.png'
description: Blazor Introduction.
category: 'blazor'
tags:
- blazor
- tutorial
- spa
- .net core
introduction: Blazor Introduction.
---

# Blazor Introduction
Ces dernières années le monde du web à beaucoup évoluer, les sites que nous connaissions y à encore quelques années changent progressivement et deviennent petit à petit des Application Web. Il existait déjà pas mal de framework capable de réaliser ces applications, aussi nommés Single Page Application, tel que Angular, React, Vue.js, etc ...
Blazor, c'est un nouveau venu, un peu le challenger dans ce domaine. Blazor, vas tout simplement permettre de développer des SPA en .NET qui tourneront dans votre browser et ce avec peu voir pas du tout de javascript.

## Blazor WASM Vs Blazor Server Side
Blazor existe en deux déclinaisons, les deux sont très similaires et la migration de l'un à l'autre n'est pas du tout complexe.
Il faut savoir qu'actuellement, seul la version Server Side est officiellement release par Microsoft. (.NET Core 3.0 Septembre 2019).
La version WASM (Client) est toujours en expérimentale.


### Blazor Server Side
La version serveur utilise SignalR à fin de mettre à jour l'UI mais également d'éxécuter les actions qui seront demandées. Par exemple, quand un clique est générer sur un bouton, SignalR envois une commande qui est récupérer par le server side de Blazor et execute l'action lié au click. La version à plusieurs avantages et inconvenients.

![placeholder](/images/blazor/blazor-server.png "Blazor Server Side")

Avantages : 
- Léger (très peu de télécharger pour le client)
- Tout le framework / packages netstandard / netcore est disponible à l'utilisation

Inconvenients :
- Nécessite d'avoir une connection en permanance (SignalR)
- Nécessite un server ASP qui tourne
- Demande plus de resources niveau server (mais utilisable avec Azure SignalR Services)


### Blazor WASM (Client)
La version WASM (Client), est une infrastructure d’application SPA pour la création d’applications Web interactives côté client avec .NET. Blazor webassembly utilise des normes Web du W3C.

![placeholder](/images/blazor/blazor-webassembly.png "Blazor Client Side")

Avantages : 
- S'utilise avec tout types de servers (Apache / NGinx)
- Un fois charger, l'application utiliseras la connection uniquement pour des données
- Assez facilement portable en PWA

Inconvenients :
- Actuellement, toute l'application est charger quand on arrive dessus, ce qui fais un temps de chargement parfois long
- Demande des browsers récents, en effet le WebAssembly n'est pas compatible avec touts les browsers, mais les principaux le sont (88%) [Source caniuse.com](https://caniuse.com/#feat=wasm)
- Debug encore très fastidieux

### Blazor ca ressemble à quoi ?
Blazor, c'est la syntax de Razor et du HTML qui vont générer des pages. Pour ceux qui ont déjà fais de l'ASP avec Razor en moteur de rendus,
l'apprentissage sera très simple. Pour les autres, les syntax de Razor sont très proches du C# avec le @ qui caractérise ces instructions.

Petit exemple tout simple d'une page :

``` csharp

@page "/counter"

<h1>Counter</h1>

<p>Current count: @_currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int _currentCount = 0;

    private void IncrementCount()
    {
        _currentCount++;
    }
}
```

- @page qui nous permets de déterminer une route pour arriver sur notre page
- @_currentCount qui vas permettre d'afficher la valeur de la variable
- @onclick pour s'attacher à un évènement, ici quand on vas cliquer sur le bouton, on vas appeller une méthode C#
- @code entre accolade se trouve du pure code C#

En résumé, quand on arrive sur la page avec l'url **/counter**, la valeur de la variable **_currentCount** est de 0.
On a donc sur la page **Current count: 0**.
Ensuite, en cliquant sur le bouton, **Click me**, on vas appeller la function **IncrementCount** du code C#.
Celle-ci vas ajouter 1 dans la  variable **_currentCount**, qui a à présent une valeur de 1.
Ayant détecter un changement de valeur, une partie du DOM vas se rafraichir et remplacer le **0** par **1**.

La syntaxe est simple et surtout la même pour du Client Side et du Server Side. La migration de l'un à l'autre est tout à fais envisageable, sans trop de perte de temps.

### Petits conseils
Je vois souvent la question : 
*Comment je fais pour accèder au DOM depuis Blazor ?*

La réponse est assez simple, c'est pas le but ! Pour modifier le DOM, les instruction Razor et autres sont la pour ça.
En effet, si il est nécessaire d'afficher / cacher une div, il sera nécessaire d'utiliser le @if et non de modifier directement le DOM.
Même chose pour modifier le contenus, si votre texte doit changer, c'est une variable avec une valeur qui changera et mettra à jour l'affichage / DOM.

Blazor est récent, mais commence à avoir vraiment une très bonne / forte communautée, l'approche permets de s'ouvrir au développer .Net et faire des site bien plus intéréactif sans avoir à apprendre d'autres languages comme le JS.

Explorer des cas simple pour vous mettre dedans. Ensuite, ajouter des choses au fur et à mesure.

Et surtout, [la doc officiel](https://docs.microsoft.com/fr-fr/aspnet/core/blazor/?view=aspnetcore-3.1).

Pour une introduction globale et une mise en bouche, je n'irais pas plus loin, mais dans les semaines à venir, un autre article arrivera avec l'intégration de GooglePay & ApplePay dans une application Blazor.

<div id="toc"></div>
**Table des matières**
1. TOC
{:toc}