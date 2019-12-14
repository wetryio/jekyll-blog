---
date: 2019-12-09 18:19:36
layout: post
title: "Du serverless avec Kubernetes"
subtitle: Découvrons le framework serverless "Kubeless"
description: Serverless ne veut pas dire sans serveur physique!
image: /images/kubernetes/kubeless.png
optimized_image:
category: 'experimentation'
tags:
    - kubernetes
    - serverless
    - kubeless
author: dgilson
---

Quand on parle de "serverless", on pense évidemment au cloud. Et pourtant il est possible de faire un serverless on-premises sur vos propres serveurs.

Du serverless sur un serveur ? Et oui, ça ne veut pas dire sans serveur physique!

Nous allons donc commencer par voir ce qu'est le serverless. Si vous vous y connaissez déjà, n'hésitez pas à regarder la [table des matières](#toc) pour vous diriger vers les parties intéressantes pour vous de l'article.

Si vous avez déjà fouillé un peu sur le sujet, vous avez remarqué qu'il existe pas mal d'autres frameworks du même genre. Mais si j'ai choisi Kubeless, c'est pour ça simplicité d'utilisation, parce qu'il n'utilise que les éléments natifs de Kubernetes et qu'il ne faut pas passer par un registry Docker comme DockerHub.

![kubernetes_serveless_frameworks](/images/kubernetes/comparison_of_serverless_on_kubernetes.png)
<!-- https://winderresearch.com/a-comparison-of-serverless-frameworks-for-kubernetes-openfaas-openwhisk-fission-kubeless-and-more/ -->

## Qu'est-ce que le serverless ?

Après le passage du monilith vers du microservice plus adapté au cloud et facilitant la maintenance, la suite logique est le nanoservice.

Quand un microservice comprend plusieurs end-points nécessaires pour répondre à une même problématique, un **nanoservice** ne représente qu'**un unique end-point**.

Les microservices et les nanoservices répondants à un problème précis, il semble évident que certains d'entre eux sont réutilisables.

Une architecture serverless est le plus souvent représentée par un mélange de services existants (BAAS) et de nanoservice personnalisé (FAAS).

![serverless-architecture-evolution](/images/kubernetes/serverless-architecture-evolution-1024x405.jpg)
<!-- http://serverlessarchitecture.com/about/ -->

### Deux types de serverless

#### Baas (Backend as a service)​

Un BAAS est un **service tiers** utilisable pour créer d'autres produits.
Il est donc utilisable par un "**client riche**" tel qu'une SPA ou une application mobile.

Une bonne partie de notre application n'est donc plus à développer, mais uniquement à configurer.

Quelques exemples:

<ul class="small">
    <li><strong>Stockage</strong>: Parse, Firebase, AWS DynamoDB…​</li>
    <li><strong>Authentification</strong>: Auth0, AWS Cognito…​</li>
</ul>

#### Faas (Function as a service)

Contrairement au BAAS, le FAAS est une logique serveur que **vous allez écrire​**.
Le code est exécuté dans des conteneurs éphémères (eux-mêmes géré par un tiers)​.

Exemples de gestionnaires de fonctions:
<ul class="small">
    <li>Azure Functions</li>
    <li>AWS Lambda</li>
    <li>Google Cloud Functions</li>
</ul>

### Exemple d'architecture serverless

Pour illustrer un exemple, nous allons prendre un cas concret. *([Post original ici](https://twitter.com/manekinekko/status/1145472408071151616))*
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

Wassim a décidé d'utiliser les services Azure et donc d'écrire des fonctions en Azure Functions. Mais cela est tout à fait possible via Kubeless.

![serverless-example](/images/kubernetes/servless-example.jpeg)

## Kubeless

Kubeless est un framework FAAS open-source basé sur Kubernetes.

### Caractéristiques

#### Triggers

​Un trigger est la façon de lancer la fonction. Plusieurs triggers sont directement utilisables:

<ul class="small">
    <li>HTTP​</li>
    <li>Cron job​</li>
    <li>PubSub​ (Publication - Souscription)</li>
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
    <li>Ballerina</li>
</ul>

Tout comme pour les triggers, il est possible de créer votre propre Runtime.

### Installation

Pour installer Kubeless, il vous faut Kubernetes. La manière la plus simple d'installer un Kubernetes est d'utiliser [Rancher,](https://rancher.com/quick-start/) mais cela est hors du scope de cet article, je vais donc partir sur le fait que vous avez déjà un Kubernetes sous la main.

<small>
*Les commandes de l'article sont exécutables sur des serveurs linux. La création de variables se fait différement sur des serveurs Windows.*
</small>

Installez Kubeless en 4 étapes:
* Récupération de la version de la dernière release
    ```sh
 export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4) 
    ```
* Création du namespace
    ```sh
 kubectl create ns kubeless 
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

Sur Azure, il est possible de créer une fonction soit via un CLI, soit via une interface web. Cela est évidemment possible avec Kubeless, mais il va faloir installer l'UI en plus.

* Installation de Kubeless UI
    ```sh
 kubectl create -f https://raw.githubusercontent.com/kubeless/kubeless-ui/master/k8s.yaml 
    ```

### Créer une fonction HTTP

Commençons par créer une fonction HTTP (un end-point).

#### Fonction HTTP avec l'UI

Après l'installation des outils, vous devriez avoir accès à cette interface:
![kubelessui-home](/images/kubernetes/kubelessui1.png)

Créons notre première fonction en cliquant sur le bouton à cet effet. Un popup vous demandera alors:
<ol class="small">
    <li>Le <strong>nom</strong> de la fonction</li>
    <li>Le nom du <strong>handler</strong> de la fonction (fonction exportée dans le module JavaScript) précédé par le nom de celle-ci</li>
    <li>Le <strong>runtime</strong></li>
    <li>Les <strong>dépendances</strong> (formaté comme un package.json)</li>
</ol>
![kubelessui-create-function](/images/kubernetes/kubelessui2.png)

Cela vous créera un "hello world" par défaut vous montrant comment le handler doit être exporté.
![kubelessui-default-script](/images/kubernetes/kubelessui3.png)

En dessous du code, vous pourrez ouvrir un "terminal" affichant les logs de la fonction des pods déployées (ici un pod unique):
![kubelessui-terminal](/images/kubernetes/kubelessui5.png)

Utilisons maintenant la dépendance que nous avons installée (`lodash`) en utilisant par exemple sa fonction `capitalize`.
![kubelessui-script2](/images/kubernetes/kubelessui4.png)

Regardons à nouveau le terminal: nous bénéficions de l'orchestration Kubernetes pour éviter tout down-time durant la mise à jour de la fonction.
![kubelessui-terminal2](/images/kubernetes/kubelessui6.png)

A-t-il déjà été aussi simple de déployer un service en on-premise ?

Nous avons utilisé une dépendance simple, mais vous pouvez utiliser la dépendance NPM que vous désirez. Vous pouvez aller voir [cet exemple](https://github.com/wetryio/wetry.conf-serverless/blob/master/src/kubeless/text-analyzer/function.js) qui utilise certains cognitive-services d'Azure.

#### Fonction HTTP avec le CLI

Nous avons vu comment créer une fonction HTTP depuis l'interface web, mais il est tout aussi facile de faire un déploiement depuis le CLI.
Pour cela il faudra évidemment avoir le CLI installé. Suivez les étapes expliquées sur le [site officiel](https://kubeless.io/docs/quick-start/) d'après votre système d'exploitation.

Le CLI dispose de deux commandes principales:
* **deploy** permet le premier déploiement d'une fonction
    ```sh
 kubeless function deploy email --runtime nodejs12 --from-file function.js --handler email.validate 
    ```
* **update** permet de mettre à jour une fonction déjà déployée
    ```sh
 kubeless function update email --runtime nodejs12 --from-file function.js --handler email.validate 
    ```

Enfin, la fonction à déployer doit avoir la même structure que sur l'UI.
![kubelessui-cli](/images/kubernetes/kubelessui7.png)

Une fonction déployée via le CLI peut ensuite être modifiée via l'UI sauf si vous utilisez un framework additionnel comme [Serverless](https://serverless.com/) qui va minifier/compiler le code et le rendre complètement illisible.

### Créer une fonction PubSub

Pour cet exemple, nous allons utiliser le mécanisme de message **Kafka**. Pour ce faire il faut d'abord l'installer en exécutant ces commandes:

* Récupération de la version de la dernière release du trigger
    ```sh
 export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kafka-trigger/releases/latest | grep tag_name | cut -d '"' -f 4) 
    ```
* Installer Kafka et ZooKeeper
    ```sh
 kubectl create -f https://github.com/kubeless/kafka-trigger/releases/download/$RELEASE/kafka-zookeeper-$RELEASE.yaml 
    ```
* Vérification de l’installation
    ```sh
 kubectl -n kubeless get statefulset 
    ```

La récupération de données depuis le fonction est aussi simple que pour la fonction HTTP. La donnée se trouve dans `event.data`.

```javascript
module.exports = {
    intercept: function(event, context) {
        console.log(event.data);
        return event.data;
    }
};
```

Le déploiement se fait également de la même manière que l'HTTP.
```sh
 kubeless function deploy pubsubfn --runtime nodejs12 --from-file function.js --handler pubsubfn.intercept 
```

Créer un trigger kafka pour associé les évènements d'un topic à la fonction précédemment créée.
```sh
 kubeless trigger kafka create pubsubfn --function-selector created-by=kubeless,function=pubsubfn --trigger-topic test-topic 
```

Enfin créez le topic dans kafka:
```sh
 kubeless topic create test-topic 
```

Il ne nous reste plus qu'à tester la fonction.
```sh
 kubeless topic publish --topic test-topic --data "Hello World!" 
```

Arrivé ici, vous remarquez qu'il n'est pas plus compliqué de faire une fonction pouvant être appelée par un ou plusieurs triggers. Il ne s'agit que de configuration.

### Sécurité

Et la sécurité là-dedans ?

Je ne vais pas m'attarder sur ce point, mais je voulais mettre en avant qu'il est tout à fait possible de configurer du **SSL** ou encore de l'**authentification** pour vos fonctions. Cela est possible via la couche réseau de Kubernetes pouvant être: **Nginx** Ingress, **Kong** Ingress ou **Traefik** Ingress.
[Plus d'infos sur la sécurisation du trigger HTTP ici.](https://kubeless.io/docs/http-triggers/)

Il également possible de gérer les "secrets" via une variable d'environnement en configurant un template pour la création des pods de fonction.
[Plus d'infos sur la configuration du controller Kubeless ici.](https://kubeless.io/docs/function-controller-configuration/)

## Conclusion

Si vous êtes arrivé jusqu'ici, j'espère vous avoir donné envie de tester le serverless et principalement le FAAS.
Il s'agit d'un type d'architecture peu couteux en développement, déploiement et extrêmement scalable.

Cependant, d'après le type de trigger choisit, la difficulté est probablement déplacée au niveau du debugging et de la configuration.

Enfin, j'ai préféré vous expliquer un framework FAAS open-source basé sur Kubernetes car cela vous permet de ne pas vous tracasser par rapport à votre provider (Azure, AWS, GCF ou encore en on-premise) et permet un transférer de votre écosystème d'un provider à un autre facilement.

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
