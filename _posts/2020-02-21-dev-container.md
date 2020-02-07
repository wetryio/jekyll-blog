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

Il est indispensable que le développeur ai accès dès son premier jour de travail accès à l'environnement de developpement. Mais je ne supporte pas que la tâche soir compliqué ni automatisé. Ou pire, quand la documentation est insuffisante pour atteindre cet objectif rapidement.

Microsoft propose depuis peu une solution: construire dans une ou plusieurs image docker l'environnement de DEV au lancement du projet. On installe [docker](https://www.docker.com/), [vscode](https://code.visualstudio.com/), [une extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack), on setup l'environnement requis par project, l'environnement de développement se construit de lui même.

Je vous présente aujourd'hui un exemple avec une application custom (un Todo app, pour ne pas changer), avec entity framework et mariadb.

# Quelques prérequis

Quelques outils sont nécessaires pour cette démonstration. Veuillez installer

- [docker](https://www.docker.com/)
- [vscode](https://code.visualstudio.com/)
  - Avec l'extension [Remote - Container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)

# La démo la plus simple au monde

Si vous avez lu l'introduction, ça n'est pas une surprise pour vous: en un instant, votre environnement de DEV sera prêt.

- git clonez [notre démo](https://github.com/wetryio/dev-container)
- ouvrez le dossier avec vscode
- acceptez l'invitation de lancer dans un container
- attendez ...

Le premier run prends quelques minutes. Il doit télécharger l'image dotnet core sdk, rebuilder une nouvelle image adapté à nos besoins. De même pour MariaDB, le téchargement est long, mais pas de nouvelle image a recréé.

Pour vous assurer que cette attente ne démotive pas à la longue, fermez votre vscode. Réouvrez le et observez que le temps de **chargement est de quelques secondes**.

## C'est bien mais ça marche comment ?

le dossier **.devcontainer** dirige tout. Les exemples microsoft sont surtout basé sur un dockerfile unique. Pour cette exemple, nous explorons une solution docker-compose.

### Dockerfile

C'est ce fichier qui construira le container dans le lequel vous développez. Il contient l'image par défaut proposé ar Microsoft, à l'exception que j'y installe un client mysql, nécessaire si je désire executer des commandes sur la base de donnée.

### docker-compose

Un docker-compose classique. J'y déclare mon environnement dans le service _dev-container_.

Une note sur la commande _sleep infinity_. Sans elle, le container se stoppe avant que vscode n'ai le temps de s'y connecter. Cette commande est nécessaire pour maintenir le container éveillé, et y travailler normalement.

J'utilise le fichier .dev/initmaria pour créer un utilisateur applicatif dans mariadb.

### devcontainer.json

C'est le fichier auquel tout tourne. Sans être compliqué, une explication va de soi. Il contient un json déclarant tout le nécessaire pour builder, runner et se connecter.

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
    // Quel shell lancé quand nous ouvrons un terminal intégré
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

Nous utilisons ici une image linux. Implicitement, cette solution fonctionne sans embarras sur linux, windows ainsi que macos. **N'importe qui peut rejoindre de développement** en un instant.

# Quel est le public de cette solution ?

Ce mode de développement profite à un cas : celui où l'on veut que n'importe quel développeur puisse développer sans devoir installer les dépendances. C'est très pratique dans le monde **open source** où le nombre de participant est énorme. Les moins téméraire peuvent accéder au développement quasi instantanément sans devoir passer des heures à chercher les dépendances à installer

Il profite aussi aux **entreprises** qui ont choisis une **architecture micro-service**. Même is chaque service à son micro environnement qui peut entrer en conflit avec d'autres services (pas la même version d'un package, etc ...), il n'y a aucun risque de conflit, et de perdre des heures à installer les outils nécessaires. N'importe quelle modification de code peut-être fait immédiatement avec ses units tests qui s'éxecutent dans le même container.

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
