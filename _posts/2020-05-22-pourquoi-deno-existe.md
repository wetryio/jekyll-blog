---
date: 2020-05-22 11:00:00
layout: post
title: "pourquoi deno existe"
subtitle: "typescript, asynchrone, sandbox de sécurité, deno est notre ami"
description: "deno vient répondre à des problèmes de design de nodejs, et apporte son lot de modernité"
image: /assets/img/deno/deno-logo.svg
optimized_image:
category: decouverte
tags:
    - deno
    - node
    - javascript
    - typescript
author: mscolas
---

> Cet article utilise du code qui éxécute deno 1.1.1, sur ubuntu 20.04.
> Pour la lecture de cet article, des connaissances basiques en javascript ou typescript et nodejs sont nécessaires.

J'aime nodejs, j'adore le typescript, et j'aime surtout tout le go. Cet article vous présente les deno, avec les corrections apportés à nodejs, le typescript intégré, et l'écosystème similaire à go.

# C'est quoi deno

Deno (un anagramme de node!) est créé pour corriger les regrets d'un créateur de nodejs, Ryan Dahl. Créateur de nodejs et de deno, il s'est exprimé [ici](https://www.youtube.com/watch?v=M3BM9TB-8yA), notamment sur des points majeurs comme le manque des promises dans l'api standard, la sécurité et l'utilisation de package.json et de node_module. Ceci dit, nous parcourerons quelques-une des fonctionnalités de ce nouveau runtime.

## Une nouvelle api, en typescript, sans node_module

Pour exposer les features, observons un cet exemple.

```typescript
import { readJson } from "https://deno.land/std@master/fs/read_json.ts";
const fileContent = await readJson("./data.json");
console.log(fileContent);
```

Seule La première ligne nous intéresse. Elle fait un import ecmascript classique, ou presque. Au lieu de recherche un module créé nous même, ou d'un node_modules, le chemin d'accès référence directement un fichier web. Vous pouvez d'ailleurs le parcourir via le navigateur, dans en local lorsque deno l'aura téléchargé en cache pour vous dans le dossier $DENO_DIR/dep/.

Terminé les [énormes dossiers node_module](https://www.reddit.com/r/ProgrammerHumor/comments/6m6zrk/i_figured_you_guys_would_enjoy_this/) ! tous est inscrit directement dans l'url d'import. Nottez la présence de master. C'est comme ceci que nous importons les versions des packages. La version précédente est la 0.57.0. Remplacez _master_ par _0.57.0_ et votre code fonctionnera tout autant car *readJson* n'a pas changé entre les deux versions.

Vous pouvez l'essayer, mettez le contenu dans un fichier app.ts, construisez un json valide dans le fichier data.json, et lancez l'application via `deno run --allow-read=./data.json app.ts`. Nousn reviendrons sur le --allow-read plus tard.

### Standard module

L'api node, réputé pour créer des [callback hells](http://callbackhell.com/), est remplacé par un module standard. Non seulement elle se veut plus simple, elle est aussi désigné pour appliquer les mots async/await facilement. Son chemin d'accès, vous le connaissez déjà, c'est https://deno.land/std. Vous pouvez consulter une version lisible directement sur l'adresse. Lors de l'import du package, deno construira un requête formatté pour recevoir le contenu en format texte.

## Environnement sécurisé

Vous avez certainement déjà entendu parler au moins une fois d'un [package node malicieux](https://www.zdnet.com/article/microsoft-spots-malicious-npm-package-stealing-data-from-unix-systems/), qui allait explorer le serveur ou les données clientes sans que vous vous en rendiez compte. Deno offre sa solution.

Le process deno est dans une sandbox. Elle est controlée et s'assure qu'aucune tâche suspicieuse accède à des ressources privées. Par défaut, un process ne peut ni lire les fichiers, ni en écrire, ni accéder aux variables d'environement ou au web. Cette sandbox contrôle les permissions, et autorise ou non les opérations.

Pour permettre par exemple l'accès à un fichier comme dans notre premier extrait de code, le run utilisait le flag `--allow-run`. Avec cet ajout, nous autorisons l'application d'accéder en lecture seule au fichier `data.json`. Aucun autre fichier n'y est accessible.

Une multitude de permissions sont configurable, vous retrouverez [la liste complète ici](https://deno.land/manual/getting_started/permissions)

## Autour de deno

Le dossier node_module disparait au profit de déclaration de dépendance via l'url publique. Vous y remarquerez la similitude forte l'import des dépendances en go, qui utilise [aussi un chemin d'accès web](https://github.com/hashicorp/consul/blob/master/connect/proxy/listener.go#L13-L16) mais sans le protocole web. Mais deno partage une autre qualité avec go : des tools CLI pour nous faciliter le maintient et l'écriture du code.

### Un format unique pour des git blame efficaces

J'utilise souvent git blame pour me documenter sur le code que je lis. Elle me permet de retrouver facilement la feature associé via les Pull Requests associés. Toutefois, à chaque fois qu'un développeur ajoute ou supprime une white space à la fin d'une ligne, il entrave la navigation de code des développeurs futurs. S'il vous plait, formattez votre code.

C'est pourquoi la commande `deno fmt` est là. Executez cette petite commande dans votre dossier de travail, et tout le code se formate et s'indente de manière unique.

* Les white spaces exedentaires ou manquant sont retirés ou ajoutés
* Idem pour les tabulations
* Les déclarations d'array grande s'aligneront verticalement
* Les doubles retour à la ligne sont supprimés

### Le package-lock.json vous manque déjà ? On a aussi une solution

<sub>Si lire un fichier package-lock.json vous manque vraiment, vous devrier arrêter l'adderall</sub>

Si fichier package.json n'est plus, package-lock.json non plus. Ce fichier décrit l'arborescence des dépendances de votre application. Si vous désirez tout de même connaitre toutes les dépendances nécessaire à votre application, la commande `deno info` est votre ami.

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

On y voit apparaitre la dépendance unique https://deno.land/std@master/fs/read_json.ts, associé au fichier app.ts. Si vous désirez un exemple plus complet, essayez `deno info https://deno.land/std@master/http/file_server.ts`

### Facile à mettre à jour

Pour chaque update d'un language, j'execute toujours les opérations suivantes :

1. Je cherche la page de téléchargement
2. Je cherche après la documentation d'install et d'update
3. J'éxécute les tâches

PS: Certains language ont un manager de version, permettant de l'installation de la version désiré facilement. (nvm, gvm, ...)

Deno offre built-in la commande suivante `deno upgrade`. En executant simplement cette commande, deno télécharge les dernier packages, et se met à jour. Il n'offre pas de selection de version.

# Node survivra ?

Bien sûr ! Javascript est le language le plus utilisé au monde aujourd'hui. Il n'est plus la bidouille pour les browsers des années 2020. Il a mûrit et s'est unifié. Nodejs est par conséquent le moteur le plus populaire.

Deno contient 3 freins majeurs pour la communauté javascript :

* L'api est à réapprendre
* Tout le monde n'a pas adopté le Typescript. Certains ne l'aiment pas
* Les frameworks frontend n'y sont pas compatible, ni les packages npm

Par la présence des frameworks front-end majeurs comme Angular, React et Vue, nodejs s'assure encore une longue vie. Ces frameworks puissants ont fait ces preuves et n'ont pas la volonté actuelle d'être adapté pour deno.

Le nombre impressionnant, et [parfois farfelu](https://www.npmjs.com/package/is-thirteen) de package node assure eux-aussi une longue vie à node. La majorité de ces packages ne seront pas portés sur deno. La communauté javascrupt sera sans doute récalcitrant à apprendre une nouvelle fois un framework, une api, un language et des packages tierce populaire.

# Conclusion

Deno est extrêmement jeune. Un bébé dans l'air de l'informatique. Malgrès les ses qualités dont seulement quelques-uns sont évoqués dans cet article, il doit seulement prouver sa robustesse et trouver sa communauté. Aucun language n'est populaire dès ses premiers instants. Seul le temps nous dira l'impact qu'à deno sur le monde du développement.

```typescript
const node = ["n", "o", "d", "e"];
const deno = node.sort().join("");
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
