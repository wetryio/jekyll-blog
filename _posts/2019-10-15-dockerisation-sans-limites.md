---
author: dgilson
layout: post
title: "Dockerisation sans limites"
date: 2019-10-15 15:41:08
image: /images/docker-posts/docker-vs-code.png
description: Docker, l'outil ultime des développeurs.
category: 'experimentation'
tags:
- docker
- IDE
- VS Code
---

## Docker l'outil ultime des développeurs

Docker s'est démocratisé chez les développeurs, car il nous facilite la vie quand il s'agit de créer un environnement local avec tous les outils nécessaires tel qu'une *base de données*, un *système de message*, un *serveur de mocks*...

Cela permet à toute l'équipe d'avoir un environnement similaire tout en ayant complètement la main dessus sans impacter les autres membres. Et surtout, fini le ***"ça fonctionne sur ma machine"*** !

Il n'y a finalement qu'un outil que nous ne dockerisons pas encore: l'**IDE**.

S'il y a bien une chose sur laquelle les développeurs ne sont pas toujours d'accord, c'est sur le choix d'un IDE. Et en utiliser plusieurs dans une même équipe peut vite avoir des effets indésirables ne serait-ce que par rapport au formatage du code.

Alors ne serait-il pas une bonne idée de forcer l'IDE et ses configurations ? Ou encore mieux: avoir un IDE préconfiguré en une seule commande.

Vous l'aurez compris, cet article vise à ouvrir une porte sur la dockerisation de l'IDE.

## Comment est-il possible de dockeriser un IDE ?

