---
date: 2020-02-13 12:38:42
layout: post
title: "DotNet 5 sur Raspbian"
subtitle: Le futur du .Net sur Raspberry PI
description: Le futur du .Net sur Raspberry PI.
image: '/assets/img/angular-posts/clean-code.png'
category: 'dotnet'
tags:
    - dotnet5
    - raspberry pi
    - raspbian
author: pgrasseels
---

[*DotNet 5 vient de sortir en preview, vive DotNet !!!*](https://devblogs.microsoft.com/aspnet/asp-net-core-updates-in-net-5-preview-1)

## DotNet 5 c'est quoi ?

## Installer DotNet 5 sur Raspbian
Comme on peut le voir sur le site de Microsoft, la version ARM de DotNet 5 est déjà disponible, c'est parfait c'est la version nécessaire pour faire tourner sur Raspberry Pi 4 !

Les base sont : 
- Une carte SD avec Raspbian installer
- Un raspberry pi 4

Une fois le raspberry pi lancer, il suffit de soit se connecter en SSH soit y accèder directement par clavier/souris.

Première étape, récupérer l'archive qui contient le SDK.

Les téléchargements sont disponible à la page suivante [DotNet](https://dotnet.microsoft.com/download/dotnet-core/5.0).

![download_link](/assets/img/dotnet5-raspbian/download.PNG)

Plus aucun commentaire n'est nécessaire, mais surtout il n'est plus possible de se tromper d'ordre car le compilateur est au courant des contraintes existantes entre les différentes fonctions.
Enfin, un nouvel élément apporté par les fonctions pures est le fait que nous limitons fortement le nombre d'endroits où nous modifions la valeur des variables ce qui facilite la lecture, mais aussi tout refactor.

---

<div class="gratitude">
    <span>MERCI</span>
    <p>d'avoir pris le temps de lire cet article</p>
</div>
