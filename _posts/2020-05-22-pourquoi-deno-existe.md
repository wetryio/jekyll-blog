---
date: 2020-05-22 11:00:00
layout: post
title: "pourquoi deno existe"
subtitle: "typescript, asynchrone, sandbox de sécurité, deno est notre ami"
description: "deno vient répondre à des problèmes de design de nodejs, et apporte son lot de modernité"
image:
optimized_image:
category: decouverte
tags:
    - deno
    - javascript
    - typescript
author: mscolas
---

J'aime nodejs, j'adore le typescript, et j'aime par dessus tout le go. Cet article vous présente les deno, avec les corrections apportés à nodejs, le typescript intégré, et l'écosystème similaire à go.

Pour la lecture de cet article, des connaissances basiques en typescript sont nécessaires.

# C'est quoi deno

Deno (un anagramme de node!) est créé pour corriger les regrets d'un créateur de nodejs, Ryan Dahl. Créateur de nodejs et de deno, il s'est exprimé [ici](https://www.youtube.com/watch?v=M3BM9TB-8yA), notamment sur des points majeurs comme le manque des promises dans l'api standard, la sécurité et l'utilisation de package.json et de node_module. Ceci dit, nous parcourerons quelques-une des fonctionnalités de ce nouveau runtime.

## Une nouvelle api, en typescript, sans node_module

Pour exposer les features, observons un premier exemple.

```typescript
import { readJson } from "https://deno.land/std@master/fs/read_json.ts";
const fileContent = await readJson("./data.json");
console.log(fileContent);
```

Seule La première ligne nous intéresse. Elle fait un import ecmascript classique, ou presque. Au lieu de recherche un module créé nous même, ou d'un node_modules, le chemin d'accès référence directement un fichier web. Vous pouvez d'ailleurs le parcourir via le navigateur, dans en local lorsque deno l'aura téléchargé en cache pour vous dans le dossier $DENO_DIR/dep/.

Terminé les énormes dossiers node_module ! tous est inscrit directement dans l'url d'import. Nottez la présence de master. C'est comme ceci que nous importons les versions des packages. La version précédente est la 0.51.0. Remplacez _master_ par _0.51.0_ et votre code fonctionnera tout autant car le code n'a pas changé entre les deux versions.

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

