---
date: 2020-02-07 18:58:05
layout: post
title: ""
subtitle: "avoir un environnement de développement en 5 minutes"
description: "avoir un environnement de développement en 5 minutes"
image:
optimized_image:
category: experimentation
tags:
  - devcontainer
  - docker
  - vscode
  - open source
author: mscolas
---

Il est indispensable que le développeur, dès son premier jour de travail, ait accès à l'environnement de développement. Or, le temps qu'un développeur passe pour mettre en place cet environnement représente un coût significatif pour l'employeur.

Microsoft propose depuis peu une solution: construire, dans une ou plusieurs images docker, son environnement de travail. On installe [Docker](https://www.docker.com/), [VSCode](https://code.visualstudio.com/), [une extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack). On configure l'environnement dans quelques fichiers et celui-ci se construit de lui-même.

Je vous présente aujourd'hui un exemple à l'aide d'une application custom (une Todo app, un classique), avec Entity Framework et MariaDB.

# Quelques prérequis

Quelques outils sont nécessaires pour cette démonstration. Veuillez installer:

- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/)
  - Avec l'extension [Remote - Container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)

# La démo la plus simple au monde

Si vous avez lu l'introduction, ça ne sera plus une surprise pour vous: dans quelques minutes, votre environnement de DEV sera prêt.

- clonez [notre démo](https://github.com/wetryio/dev-container)
- ouvrez le dossier avec VSCode
- acceptez l'invitation de lancer dans un container
- attendez ...

Le premier run prend quelques minutes. Il doit télécharger l'image dotnet core sdk, reconstruire une nouvelle image adaptée à nos besoins. De même pour MariaDB, le téléchargement est long, mais pas de nouvelle image à recréer.

Pour vous assurer que cette attente ne démotive pas à la longue, fermez votre VSCode. Réouvrez-le et observez que le temps de **chargement est de quelques secondes**.

## C'est bien, mais comment ça marche ?

Le dossier **.devcontainer** dirige tout. Les exemples Microsoft sont surtout basés sur un dockerfile unique. Pour cet exemple, nous explorons une solution docker-compose.

### Le fichier Dockerfile

[Ce fichier](https://github.com/wetryio/dev-container/blob/master/.devcontainer/Dockerfile) construira le container dans le lequel vous développez. Il contient l'image par défaut proposé par Microsoft, mis à part que j'y installe en supplément un client mysql nécessaire si je désire exécuter des commandes sur la base de données.

### Le fichier docker-compose

C'est un fichier docker-compose classique. J'y déclare mon environnement dans le service _dev-container_.

Une note sur la commande _sleep infinity_. Sans elle, le container se stoppe avant que VSCode n'ait le temps de s'y connecter. Cette commande est nécessaire pour maintenir le container éveillé et y travailler normalement.

J'utilise le dossier [.dev/initmaria](https://github.com/wetryio/dev-container/tree/master/.dev/initmaria) pour créer un utilisateur applicatif dans MariaDB. Comme [la documentation l'explique](https://hub.docker.com/_/mariadb), tous les fichiers de ce dossier sont exécutés à la première utilisation de la base de données.

### Le fichier devcontainer.json

C'est le fichier autour duquel tout tourne. Sans être compliqué, une explication va de soi. Il contient un json déclarant tout le nécessaire pour builder, runner et se connecter.

```json
{
  // Nom du container
  "name": "DevContainer",
  // Nom du docker file qui lance les services requis
  "dockerComposeFile": "docker-compose.yml",
  // Nom du service container auquel se connecter. Mandatory si on utilise un docker-compose
  "service": "dev-container",
  // Dans quel dossier vscode doit s'ouvrir dans le container
  "workspaceFolder": "/workspace",
  // Les ports à exposés. Ici le debug de vscode est accessible depuis le host
  "appPort": [5000, 5001],

  "settings": {
    // Quel shell est lancé quand nous ouvrons un terminal intégré
    "terminal.integrated.shell.linux": "/bin/bash"
  },
  // une commande a lancé après que les containers soient actifs ? C'est ici. Je l'utilise pour migrer mes schémas
  "postCreateCommand": "dotnet restore && dotnet build && dotnet ef database update --project ./DevContainer.Infrastructure --startup-project ./DevContainer",

  // Les extensions utiles pour le développement
  "extensions": [
    "ms-vscode.csharp",
    "humao.rest-client",
    "jongrant.csharpsortusings"
  ]
}
```

## Cross platform

Nous utilisons ici une image Linux. Implicitement, cette solution fonctionne sans embarras sur Linux, Windows ainsi que macOS. **N'importe qui peut rejoindre le développement** en un instant.

# Quel est le public cible de cette solution ?

Ce mode de développement profite à un cas : celui où l'on veut que n'importe quel codeur puisse développer sans devoir installer les dépendances. C'est pratique dans le monde **open source** où le nombre de participants est énorme. Les moins téméraires peuvent accéder au développement quasi instantanément sans devoir passer des heures à chercher les dépendances à installer.

Il profite aussi aux **entreprises** qui ont choisi une **architecture micro-service**. Même si chaque service à son micro-environnement qui peut entrer en conflit avec d'autres services (pas la même version d'un package, etc.), il n'y a aucun risque de conflit et de perdre des heures à installer les outils nécessaires. N'importe quelle modification de code peut être fait immédiatement avec ses units tests qui s'exécutent dans le même container.

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
