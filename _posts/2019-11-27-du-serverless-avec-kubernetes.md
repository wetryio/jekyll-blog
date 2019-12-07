---
date: 2019-11-27 18:19:36
layout: post
title: "Du serverless avec Kubernetes"
subtitle: Découvrons le framework serverless "Kubeless"
description: Du serverless sur un serveur ??? Et oui, ça ne veut pas dire sans serveur physique! 
image: /images/kubernetes/kubeless.png
optimized_image:
category: 'experimentation'
tags:
    - kubernetes
    - serverless
    - kubeless
author: dgilson
---

Quand on parle de "serverless", on pense évidement au cloud. Et pourtant il est possible de faire un serverless on-premises sur vos propre serveurs.

Du serverless sur un serveur ? Et oui, ça ne veut pas dire sans serveur physique!

Nous allons donc commencer par voir se qu'est le serverless. Si vous vous y connaissez déjà, n'hésitez pas à regarder la [table des matières](#toc) pour vous dirigez vers les parties intéressantes pour vous de l'article.

Si vous avez déjà fouillez un peu sur le sujet, vous avez remarqué qu'il existe pas mal d'autres frameworks du même genre. Mais si j'ai choisi Kubeless, c'est pour ça simplicitée d'utilisation, parcequ'il n'utilise que les éléments natifs de Kubernetes et qu'il ne faut pas passer par un registry Docker comme DockerHub.

![kubernetes_serveless_frameworks](/images/kubernetes/comparison_of_serverless_on_kubernetes.png)
<!-- https://winderresearch.com/a-comparison-of-serverless-frameworks-for-kubernetes-openfaas-openwhisk-fission-kubeless-and-more/ -->

## Qu'est ce que le serverless ?

Après le passage du monilith vers du microservice plus adapté au cloud et facilitant la maintenance, la suite logique est le nanoservice.

Quand un microservice comprend plusieurs end-points nécessaire pour répondre à une même problématique, un **nanoservice** ne représente qu'**un unique end-point**.

Les microservices et les nanoservices répondants à un probème précis, il semble évidant que certains d'entre eux sont réutilisables.

Une architecture serverless est le plus souvant représentée par un mélange de services existants (BAAS) et de nanoservice personnalisé (FAAS).

![serverless-architecture-evolution](/images/kubernetes/serverless-architecture-evolution-1024x405.jpg)
<!-- http://serverlessarchitecture.com/about/ -->

### Deux types de serverless

#### Baas (Backend as a service)​

Un BAAS est un **service tiers** utilisable pour créer d'autres produits.
Il est donc utilisable par un "**client riche**" tel qu'une SPA ou une application mobile.

Un bonne partie de notre application n'est donc plus à développer mais uniquement à configurer.

Quelques exemples:

<ul class="small">
    <li><strong>Stockage</strong>: Parse, Firebase, AWS DynamoDB…​</li>
    <li><strong>Authentification</strong>: Auth0, AWS Cognito…​</li>
</ul>

#### Faas (Function as a service)

Contrairement au BAAS, le FAAS est une logique serveur **écrite par un développeur​**.
Le code est exécuté dans des conteneurs éphémères (eux-mêmes géré par un tiers)​.

Exemples de genstionaires de fonctions:
<ul class="small">
    <li>Azure Functions</li>
    <li>AWS Lambda</li>
    <li>Google Cloud Functions</li>
</ul>

### Exemple d'architecture serverless

Pour illustrer une exemple, nous allons prendre un cas concret.
*Wassim CHEGHAM* a imaginé une application qui:
<ol class="small">
    <li>Prend une <strong>photo</strong> depuis une app angular</li>
    <li><strong>Uploads</strong> l'image dans le cloud</li>
    <li>Extrait le texte de l'image via <strong>OCR</strong></li>
    <li><strong>Traduit</strong> le texte dans la langue de l'utilisateur</li>
    <li>Sauve le résultat dans une <strong>DB NoSQL</strong></li>
    <li>Envoie le text par <strong>SMS</strong></li>
</ol>

Cela est possible en écrivant très peu de ligne de code car nous n'écrivons, en réalité, que le flux entre les services.

Wassim CHEGHAM a décidé d'utiliser les services Azure et donc d'écrire des fonctions en Azure Functions. Mais cela est tout à fait possible via Kubeless.

![serverless-example](/images/kubernetes/servless-example.jpeg)

## Kubeless

Kubeless est un framework FAAS open-source basé sur Kubernetes.

### Caractéristiques

#### Triggers

​Un trigger est la façon de lancer la fonction. Plusieurs triggers sont directement utilisables:

<ul class="small">
    <li>HTTP​</li>
    <li>Conjob​</li>
    <li>PubSub​ (Plublication - Souscription)</li>
    <ul>
        <li>via Kafka​</li>
        <li>via NATS messaging​</li>
    </ul>
    <li>Data stream events​</li>
    <ul>
        <li>AWS Kinesis​</li>
    </ul>
</ul>

Il est également possible de créer votre propre Trigger.

#### Runtimes

Un runtime est un exécuteur de langage. Plusieurs langages sont directement utilisables:

<ul class="small">
    <li>JavaScript (NodeJS)​</li>
    <li>Go​</li>
    <li>C#, F# (.NET Core 2)​</li>
    <li>Java​</li>
    <li>Python​</li>
    <li>Ruby​</li>
    <li>Bellerina​</li>
</ul>

Tout comme pour les triggers, il est possible de créer votre propre Runtime.

### Installation

Pour installer Kubeless, il vous faut Kubernetes. La manière la plus simple d'installer un Kubernetes est d'utiliser [Rancher](https://rancher.com/quick-start/) mais cela est hors scope de cet article, je vais donc partir sur le fait que vous avez déjà un Kubernetes sous la main.

Installez Kubeless en 4 étapes:
* Récupération de la version de la dernière release
    ```sh
    export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
    ```
* Création du namespace
    ```sh
    ​kubectl create ns kubeless
    ```
* Installation de Kubeless
    ```sh
    kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
    ```
* Vérification de l’installation
    ```sh
    kubectl get deployment -n kubeless
    ```

Une fois que la vérification vous informe que le déploiement est "ready", c'est que Kubeless a été installé avec succès.

### Installation de l'interface UI

Sur Azure, il est possible de créer une fonction soit via un CLI, soit via une interface web. Cela est évidement possible avec Kubeless mais il va faloir installer l'UI en plus.

* Installation de Kubeless UI
    ```sh
    kubectl create -f https://raw.githubusercontent.com/kubeless/kubeless-ui/master/k8s.yaml
    ```

### Créer une fonction HTTP

#### UI


#### CLI


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
