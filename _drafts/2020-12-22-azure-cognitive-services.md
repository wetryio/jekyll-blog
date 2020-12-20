 ---
author: pgrasseels
layout: post
title: "Azure Cognitive Services"
date: 2020-12-22 11:20:00
image: '/images/blazor/blazor-fluxor.png'
description: Azure Cognitive Services, rendre humaine vos applications.
category: 'azure'
tags:
- azure
- tutorial
introduction: Azure Cognitive Services, rendre humaine vos applications.
---

# Azure Cognitive Services
A l'heure actuelle, les applications évoluent, l'un des points clé des cette évolution, est de rendre l'expérience utilisateur meilleure, plus intuitive, plus proche d'une intéraction avec une autre personne. Et si votre application était capable de parler ? écouter ? vous reconnaitre ? intéragir en temps réel avec vous ? d'apprendre ? 
La réponse à toutes ces questions, est assez simple, si c'était le cas, votre application atteindre un niveau de communication presque humain. Mais, contrairement à ce qu'on pourrait penser, à l'heure actuelle ce n'est pas si complexe que cela à mettre en place, nous allons voir ça sur la platforme Azure avec les Azure Cognitive Services.


## Les services
Azure, propose une liste qui s'allonge dans laquelle de nouveaux services s'ajoutent progressivement, voici une liste non-exhaustive à la date d'aujourd'hui (20/12/2020) :

1. Langage
    1. Analyse de texte
    2. Language Understanding
    3. Lecteur immersif
    4. QnA Maker
    5. Traducteur
2. Parole
    1. Reconnaissance vocale
    2. Synthèse vocale
    3. Traduction vocale
    4. Reconnaissance de l’orateur
3. Vision
    1. Form Recognizer
    2. Video Indexer
    3. Visage
    4. Vision par ordinateur
    5. Vision personnalisée


Avec les services listé ci-dessus, que pourrait faire une application ?
Prenons un exemple concret afin de rendre la situation plus claire et comment l'intégrer différent services dans une application.

## L'exemple concret
Pour l'application exemple, on vas partir du principe que l'application développer permets la gestion des stocks dans une magasin, exemple simple, mais qui vas permettre de mettre en place des services cognitif afin d'améliorer, optimiser et simplifier la vie des utilisateurs.


1. Votre application sait parler & écouter
Aujourd'hui, grosse journée pour David, 3 camions full viennent d'arriver. David, doit absoluement faire le ... afin de valider que la livraison c'est bien passée. Pour cela David, dois transporter des caisses d'un point A vers un poin B. Habituellement, c'est Mathieu qui l'aide, il s'occupe d'encoder et valider pendant que David déplace. Malhreuseuement, aujourd'hui Mathieu est souffrant. Mais, ce n'est rien, car depuis quelques semaines l'application de gestion a de nouvelles fonctionnalitées, elle est capable de parler et d'écouter.

> *David* 20 Caisses de ...

> *Notre Application* Bien reçus, 20 caisses reçus sur 20 commandées.

Pour faire cela dans l'application, 3 services cognitif ont été utiliser : 

1. Reconnaissance vocale : Permets de retranscrire en texte du contenus audio, ici l'application à transcris : *20 Caisses de ...*
2. Language Understanding : Permets de comprendre le langage naturel, l'intention, ici l'application à pus extraire ceci : [20] [caisses] de [...] Une fois les valeurs extraites, l'application à simplement été voir en DB ce qui avait été commander par rapport à ce qui à été reçus.
    1. 20 => une quantitée
    2. caisses => un contenant
    3. ... => une type
3. Synthèse vocale : Permets de transcrire du texte en format audio, ici l'application selon que la commande était correcte ou non à simplement générer un texte coéhérent : *Bien reçus, 20 caisses reçus sur 20 commandées.*