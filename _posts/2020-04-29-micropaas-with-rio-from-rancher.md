---
date: 2020-04-29 18:37:17
layout: post
title: "MicroPaaS with Rio from Rancher"
subtitle:
description:
image:
optimized_image:
category: 'experimentation'
tags:
    - kubernetes
    - paas
author: dgilson
---

Cet article vise à vous expliquer comment expérimenter l'outil Rio qui comprenant beaucoup de fonctionnalités.
N'hésitez pas à vous rendre sur la [table des matières](#toc) si vous n'êtes intéressé que par certaines parties.

# Prélude

## Qu'est-ce que Rio ?

Rio se présente comme un moteur de déploiement d'applications pour Kubernetes ou encore comme du MicroPaaS.
Il gère pour vous:
1. Ce qui touche au routing et au loadbalancing
2. L'auto scaling
3. Du déploiement continu depuis Git
4. Déploiement Blue/Green

![how rio works](/assets/img/kubernetes/rio/how-it-works-rio.svg)

Il s'inscrit typiquement dans le mouvement DevOps et peut fournir une alternative Kubernetes simple aux systèmes tel que CloudFoundry ou les Web Apps Azure.

### Concepts

Avant de commencer, clarifions quelques concepts de Rio:
* **Service** : ensemble de conteneurs scalables identiques 
* **Router** : load-balancing et gestion des règles de trafic
* **External Service** : enregistrement d’Ips ou de nom de domaine dans service mesh
* **Stack** : représentation d'un Riofile

