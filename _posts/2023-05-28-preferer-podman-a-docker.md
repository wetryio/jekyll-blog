---
date: 2023-05-28 14:20:04
layout: post
title: "Préférer podman à docker"
subtitle:
description:
image: /assets/img/podman-docker/podman-logo.png
optimized_image:
category:
tags: podman docker cloud container
author: mscolas
---

## La révolution docker

Ce n'est plus à prouvé aujourd'hui, docker a changer le monde du développement. Il permet aux développeurs de faciliter les tests, installer des éxécutables facilement, créer des POCs à une vitesse éclair. Les équipes opérationnels en profitent pour installer les applications sereinnement, diminuer la compléxité d'installation et la maintenance des dépendances. J'ose imaginer que cette introduction ne vous apprend rien. Docker est tellement populaire que la plupart d'entre nous utilisent érronément interchangeablement les mots 'docker' et 'containers', c'est pour dire à quelle point docker est ancré dans notre esprit comme a la solution première pour solutions de containerisations.

Toutefois, aujourd'hui, je ne recommande plus Docker à mes collègues. Je recommande Podman.

## Le problème docker

De manière extrêmement simplifié, docker a cette architecture (colonne de gauche) :
![dockerpodmanrun](/assets/img/podman-docker/podman-docker-run.png)

Le runtime de docker vit dans un daemon(=service) root(=administrateur) qui écoute sur un socket. Ce qui signifie qui a accès au socket peuvent lancer n'importe quel container avec l'utilisateur root. Ce qui n'est pas espérés dans un environnement sensible. Et l'ordinateur d'un développeur est déjà un environnement sensible.

Podman a fait un choix différent. Celui de créer des containers sans les droits root (=rootless). De plus, une fois le container démarré, podman est stoppé. Il n'est pas un runtime pour container, seulement une couche de synchronisation pour démarré des sous-process containairisés. Observez dans l'image ci-dessous que selon l'utilisateur que je suis, la liste des containers démarrés diffèrent.

![podmanps](/assets/img/podman-docker/podman-ps.png)

## Docker desktop et Podman desktop

J'espère ne pas vous l'apprendre, Docker Desktop est sous licence payante sous certaines conditions. Simplement installé Docker via Docker Desktop est déjà sous licence payante, même si vous ignorez complètement Docker Desktop après installation. L'outil est formidable pour ceux qui préfèrent utiliser des outils graphique. Podman bien sur propose lui aussi un outil équivalent : [Podman desktop](https://podman-desktop.io/), dont la version stable 1.0 est disponible depuis le 17 mai 2023. Bien sur, [la licence est gratuite sous apache v2](https://github.com/containers/podman-desktop/blob/main/LICENSE)

> Je ne recommande pas d'utiliser les outils graphique. A chaque fois que vous utiliser un outil graphique pour une tâche, vous perdez l'occasion de l'automatiser. Mais ce sera sûrement la discussion pour un autre article.

## Utiliser podman cli comme docker cli

Les créateurs de podman ont fait un choix judicieux pour permettre aux développeurs habitués à docker pour adopter podman rapidement : toutes les commandes du docker cli doivent être supportés par podman. Toute déviation de comportement est considéré comme un bug.
[comme ce tweet de 2018 peut l'affirmer](https://twitter.com/ialanmoran/status/1001671953571303425), utiliser docker pour un alias pour podman ne devrait pas être un problème.

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

