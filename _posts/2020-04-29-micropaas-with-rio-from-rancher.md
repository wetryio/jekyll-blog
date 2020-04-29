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

# Prélude

## Qu'est ce que Rio ?

Rio se présente comme un moteur de déploiement d'applications pour Kubernetes ou encore comme du MicroPaaS.
Il gère pour vous:
1. Ce qui touche au routing et au loadbalancing
2. L'auto scaling
3. Du déploiement continu depuis Git
4. Déploiement Blue/Green

**Image architecture**

Il s'inscrit typiquement dans le mouvement DevOps et peut fournir une alternative Kubernetes simple aux systèmes tel que CloudFoundry ou les Web Apps Azure.

## Outils utilisé dans cet article
1. [Rio](https://rio.io/) de Rancher: Moteur de déploiement d'application pour Kuernetes (toujours en beta)
2. [Civo](https://www.civo.com/): Plateforme Cloud Anglaise qui propose un moyen de déployer des clusters [k3s](https://k3s.io/) en quelques secondes (toujours en beta)
3. [Cloudflare](https://www.cloudflare.com/): reverse proxy avec parfeu et gestion de certificats

## Pourquoi avons nous besoin d'un cluster en ligne
Rio s'occupe de beaucoup de choses pour nous dont l'attribution d'un nom de domain "on-rio" ainsi que son certificat wild-card (intéressants principalement pour les autres environements que la production).

Pour que Rio puisse nous fournir cela, vous devez disposer d'une IP fixe publique.

# Mise en place du cluster Kubernetes
Pour créer notre cluster, rendez-vous sur l'interface de Civo. Nous avons le choix sur la taille du cluster ainsi que la puissance de chaque noeud.
Pour cet article je vais choisir un cluster deux noeud Medium (un master pouvant servir de worker ainsi qu'un autre worker). Le noeud master seul est suffisant pour un environement de developpement ou de test.

Ne vous tracassez pas trop dès le départ sur le **nombre** de noeuds que vous souhaitez, vous pourrez en ajouter ou en supprimer comme bon vous semble.

**Image Prix**

Civo propose également de vous préinstaller des applications. Par défaut "Taerfik" et "Metrics Server" sont installé, j'ai aussi pris l'habitude d'utilser Rancher comme interface pour mes clusters mais pour Rio nous n'avons besoin de rien de tout ça, tout le nécessaire sera installé en temps voulu. Assurez-vous donc d'avoir **décocher toutes les applications**.

**Image Apps**

Il ne reste plus qu'a cliqué sur le bouton "Create" et a attendre quelques secondes que notre cluster soit pret.

Une fois l'attente terminée, vous allez pouvoir télécharger le kubeconfig afin d'y avoir accès depuis le CLI `kubectl`.

Ayant nommé mon cluster "Rio on Civo", le fichier fourni s'appel "civo-rio-on-civo-kubeconfig".
Vous pourez utiliser ce fichier facilement en ajoutant le paramètre `--kubeconfig` à chaque CLI kubernetes.

Exemples:
* `kubectl --kubeconfig civo-rio-on-civo-kubeconfig get pods -A`
* `rio --kubeconfig civo-rio-on-civo-kubeconfig ps`

# Installation de RIO

## Rio CLI

Le CLI Rio est compatible avec tous les OS tournant sur amd64 ou arm.

Vous pouvez utiliser la commande `curl -sfL https://get.rio.io | sh -` (le script détect automatiquement la release à utiliser) ou l'installer manuellemnt en téléchargeant la realease compatible avec votre OS [ici](https://github.com/rancher/rio/releases). J'ai personellement choisi le script etant sour MacOS.

## Installation sur le cluster

L'installation sur le cluster est aussi simple que celle du CLI, une commande suffit (`install`):

`rio --kubeconfig civo-rio-on-civo-kubeconfig install --email your@email.com`

Le flag `--email` sera utilisé pour la demande de certificat à Let's Encrypt.

Par défaut tout les services sont installé. Vous pouvez en désactiver en utilisant le flag `--disable-features`.
Si vous utilisez votre propre domain et certificat wild-card vous pouvez par exemple ajouter `--disable-features rdns,letsencrypt` à votre commande.

Vous pouvez également avoir plus de paramètre si vous le souhaitez en utilisant le flag `--yaml` qui crée un yaml sans l'appliquer. ça sera alors à vous de le faire après avoir effectuer les modifications souhaitées.

**Image success**

Vous pouvez vérifier que tout c'est bien passé avec cette commande (`pods`):

`rio --kubeconfig civo-rio-on-civo-kubeconfig -n rio-system pods`.

![Great Success](https://thumbs.gfycat.com/DistantPitifulAardvark-size_restricted.gif)

Vous êtes déjà prèt à déployer une application.

# Déploiement depuis Github

L'application que nous allons déployé ici est la démo minimaliste que Rancher nous fournis: [https://github.com/rancher/rio-demo](https://github.com/rancher/rio-demo).

## Composition du repo

Vous remarquerez qu'il n'y a que 2 fichiers:
* `main.go` un service web basic en Go
* `Dockerfile` la façon de créer un environment pour faire tourner le service Go
    * Le Dockerfile comprend la façon de builder `RUN ["go", "build", "-o", "demo"]` le projet ainsi que de façon de le lancer `CMD ["./demo"]`.

Cette découpe montre que nous utilisons une autre force de Docker qui est de pouvoir créer un environement reproductible.

## Déployement

Le repo étant publique nous n'avons qu'a exécuter une commande (`run`) en faisant référence à celui-ci.

`rio --kubeconfig civo-rio-on-civo-kubeconfig run -n cd-demo -p 8080 https://github.com/rancher/rio-demo`

Ici nous avons décidé de publier notre service avec le nom "cd-demo" et nous mappons le port 8080 au port publique 80.
Il est également possible de mapper d'autres ports en utilisant par exemple `-p 81:8081`.

Il ne vous reste plus qu'a exécuter la commande `ps` pour récupérer les informations de l'application que vous venez de déployer.

`rio --kubeconfig civo-rio-on-civo-kubeconfig ps`

**Image terminal**

Accédez à l'url indiquée quand le build et le déploiement sont terminé et vous devriez avoir un beau petit message fourni par un site sécurisé via https.

**Image certificat**

Avec cette commande unique, vous avez non seulement générer et déployer votre application mais vous avez activer un déploiement continue car Rio va vérifier toutes les 15 secondes s'il doit mettre à jour l'application.

Vous pouvez ainsi exécuter plusieurs fois cette commande pour plusieurs namespaces avec des branches différentes afin de déployer vos différents environments.

## Utiliser un Git privé (sécurisé)

Plusieurs types d'authentification sont possibles: Basic ou SSH.

### Authentification Basic

Cette méthode permet d'utiliser les autres commandes comme précédement sans rien changer.

Pour enregistrer vos données d'authentification dans Rio, utilisez la commande (`secret`):

`rio --kubeconfig civo-rio-on-civo-kubeconfig secret create --git-basic-auth`

Vous devrez indiquer une URL informer sur quelle Git appliquer ce secret.
Comme dit plus haut, les autres commandes ne changent pas.

### Authentification SSH

Pour engesitrer la clé SSH, vous devez également utiliser la commande `secret` mais avec le flag `--git-sshkey-auth`:

`rio --kubeconfig civo-rio-on-civo-kubeconfig secret create --git-sshkey-auth`

La commande pour lancer un service change un peu afin d'informer qu'il faut utiliser une connexion SSH:

`rio --kubeconfig civo-rio-on-civo-kubeconfig run --build-clone-secret gitcredential-ssh -p 8080 git@github.com/rancher/rio-demo`

### Autres secrets

D'autres types de secrets existe comme la connection à un docker registry privé.

Vous pouvez voir les différents types de secrets possible à l'aide de la commande d'aide `rio secret create --help`.

Pour plus d'information n'hésitez pas à aller faire un tour dans la [documentation](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md).

## Pull Request

Un point fort de Rio est qu'il peut provisionner une instance pour chaque PR, ce qui permet de voir le résultat avant de merger sans devoir lancer l'application en local.

### Configuration Webhook

Pour ce faire il faut créer un access token sur [Github](https://github.com/settings/tokens)

**Image Secret**

et créer un secret de webhook toujours avec le flag `--github-webhook`:

`rio --kubeconfig civo-rio-on-civo-kubeconfig secret add --git-sshkey-auth`

### Déployement pour PR

Utilisez la commande `run` avec un nouveau flag `--build-pr`

`rio run -p 8080 -n example-cd --build-webhook-secret=githubtoken --build-pr --template https://github.com/rancher/rio-demo`

*Envie d'en savoir plus sur `--template` ? C'est par [ici](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md#automatic-versioning).*

# Dashboard

Avant de voir d'autres façon de déployer votre application, c'est peut-être le moment de vous informer qu'il existe un dashboard web vous permetant de monitorer visuellement vos applications.

L'installation du Dashboard mais pour rester dans la simplicitée nous pouvons l'installer en une seule commande (`dashboard`):

`rio --kubeconfig civo-rio-on-civo-kubeconfig dashboard`

*Le Dashboard est installé mais ne répond pas encore ? Attendez encore un peu, le Dashboard prend plus de temps à ce lancer. Vous pouvez vérifier le lancement du Dashboard à l'aide de la commande `rio -n rio-system pods` déjà utilisée précédement*

**Image Dashboard**

Vous pourrez y retrouver tout ce que vous avez fait jusqu'a maintenant. Le dashboard permet aussi de déployer vos applications sans passer par le CLI.

Vous pouvez également remarquer que ce que j'appel un "déploiement" s'appel en réalité un "service".

# Déploiement d'une image Docker

# Déployer une application locale

# L'auto scaling

# Router

# Son propre domaine

# Service externes

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