Un des éditeurs les plus populaires pour le développement web ou .net core est Visual Studio Code (VS Code). Cet éditeur est open-source et complètement écrit en HTML, JavaScript et CSS à l'aide d'[Electron](https://electronjs.org/) (outil qui permet de faire des applications desktop en web comme Cordova le fait pour les smartphones).

Et c'est parce qu'il est fait de technologies web qu'il devient possible de le dockeriser. Nous pourrions alors l'utiliser dans un navigateur.

La compagnie [Coder](https://coder.com/) a fait un excellent travail et le meilleur est que leur code est open-source. Nous allons donc pouvoir nous concentrer sur leurs outils.

## Sur la machine de développement

Pour démarrer un VS Code sur votre navigateur, rien de plus simple, nous pourrions nous contenter d'une commande Docker :

```sh
mkdir code-server
docker run -it -p 127.0.0.1:8080:8080 
    -v "$PWD/code-server:/home/coder/.local/share/code-server"
    -v "$PWD:/home/coder/project"
    codercom/code-server:v2
```
ou pour windows (powershell):
```sh
mkdir code-server
docker run -it -p 127.0.0.1:8080:8080 `
    -v ${pwd}/code-server:/home/coder/.local/share/code-server `
    -v ${pwd}:/home/coder/project `
    codercom/code-server:v2
```

*Comme vous l'aurez remarqué, la différence entre linux/MacOs et Windows se fait principalement au niveau du chemin `pwd`. Si vous êtes sur **Windows**, il faudra que vous remplaciez les `$PWD` par des `${pwd}` dans les prochaines commandes.*

Super, on a déjà plus que du concret!

![vs code online](/images/docker-posts/vs-code-online.png)

Mais nous allons vite faire face à un "problème": le terminal fonctionne, mais il n'y a aucun outil de build disponible comme *npm* ou *maven*.

Pas de panique ! Je vous rappelle qu'il s'agit de Docker. Nous allons donc simplement pouvoir créer notre propre image en se basant sur celle fournie (`codercom/code-server:v2`).

Voici un exemple de **Dockerfile** qui installe automatiquement une **extension** et installe **NodeJs**, afin d'avoir un environnement près pour le développement:

```Dockerfile
FROM codercom/code-server:v2
RUN sudo apt-get update && sudo apt-get -y upgrade

# VSCode extensions
RUN sudo apt-get install -y bsdtar curl
RUN mkdir -p /home/coder/.local/share/code-server/extensions
RUN curl -JL https://github.com/Microsoft/vscode-python/releases/download/2019.2.5558/ms-python-release.vsix | bsdtar -C /tmp -xvf - extension
RUN mv /tmp/extension /home/coder/.local/share/code-server/extensions/ms-python.python-vscode-2.0.3

# Other dev tools
RUN curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

CMD ["code-server", "--allow-http", "--no-auth"]
```

J'ai décidé de nommer le Dockerfile "`code-server-test`" de façon totalement arbitraire.

Il faudra alors construire (builder) notre image:
```sh
docker build . -t code-server-test
```

Enfin, il est possible de l'utiliser à l'aide de cette commande:
```sh
docker run -it -p 127.0.0.1:8080:8080 -v "$PWD:/home/coder/project" code-server-test:latest
```

Nous pouvons à nouveau remarquer à quel point ces manipulations sont simples grâce à Docker.

## Sur un serveur

Jusqu'à maintenant, il est toujours nécessaire d'avoir une machine assez puissante et avec la bonne architecture pour faire tourner les outils de développement, et surtout pour Docker.

Si le container Docker pouvait tourner sur un serveur, il n'y aurait plus besoin d'autre chose qu'un navigateur moderne. Cela veut dire que l'on pourrait également développer sur une tablette ou un smartphone.

Enfin, le must pour un serveur serait qu'un environnement de développement soit créé dès la récupération du code source (exemple: Github).

### Via commande

Nous allons maintenant parler d'un autre outil de Coder: [Sail](https://sail.dev).
<sub>*J'ai placé cet outil uniquement dans la partie "serveur", car certaines fonctionnalités réseau de Docker sont nécessaires, mais non compatibles avec MacOS pour le moment. Il n'en est pas moins intéressant de l'utiliser sur un serveur linux.*</sub>

Il s'agit d'un CLI qui nous permet exactement ce que l'on veut via une commande:
```sh
sail run --ssh github.com/cdr/sshcode
```

Pour cet outil, ce sont des images différentes qui seront utilisées. Je parle au pluriel, car il sera en mesure de détecter les outils nécessaires s'il connait le type de projet (exemples: nodejs, ruby, python...) afin de choisir l'image adéquate. Vous pouvez trouver la liste des outils pris en charge [ici](https://hub.docker.com/search?q=codercom%2Fubuntu-dev&type=image).

Si votre technologie n'est pas prise en charge ou que vous voulez customiser votre environnement (avec d'autres outils ou des extensions par exemple), cela reste tout à fait possible.

Pour cela il faudra créer un dossier `.sail`, dans votre repo GIT, dans lequel vous allez mettre votre fichier `Dockerfile` (`.sail/Dockerfile`) et y ajouter ce que vous souhaitez. Vous devrez, cette fois, partir de l'image `codercom/ubuntu-dev`. Exemple:

```Dockerfile
FROM codercom/ubuntu-dev:latest
RUN sudo apt-get update && sudo apt-get -y upgrade

# VSCode extensions
RUN installext vscodevim.vim

# Other dev tools
RUN curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
```

Pour plus d'informations n'hésitez pas à aller voir la [documentation](https://sail.dev/docs/introduction/).

### Via un portail web

Afin d'éviter de devoir se connecter en SSH à chaque récupération de projet, il serait plus confortable d'avoir une page web.

Un projet nommé [Sail Hub](https://github.com/gilsdav/sail-hub) à vu le jour dans cette optique.

Une fois installé et démarré, il vous suffis d'ajouter un repo:

![stail-add-repo](/images/docker-posts/sail-hub2.png)

Cela vous permettra d'ouvrir un VS Code en ligne en cliquant sur `open`:

![stail-list](/images/docker-posts/sail-hub1.png)

Et voilà, vous n'avez plus qu'une URL à retenir pour pouvoir développer depuis n'importe quel device.

**Attention** que pour ce portail, **aucune authentification** n'a été mise en place, il est donc nécessaire de mettre en place un **VPN** si vous souhaitez avoir accès à ce serveur depuis n'importe où.

## Conclusion

Cet article n'a pas pour but de vous assurer la stabilité de ces produits, mais de vous montrer la puissance de Docker dans un autre contexte que celui dont nous avons l'habitude.

Cependant je pense que dockeriser la stack complète de développement permet d'éviter les problèmes liés à la configuration, et ce peu importe l'OS.

N'hésitez pas à me communiquer votre avis via un commentaire.

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
