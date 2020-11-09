---
date: 2020-08-07 11:00:00
layout: post
title: "Pourquoi deno existe"
subtitle: "typescript, asynchrone, sandbox de sécurité, deno est notre ami"
description: "deno vient répondre à des problèmes de design de nodejs, et apporte son lot de modernité"
image: /assets/img/deno/deno-logo.png
category: decouverte
tags:
    - deno
    - node
    - javascript
    - typescript
author: mscolas
---

> Cet article utilise du code qui exécute deno 1.1.1, sur ubuntu 20.04.
> Pour la lecture de cet article, des connaissances basiques en javascript ou typescript et nodejs sont nécessaires.
> Lors de la rédaction de l'article, le package standard deno (expliquée plus tard) était en version 0.58.0

J'aime nodejs, j'adore le typescript et j'aime surtout tout le go. Cet article vous présente deno, avec les corrections apportées à nodejs, le typescript intégré et l'écosystème similaire à go.

# Deno, c'est quoi?

Deno (un anagramme de node!) est créé pour corriger les regrets d'un créateur de nodejs, Ryan Dahl. Il s'est exprimé [ici](https://www.youtube.com/watch?v=M3BM9TB-8yA), notamment sur des points majeurs comme le manque des promises dans l'api standard, la sécurité et l'utilisation de package.json et de node_module. Ceci dit, nous parcourirons quelques-unes des fonctionnalités de ce nouveau runtime.

## Une nouvelle api, en typescript, sans node_module

Pour exposer les features, observons cet exemple.

```typescript
import { readJson } from "https://deno.land/std@master/fs/read_json.ts";
const fileContent = await readJson("./data.json");
console.log(fileContent);
```

Seule la première ligne nous intéresse. Elle fait un import ecmascript classique, ou presque. Au lieu de rechercher un module créé nous-même, ou d'un node_modules, le chemin d'accès référence directement un fichier web. Vous pouvez d'ailleurs le parcourir via le navigateur, en local lorsque deno l'aura téléchargé en cache pour vous dans le dossier $DENO_DIR/dep/.

Terminé les [énormes dossiers node_module](https://www.reddit.com/r/ProgrammerHumor/comments/6m6zrk/i_figured_you_guys_would_enjoy_this/) ! Tout est inscrit directement dans l'url d'import. Notez la présence de master. C'est comme ceci que nous importons les versions des packages. La version précédente est la 0.57.0. Remplacez _master_ par _0.57.0_ et votre code fonctionnera tout autant car *readJson* n'a pas changé entre les deux versions.

Vous pouvez l'essayer :

* Mettez le contenu dans un fichier app.ts
* Construisez un json valide dans le fichier data.json
* Lancez l'application via `deno run --allow-read=./data.json app.ts`.

Nous reviendrons sur le --allow-read plus tard.

### Standard module

L'api node, réputée pour créer des [callback hells](http://callbackhell.com/), est remplacée par un module standard. Non seulement elle se veut plus simple, mais aussi designée pour appliquer les mots async/await facilement. Son chemin d'accès, vous le connaissez déjà, c'est https://deno.land/std. Vous pouvez consulter une version lisible directement sur l'adresse. Lors de l'import du package, deno construira une requête formatée pour recevoir le contenu en format texte.

## Environnement sécurisé

Vous avez certainement déjà entendu parler au moins une fois d'un [package node malicieux](https://www.zdnet.com/article/microsoft-spots-malicious-npm-package-stealing-data-from-unix-systems/), qui allait explorer le serveur ou les données clientes sans que vous vous en rendiez compte. Deno offre sa solution.

Le process deno est dans une sandbox. Il est contrôlé et s'assure qu'aucune tâche suspicieuse n'accède à des ressources privées. Par défaut, un process ne peut ni lire les fichiers, ni en écrire, ni accéder aux variables d'environnement ou au web. Cette sandbox contrôle les permissions et autorise ou non les opérations.

Pour permettre, par exemple, l'accès à un fichier comme dans notre premier extrait de code, le run utilisait le flag `--allow-read=./data.json`. Avec cet ajout, nous autorisons l'application à accéder en lecture seule au fichier `data.json`. Aucun autre fichier n'est accessible.

Une multitude de permissions est  configurable, vous retrouverez [la liste complète ici](https://deno.land/manual/getting_started/permissions)

## Autour de deno

Le dossier node_module disparait au profit de déclaration de dépendance via l'url publique. Vous y remarquerez la similitude forte avec l'import des dépendances en go, qui utilise [aussi un chemin d'accès web](https://github.com/hashicorp/consul/blob/master/connect/proxy/listener.go#L13-L16) mais sans le protocole web. Mais deno partage une autre qualité avec go : des tools CLI pour nous faciliter le maintien et l'écriture du code.

### Un format unique pour des git blame efficaces

J'utilise souvent la commande `git blame` pour me documenter sur le code que je lis. Elle me permet de retrouver facilement la fonctionnalité associée aux pull requests. Toutefois, à chaque fois qu'un développeur ajoute ou supprime une espace blanc à la fin d'une ligne, il entrave la navigation de code des développeurs futurs. S'il vous plait, formatez votre code.

C'est pourquoi la commande `deno fmt` est là. Exécutez cette petite commande dans votre dossier de travail, et tout le code se formate et s'indente de manière unique.

* Les white spaces excédentaires ou manquants sont retirés ou ajoutés
* Idem pour les tabulations
* Les déclarations de grande array s'alignent verticalement
* Les doubles retour à la ligne sont supprimés

### Le package-lock.json vous manque déjà ? On a aussi une solution

<sub>Si lire un fichier package-lock.json vous manque vraiment, vous devriez arrêter l'adderall.</sub>

Si le fichier package.json n'est plus, package-lock.json non plus. Ce fichier décrivait l'arborescence des dépendances de votre application. Si vous désirez tout de même connaitre toutes les dépendances nécessaires à votre application, la commande `deno info` est votre amie.

Si vous lancez la commande `deno info app.ts`, vous y trouverez ceci :

```text
Compile file://.../app.ts
local: /.../app.ts
type: TypeScript
compiled: /.../app.ts.js
map: /.../app.ts.js.map
deps:
file:///.../app.ts
  └── https://deno.land/std@master/fs/read_json.ts
```

On y voit apparaitre la dépendance unique https://deno.land/std@master/fs/read_json.ts, associée au fichier app.ts. Si vous désirez un exemple plus complet, essayez `deno info https://deno.land/std@master/http/file_server.ts`

### Facile à mettre à jour

Pour chaque update d'un langage, j'exécute toujours les opérations suivantes :

1. Je cherche la page de téléchargement
2. Je cherche après la documentation d'install et d'update
3. J'exécute les tâches

PS: Certains langages ont un manager de version, permettant l'installation de la version désirée facilement. (nvm, gvm, ...)

Deno offre built-in la commande suivante `deno upgrade`. En exécutant simplement cette commande, deno télécharge la dernière sortie et se met à jour. Il n'offre pas de sélection de version.

# Node survivra ?

Bien sûr ! Javascript est l'un des langages les plus utilisés au monde aujourd'hui. Il n'est plus la bidouille pour les browsers des années 2000. Il a mûri et s'est unifié. Nodejs est par conséquent le moteur le plus populaire.

Deno contient 3 freins majeurs pour la communauté javascript :

* L'api est à réapprendre.
* Tout le monde n'a pas adopté le Typescript. Certains ne l'aiment pas.
* Les frameworks frontend n'y sont pas compatibles, ni les packages npm.

Par la présence des frameworks front-end majeurs comme Angular, React et Vue, nodejs s'assure encore une longue vie. Ces frameworks puissants ont fait leurs preuves et n'ont pas la volonté actuelle d'être adaptés pour deno.

Les packages en nombre impressionnant, et [parfois farfelu](https://www.npmjs.com/package/is-thirteen) assurent eux aussi une longue vie à node. La majorité de ces packages ne seront pas portés sur deno. La communauté javascript sera sans doute récalcitrante à apprendre une nouvelle fois un framework, une api, un langage et des packages tierces populaires.

# Conclusion

Deno est extrêmement jeune. Un bébé dans l'ère de l'informatique. Malgré ses qualités dont seulement quelques-unes sont évoquées dans cet article, il doit seulement prouver sa robustesse et trouver sa communauté. Aucun langage n'est populaire dès ses premiers instants. Seul le temps nous dira l'impact qu'a deno sur le monde du développement.

```typescript
const node = "node";
const deno = node.split("").sort().join("");
console.log(deno); // > deno
```

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