## Outils utilisés dans cet article
1. [Rio](https://rio.io/) de Rancher: Moteur de déploiement d'application pour Kuernetes (toujours en beta)
2. [Civo](https://www.civo.com/): Plateforme Cloud Anglaise qui propose un moyen de déployer des clusters [k3s](https://k3s.io/) en quelques secondes (toujours en beta)
3. [Cloudflare](https://www.cloudflare.com/): reverse proxy avec parfeu et gestion de certificats

## Pourquoi avons-nous besoin d'un cluster en ligne
Rio s'occupe de beaucoup de choses pour nous dont l'attribution d'un nom de domaine "on-rio" ainsi que son certificat wild-card (intéressants principalement pour les autres environnements que la production).

Pour que Rio puisse nous fournir cela, vous devez disposer d'une IP fixe publique.

# Mise en place du cluster Kubernetes
Pour créer notre cluster, rendez-vous sur l'interface de Civo. Nous avons le choix sur la taille du cluster ainsi que la puissance de chaque noeud.
Pour cet article je vais choisir un cluster deux noeuds Medium (un master pouvant servir de worker ainsi qu'un autre worker). Le noeud master seul est suffisant pour un environnement de développement ou de test.

![civo price](/assets/img/kubernetes/rio/price.png)

Ne vous tracassez pas trop dès le départ sur le **nombre** de noeuds que vous souhaitez, vous pourrez en ajouter ou en supprimer comme bon vous semble.

Civo propose également de vous préinstaller des applications. Par défaut "Taerfik" et "Metrics Server" sont installés, j'ai aussi pris l'habitude d'utiliser Rancher comme interface pour mes clusters, mais pour Rio nous n'avons besoin de rien de tout ça, tout le nécessaire sera installé en temps voulu. Assurez-vous donc d'avoir **décoché toutes les applications**.

![civo apps](/assets/img/kubernetes/rio/apps.png)

Il ne reste plus qu'à cliquer sur le bouton "Create" et à attendre quelques secondes que notre cluster soit prêt.

![civo creation](/assets/img/kubernetes/rio/creation.png)

Une fois l'attente terminée, vous allez pouvoir télécharger le kubeconfig afin d'y avoir accès depuis le CLI `kubectl`.

![download kubefilr](/assets/img/kubernetes/rio/download-kubefile.png)

Ayant nommé mon cluster "Rio on Civo", le fichier fourni s'appelle "civo-rio-on-civo-kubeconfig".
Vous pourrez utiliser ce fichier facilement en ajoutant le paramètre `--kubeconfig` à chaque CLI kubernetes.

Exemples:
* `kubectl --kubeconfig civo-rio-on-civo-kubeconfig get pods -A`
* `rio --kubeconfig civo-rio-on-civo-kubeconfig ps`

*Afin de pouvoir mieux nous concentrer sur les commandes, ne ne mettrait pas la configuration `--kubeconfig` dans les prochaines commandes de l'article mais garder en tête qu'il faut l'ajouter dans chaque commande derrière le mot `rio`.
Par exemple, `rio ps` dans l'article dois être exécuté `rio --kubeconfig civo-rio-on-civo-kubeconfig ps`.*

# Installation de RIO

## Rio CLI

Le CLI Rio est compatible avec tous les OS tournant sur amd64 ou arm.

Vous pouvez utiliser la commande `curl -sfL https://get.rio.io | sh -` (le script détect automatiquement la release à utiliser) ou l'installer manuellemnt en téléchargeant la realease compatible avec votre OS [ici](https://github.com/rancher/rio/releases). J'ai personnellement choisi le script étant sous macOS.

## Installation sur le cluster

L'installation sur le cluster est aussi simple que celle du CLI, une commande suffit (`install`):

`rio install --email your@email.com`

Le flag `--email` sera utilisé pour la demande de certificat à Let's Encrypt.

Par défaut tous les services sont installés. Vous pouvez en désactiver en utilisant le flag `--disable-features`.
Si vous utilisez votre propre domaine et certificat wild-card vous pouvez par exemple ajouter `--disable-features rdns,letsencrypt` à votre commande.

Vous pouvez également avoir plus de paramètre si vous le souhaitez en utilisant le flag `--yaml` qui crée un yaml sans l'appliquer. Vous devrez alors l'appliquer après avoir effectué les modifications souhaitées.

![rio deploy success](/assets/img/kubernetes/rio/deploy-success.png)

Vous pouvez vérifier que tout s'est bien passé avec cette commande (`pods`):

`rio -n rio-system pods`.

![Great Success](/assets/img/kubernetes/rio/borat-success.gif)

Vous êtes déjà prêt à déployer une application.

# Déploiement depuis Github

L'application que nous allons déployer ici est la démo minimaliste que Rancher nous fournis: [https://github.com/rancher/rio-demo](https://github.com/rancher/rio-demo).

## Composition du repo

Vous remarquerez qu'il n'y a que 2 fichiers:
* `main.go` un service web basic en Go
* `Dockerfile` la façon de créer un environnement pour faire tourner le service Go
    * Le Dockerfile comprend la façon de **builder** `RUN ["go", "build", "-o", "demo"]` le projet ainsi que de façon de l' **exécuter** `CMD ["./demo"]`.

Cette découpe montre une autre force des conteneurs qui est de pouvoir créer un environnement reproductible.

## Déployement

Le repo étant publique nous n'avons qu’à exécuter une commande (`run`) en faisant référence à celui-ci.

`rio run -n cd-demo -p 8080 https://github.com/rancher/rio-demo`

Ici nous avons décidé de publier notre service avec le nom "cd-demo" et nous mappons le port 8080 au port publique 80.
Il est également possible de mapper d'autres ports en utilisant par exemple `-p 81:8081`.

Il ne vous reste plus qu’à exécuter la commande `ps` pour récupérer les informations de l'application que vous venez de déployer.

`rio ps`

![rio ps result](/assets/img/kubernetes/rio/rio-ps.png)

Accédez à l'url indiquée quand le build et le déploiement sont terminés et vous devriez avoir un beau petit message fourni par un site sécurisé via https.

![rio service deploy result](/assets/img/kubernetes/rio/rio-service-deployed.png)


Avec cette commande unique vous avez non seulement générer et déployer votre application, mais vous avez activé un **déploiement continu,** car Rio va vérifier toutes les 15 secondes s'il doit mettre à jour l'application.

Vous pouvez ainsi exécuter plusieurs fois cette commande pour plusieurs namespaces avec des branches différentes afin de déployer vos différents environnements.

## Utiliser un Git privé (sécurisé)

Plusieurs types d'authentification sont possibles: Basic ou SSH.

### Authentification Basic

Cette méthode permet d'utiliser les autres commandes comme précédemment sans rien changer.

Pour enregistrer vos données d'authentification dans Rio, utilisez la commande (`secret`):

`rio secret create --git-basic-auth`

Vous devrez indiquer une URL informer sur quelle git appliquer ce secret.
Comme dit plus haut, les autres commandes ne changent pas.

### Authentification SSH

Pour engesitrer la clé SSH, vous devez également utiliser la commande `secret` mais avec le flag `--git-sshkey-auth`:

`rio secret create --git-sshkey-auth`

La commande pour lancer un service change un peu afin d'informer qu'il faut utiliser une connexion SSH:

`rio run --build-clone-secret gitcredential-ssh -p 8080 git@github.com/rancher/rio-demo`

### Autres secrets

D'autres types de secrets existe comme la connection à un docker registry privé.

Vous pouvez voir les différents types de secrets possible à l'aide de la commande d'aide `rio secret create --help`.

Pour plus d'information, n'hésitez pas à aller faire un tour dans la [documentation](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md).

## Pull Request

Un point fort de Rio est qu'il peut provisionner une instance pour chaque PR, ce qui permet de voir le résultat avant de merger sans devoir lancer l'application en local.

### Configuration Webhook

Pour ce faire il faut créer un access token sur [Github](https://github.com/settings/tokens)

![github access token](/assets/img/kubernetes/rio/github-token.png)

et créer un secret de webhook toujours avec le flag `--github-webhook`:

`rio secret add --git-sshkey-auth`

### Déployement pour PR

Utilisez la commande `run` avec un nouveau flag `--build-pr`

`rio run -p 8080 -n example-cd --build-webhook-secret=githubtoken --build-pr --template https://github.com/rancher/rio-demo`

*Envie d'en savoir plus sur `--template` ? C'est par [ici](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md#automatic-versioning).*

# Dashboard

Avant de voir d'autres façons de déployer votre application, c'est peut-être le moment de vous informer qu'il existe un dashboard web vous permettant de monitorer visuellement vos applications.

L'installation du Dashboard, mais pour rester dans la simplicité nous pouvons l'installer en une seule commande (`dashboard`):

`rio dashboard`

*Le Dashboard est installé, mais ne répond pas encore ? Attendez encore un peu, le Dashboard prend plus de temps à ce lancer. Vous pouvez vérifier le lancement du Dashboard à l'aide de la commande `rio -n rio-system pods` déjà utilisée précédement*

![rio dashboard](/assets/img/kubernetes/rio/dashboard.png)

Vous pourrez y retrouver tout ce que vous avez fait jusqu'a maintenant. Le dashboard permet aussi de déployer vos applications sans passer par le CLI.

# Déploiement d'une image Docker

Avec Rio, il est aussi facile de déployer depuis une image Docker qu'en local. Il s'agit de la même commande (`run`) que pour le déploiement via github et Rio détecte automatiquement qu'il ne s'agit pas d'un lien Git, mais d'un nom d'image.

Pour déployer par exemple l'image [hello-word de rancher](https://hub.docker.com/r/rancher/hello-world), nous allons utiliser cette commande:

`rio run -n hello-word -p 80 rancher/hello-world`

Vous pouvez évidement utiliser des variables d'environnement à l'aide des flags `--env` et `--env-file`.

Pour avoir le nom de domaine, vous pouvez utiliser `ps` comme fait précédemment ou regarder la liste des services du dashboard.

![rio dashboard service deployed](/assets/img/kubernetes/rio/service-deployed-dashboard.png)

# Déployer une application locale

Ce point est un de ceux que je voulais absolument expérimenter car s'il y a bien quelque chose qui m'embête pour des environnements de debugging, c'est le fait de devoir passer par un registry d'images pour pouvoir tester l'application déployée.

Heureusement Rio fait tout pour nous en utilisant un registry local.

J'en profite pour vous parler d'une autre point qui est le `RioFile`. Il s'agit d'un fichier yaml se rapprochant un peu d'un fichier dockercompose.

```yaml
services:
  dev:
    image: ./
    port: 8080/http
```

Ce fichier crée un service dont le nom est "dev" en se basant sur `image`. Image peut contenir le nom d'une image disponible dans un registry ou un chemin relatif. Le chemin relatif indique à Rio qu'il doit builder l'image lui-même.

Il s'agit du fichier Riofile le plus petit que l'on puisse faire. Il y a 1001 autres options que vous pouvez spécifier dans ce fichier, je vous invite donc à aller les découvrir [dans la doc officielle](https://github.com/rancher/rio/blob/master/docs/riofile.md).

L'emplacement de votre dossier (`./` dans le cas présent) doit bien entendu contenir le code source de l'application ainsi qu'un Dockerfile tout comme nous l'avons vu dans la partie [Composition du repo](#Composition-du-repo).

Pour déployer notre application, il ne reste plus qu'à exécuter la commande `up`.

`rio up`

Nous pouvons alors suivre toutes les étapes par lesquelles il procède:

![local deployment](/assets/img/kubernetes/rio/local-deploy.png)

Vous pouvez exécuter une des 3 étapes par lesquelles il passe vous-même:
1. `rio build`: build de l'image
2. `rio run -p 8080 localhost:5442/default/dev:latest` déployer l'image précédemment créée

# Scaling

Le scaling est le fait d'avoir plusieurs instances du même service qui tourne afin de pouvoir absorber plus facilement la charge de calcul demandée en la distribuant.

Il se peut se gérer de toutes les manières de créer un service: commande **run** (`--scale`), **Riofile** (`scale` ou `autoscale`) ou encore via le **dashboard**.

## Manuel

Comme dit plus haut, le scaling se gère à la création d'un service. Il sera automatiquement mis à `1` si vous n'indiquez rien.

Vous pouvez modifier le scaling après ça création à l'aide de la commande `scale`.

`rio scale hello-word=2`

Cela lancera une seconde instance du service "hello-word".

![scaling result](/assets/img/kubernetes/rio/after-scale.png)

Vous pouvez également le faire via le dashboard.

![scaling result](/assets/img/kubernetes/rio/scaling-dashboard.png)

Ce qui est intéressant avec le hello-word de rancher c'est que vous pouvez tester le load-balancing entre les deux instances en rafraichissant plusieurs fois sa page web. En effet le nom derrière "My hostname is" est unique par instance.

![scaling result](/assets/img/kubernetes/rio/hello-word.png)

## Automatique

Le mot "scaling automatique" peut vous sembler compliqué dans un premier abord, et pourtant avec Rio c'est aussi simple que le scaling manuel. La seule différence est que nous devons préciser un range (exemple: `1-10`).

Il existe deux types d'auto-scaling:
* froid (depuis 0): `0-10`
* chaud (depuis au moins 1): `1-10`

Attention qu'avec l'auto-scaling froid il y aura une latence de +/- 10 secondes le temps qu'un noeud se lance si aucun n'est lancé.

Pour le tester, vous pouvez utiliser l'outil de commande [hey](https://github.com/rakyll/hey) qui permet de créer un grand nombre de connections simultanées:

`hey -z 3m -c 100 https://hello-word-v0-default.4a7p4l.on-rio.io/`

Vous devriez voir le nombre d'instances (répliquas) monté petit à petit puis avec la commande `ps`:

`rio ps`

![auto scaling result](/assets/img/kubernetes/rio/auto-scale.png)

# Router

Rio utilise l'API Gateway [Gloo](https://docs.solo.io/gloo/latest/) qui permet d'ajouter des règles basées sur des headers, path, cookies et encore d'autres.

Commençons par un car concret: donner accès à nos deux applications (cd-demo et hello-word) depuis le même sous domaine avec deux path différents.

Nous allons utiliser la commande `route add`.

Pour créer une règle de routing sur base d'un path, nous allons utiliser la commande de cette façon: `rio route add $name/$path to $target`.
* `$name`: est à remplacer par le nom du router (est utilisé pour créer un sous-domaine)
* `$path`: est à remplacer par le path sur lequel vous voulez que votre service soit accessible
* `$target`: est à remplacer par le nom du service vers lequel pointer

Créons notre première redirection du service **hello-word** sur le sous domaine `test-default` (test = nom du router, default = nom du namespace) sur le path `/hello-word`.
Autrement dit `https://test-default.<rio-domain>/hello-word`.

`rio route add test/hello-word to hello-word`

Pour vous assurez que la route est bien créée vous pouvez utiliser la commande `routers`:

`rio routers`

![router list](/assets/img/kubernetes/rio/routers.png)

Nous pouvons faire de même avec "cd-demo" avec la même commande à une exception près: Nous devons spécifier le port, car cette application écoute sur le port 8080.

`rio route add test/cd-demo to cd-demo,port=8080`

Nous avons maintenant également une application qui répond sous le chemin `https://test-default.<rio-domain>/cd-demo`

***Encore une fois je privilégie le CLI au dashboard, mais tout est faisable via ce dernier.***

![router list](/assets/img/kubernetes/rio/dashboard-router.png)

Maintenant que vous avez compris comment le router fonctionnait, je n'ai pas besoin de passer tous les mécanismes en revue. Je vous propose d'aller voir dans la [documentation officielle](https://github.com/rancher/rio/blob/master/docs/router.md) pour informer sur les autres mécanismes.

# Son propre domaine

Pour utiliser son propre domaine, le plus simple est d'ajouter un record `CNAME` vers notre domaine `xxxxxx.on-rio.io` (récupérable depuis la commande `rio info`).

Afin de ne pas avoir de problème de certificats je vous propose d'utiliser le service gratuit CloudFlare.

Pour se faire, rendez-vous dans la partie DNS pour ajouter le **CNAME**.

![cloudflare dns](/assets/img/kubernetes/rio/cloudflare-dns.png)

Ici j'ai configuré mon domaine pour que "rio.wetry.eu" fasse proxy vers "test-default.4a7p4l.on-rio.io".

Afin de ne pas avoir de problème de certificats, assurez-vous d'avoir choisi "Fexible" comme mode d'encryption. Cela signifie qu'il y aura une encryption entre notre serveur et cloudflare et une encryption entre cloudflare et notre navigateur, mais pas directement entre notre serveur et le navigateur.

![cloudflare certificate](/assets/img/kubernetes/rio/cloudflare-certificate.png)

Il ne nous reste plus qu'à enregistrer ce nouveau domaine dans Rio à l'aide de la commande `domain register`.

`rio domain register rio.wetry.eu test`

![custom dns result](/assets/img/kubernetes/rio/custom-domain-result.png)

# Services externes

Cette fonctionnalité a pour but d'éviter de jouer avec des Ips ou des domaines dans nos applications/services, mais de les gérer à un endroit centralisé.

Elle est utile pour la communication entre namespaces kubernetes, mais également pour accéder à des ressources réellement externes au cluster.

## Autre namespace

Imaginons que nous ayons une application **app2** dans un autre namespace se nommant **namespace2**, il est possible d'y avoir accès par exemple avec le nom **ext2** via la commande `external create` de cette façon:

`rio external create ext2 namespace2:app2`

## Ip ou nom de domaine

Pour voir accès à un service externe via un nom (par exemple: *ext1*) nous utilisons également la commande `external create` en lui fournissant une/plusieurs IPs ou un nom de domaine:

`rio external create ext1 1.1.1.1 2.2.2.2`

# Monitoring

Vous vous souhaitez monitorez votre Rio, il est possible d'avoir accès au Linkerd ainsi que son grafana en utilisant la commande `linkerd` qui crée un proxy entre linkerd et votre réseau local (127.0.0.1).

`rio linkerd`

**Linkerd**

![linkerd](/assets/img/kubernetes/rio/linkerd.png)

**Grafana**

![grafana](/assets/img/kubernetes/rio/grafana.png)

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

