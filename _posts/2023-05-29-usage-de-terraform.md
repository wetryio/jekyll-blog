---
date: 2022-06-05 17:07:18
layout: post
title: "Usage de terraform"
subtitle:
description:
image:
optimized_image:
category:
tags:
author: mscolas
---

> Cet article fait partie d'une série de 3 articles
* Usage de terraform
* Cycle de vie d'une commande 'terraform apply'
* Créer son provider terraform 
* Finit la démo, un usage proche de la réalité


## Avantage du déclaratif

En tant que développeur, nous connaissons bien le paradigme impératif. En court, nous écrivons du code ou des scripts qui applique des opérations sur un système. Par exemple :
* Ajouter une ligne dans un fichier de log
* Modifier un record dans un base de donnée
* Poster une nouvelle ressourcer sur un API via un Http POST

Mais dans le cas de gestions de l'infrastructure, un autre paradigme est devenu populaire, notamment avec les APIs kubernetes, mais aussi avec la technologie abordée aujourd'hui, terraform. Je veux bien sur parler du paradigme déclaratif.

Son plus grand avantage, et qui pour moi à lui seul est un argument suffisant pour séléctionner ce paradigme pour la gestion d'infrastructure, c'est qu'il **permet la répétition peut importe l'état actuel de votre insfrastructure**. Avec votre application, vous pouvez aisément déclaré que la version 1.0.0 de votre application a besoin d'une seul instance d'une base de donnée. Il est simple de le déclarer, et vous pouvez répliquer cette configuration pour tous les environnements, et pourquoi pas dans un environnement de test CI. Ensuite, la version 2.0.0 a besoin de 3 instances de DB. Et bien peut importe si votre environnement existe déjà ou non, que votre environnement a 1 instance, ou aucune instance, votre déclaration d'infrastructure suffit pour arriver au résultat attendu : 3 instances d'une DB

Cet article a pour objectif de vous démontrer que terraform est accessible. Le format de blog ne permet bien sur pas d'accomplir un tour complet de la technologie. Si vous désirez aller plus loin dans l'utilisation de terraform, je recommande chaudement [Terraform Up & Running](https://www.oreilly.com/library/view/terraform-up-and/9781098116736/)

## Découverte avec un usage simple

> Cette démo utilise des ressources gratuites. Le but et que vous puissiez comprendre les méchanismes de base sans sortir la carte de crédit. Une démo complète et plus réel, mais avec des ressources payante vous attends en 4e partie. Vous pouvez facilement installer terraform, et éxécuter le fichier ci dessous.

Voici le plan que nous allons suivre pour cet article :

Supposez le cas d'utilisation, vous voulez pousser un fichier de configuration sur votre ordinateur local. Vous pourrez écrire un fichier terraform comme ceci :

```terraform
# main.tf
terraform {
  required_providers {
    filesystem = {
      # provider ici https://github.com/sethvargo/terraform-provider-filesystem
      source = "sethvargo/filesystem"
      version = ">=1.0.0"
    }
  }
}

provider "filesystem" { }

resource "filesystem_file_writer" "foo_config" {
  path = "/tmp/terraform/foo.config" # n'hésitez pas à changer le chemin d'accès dans le cas où vous travaillez sous windows
  contents = "Lorem Ipsum\n"
  mode = "0600" # read & write.
}
```

parcourons les quelques blocks.

### Les providers

Terraform ajoute des capacités à vos déclarations grâce à des providers. Par défaut, terraform n'a aucune capacité de modification. C'est via les providers que nous allons requêter les features que nous voudrions utiliser.

Le block `terraform { required_providers { } }` indique quels sont les dépendances extérieurs à télécharger. Il est nécessaire dans notre exemple pour télécharger un provider plublique pour écrire notre fichier. Nous indiquons son identifiant "sethvargo/filesystem", et que nous voulons la version 1.0.0 ou plus.

Ensuite, nous déclarons la configuration du provider via le block `provider "filesystem"`. Ce provider ne demande aucune configuration quelconque, nous pouvons ignorer celui-ci.

Grâce à ces quelques lignes, vous pouvez déjà télécharger les dépendances et configurer votre espace de travail via la commande `terraform init`

### Les ressources

C'est ici que nous déclarons concrètement l'état que nous désirons installer. La déclaration est simple, et la [documentation ici](https://registry.terraform.io/providers/sethvargo/filesystem/latest/docs/resources/file_writer)

Exécutez la commande `terraform apply`, et expliquons ce qui est retourné :

![terraform-apply-result](/assets/img/terraform-usage/terraform-apply-result.jpg)

Par défaut, terraform vous avertit des changements qui seront apportés. Vous pouvez introduire `yes`, et appliquer les changements. Voilà !

> Je vous invite à rééxécuter la commande, de changer le contenu du fichier, ou bien de changer la déclaration, etc ... vous devriez voir apparaitre les intentions de terraform lors de vos prochains runs. Comme de modifier le fichier, etc ...

Une fois votre curiosité satisfaite, vous pouvez supprimer le fichier via `terraform destroy`


### Aller plus loin

Les ressources sur le sujet terraform sont foisonnante sur le net. Si vous voulez vous lancer dans la consommation de terraform, la documentation officielle, ainsi que d'autres tuto sur le net rempliront cette objectif. Pour ce blog, l'objectif est atteint : avoir un projet de base pour les 3 prochains articles, sujets qui sont moins parcourus par les autre blogueurs du net.

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

