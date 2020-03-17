---
author: pgrasseels
layout: post
title: "Azure Functions cas d'utilisation réel"
date: 2019-10-02 22:20:00
image: '/assets/img/azure-functions/Azure-Functions.png'
description: Azure Functions cas d'utilisation réel.
category: 'blog'
tags:
- azure
- tutorial
- serverless
- trigger http
introduction: Azure Functions cas d'utilisation réel.
---

# Azure Functions cas d'utilisation réel
Dans le cadre du DevDay, Wetry organise un concours pour faire gagner deux places. Pour mettre ça en place, nous avons décider
d'utiliser des Azure Functions pour récupérer la liste des questions / réponses. Ainsi que d'une seconde, pour récupérer les résultats qui seront envoyer.
Le tout sera sauver en CosmosDB pour simplifier.

Le code est disponible ici, [Github](https://github.com/wetryio/devday-contest). Seule chose que vous n'aurez pas se sont les connections strings ;)

## Les questions / réponses
La première Function vas permettre de renvoyer la liste de question et qui leur sont liés réponses. 
Les questions / réponses sont égalements des documents en CosmosDB qui ressemble à ceci :

``` json
{
    "content":"Quelle est la dernière version release de .Net Core ?",
    "anwsers":[
        "2.0",
        "2.1",
        "2.2",
        "2.5",
        "3.0",
        "3.1"
    ]
}
```