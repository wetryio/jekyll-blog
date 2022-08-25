---
date: 2022-08-25 06:15:22
layout: post
title: "Retour sur investissement"
subtitle:
description: Appliquer des principes d'investissements sur le développement
image: /assets/img/investissement/empty.png
optimized_image:
category:
tags:
- essai
author: mscolas
---

> Notre dernier article date de juin 2021, soit plus d'un an avant. Pour ma part, j'ai eu beaucoup de changement dans mon quotidien, de nouvelles priorités sont apparus. Je reste concentré sur le monde du développement, mais ça n'est pas(/plus?) la seule activité auquel j'ai envie de m'investir.
> J'ai testé le poker en 2021, la construction de ma prochaine maison commence bientôt, ma copine m'a rejoint dans mon habitation actuelle. Toutes ces heureuses aventures prennent du temps. Mais en plus de celà, une seconde passion apparait, l'investissement en bourse. C'est en retour de mes formations sur comment reconnaitre une bonne entreprise que l'idée de cet article.
> Aussi, j'aimerais explorer une nouvelle catégorie d'articles, les essais. Au lieu de clamer haut et fort ce que j'estime vrai et de grande valeur, je vais plutôt partager des idées dont j'ignore encore la véracité, mais qui me prennent et dont j'ai envie de partager.

# Introduction, les intérets composés, et retour sur actifs.

Avant de débuter cet article sur le développement, quelques concecpts sur l'investissement sont important pour comprendre la base de la réflexion.

## Les intérets composés

Si vous ne connaissez pas [l'échiquier de Sissa](https://fr.wikipedia.org/wiki/Probl%C3%A8me_de_l%27%C3%A9chiquier_de_Sissa), ou observé l'évolution d'une suite mathématique dont les élements sont une valeurs égale à une puissance de l'élément précedent, alors ce paragraphe est pour vous.

Considérons que j'investisse 100€ dans une société dont elle promet de verser un dividende de 5€ par an. Et que pour l'exemple, la valeur de l'action stagne perpetuellement.
A la fin de la première année, je serai possésseur de 5€(100*0.05) en cash, et d'une possession de l'entreprise de 100€. N'ayant par pour but de consommer ces 5€, je décide de réinvestir ces 5€ dans la même société. Je détiens donc 105€ de possession d'entreprise
A la fin de la deuxième année, je suis possésseur de 5,25€ de cash, et 105€ de possession. Je décide de réinvestir pour une possession de 110.25€.

Observez ce minuscule 25 cent supplémentaire. Celà peut vous sembler ridicule, mais c'est ce supplément que les intérêts composés génèrent. Faisons un bond de plusieurs années, et sous forme de tableau. La dernière colonne est le multiplicateur qui me simule ma possession en bourse + le réinvestissement des dividendes.

| années écoulées | investissement initial | valeur de la possession | dividende versé (multiplicateur) |
|-----------------|------------------------|-------------------------|----------------------------------|
| 0               | 100                    | 100                     | 1.05                             |
| 1               | 105                    | 100                     | 1.05                             |
| 2               | 110.25                 | 100                     | 1.05                             |
| 10              | 162.88                 | 100                     | 1.05                             |
| 30              | 432.19                 | 100                     | 1.05                             |
| 50              | 1146.74                | 100                     | 1.05                             |

La première observation est qu'avec le temps, l'investissement initial prend un valeur significative. C'est ce qu'on appelle la puissance des intérêts composés. Et le temps et la patience enrichissent les investisseurs long terme.

Observons un scénario similaire, mais dans le cas où les dividendes versées sont de 15%

| années écoulées | valeur de la possession | investissement initial | dividende versé (multiplicateur) |
|-----------------|-------------------------|------------------------|----------------------------------|
| 0               | 100                     | 100                    | 1.15                             |
| 1               | 115                     | 100                    | 1.15                             |
| 2               | 132.25                  | 100                    | 1.15                             |
| 10              | 404.56                  | 100                    | 1.15                             |
| 30              | 6621.18                 | 100                    | 1.15                             |
| 50              | 108365.74               | 100                    | 1.15                             |

La valeur de la possession grandissent plus vite. Autrement dit, *le retour sur investissement est un **accélérateur** de croissance de valeur*

## Retours sur actifs

Il est habituel qu'une entreprise souhaite s'étendre, et si possible de la même manière que les intérêts composés. Voyons dans une situation très abstraite comment cela se traduit.

Popa-pola, une boisson sucrée est rafraichissante, produite par Pop Inc, utilise une machine qui produit 100 bouteilles par jours. Et arrive à vendre toutes ses bouteilles produites.

cm = Cout de la machine : 1000€
nmd = Nombre de machine détenue : 10
pb = Production de bouteille par jour et par machine : 100 bouteilles
cp = Cout de production d'une bouteilles : 1€
cm = Cout marketing journalier : 100€
pv = Prix de vente de la bouteilles : 1,50€

L'entreprise démarre avec une seule machine. Par jour, Pop Inc reçoit un bénéfice par jour de
(nmd * pb * (pv-vp)) - cm = (10 * 100 * (1,5-1) - 100 = bénéfice de 400€

Pop Inc décide d'acheter une machine supplémentaire dès que les fonds nécessaire sont disponible. Projettons sur un tableau

| Cout machine | Nombre machine | Production journalière | Cout production | Cout marketing | Prix de vente | Bénéfice | Cash | Jours |
|--------------|----------------|------------------------|-----------------|----------------|---------------|----------|------|-------|
| 1000         | 10             | 100                    | 1               | 100            | 1,5           | 400      | 400  | 0     |
| 1000         | 10             | 100                    | 1               | 100            | 1,5           | 400      | 800  | 1     |
| 1000         | 11             | 100                    | 1               | 100            | 1,5           | 450      | 250  | 2     |
| 1000         | 11             | 100                    | 1               | 100            | 1,5           | 450      | 700  | 3     |
| 1000         | 12             | 100                    | 1               | 100            | 1,5           | 500      | 200  | 4     |
| 1000         | 12             | 100                    | 1               | 100            | 1,5           | 500      | 700  | 5     |
| 1000         | 13             | 100                    | 1               | 100            | 1,5           | 550      | 250  | 6     |
| 1000         | 13             | 100                    | 1               | 100            | 1,5           | 550      | 800  | 7     |
| 1000         | 14             | 100                    | 1               | 100            | 1,5           | 600      | 400  | 8     |
| 1000         | 14             | 100                    | 1               | 100            | 1,5           | 600      | 0    | 9     |
| 1000         | 14             | 100                    | 1               | 100            | 1,5           | 600      | 600  | 10    |
| 1000         | 15             | 100                    | 1               | 100            | 1,5           | 650      | 250  | 11    |
| 1000         | 15             | 100                    | 1               | 100            | 1,5           | 650      | 900  | 12    |
| 1000         | 16             | 100                    | 1               | 100            | 1,5           | 700      | 600  | 13    |
| 1000         | 17             | 100                    | 1               | 100            | 1,5           | 750      | 350  | 14    |
| 1000         | 17             | 100                    | 1               | 100            | 1,5           | 750      | 100  | 15    |
| 1000         | 17             | 100                    | 1               | 100            | 1,5           | 750      | 850  | 16    |
| 1000         | 18             | 100                    | 1               | 100            | 1,5           | 800      | 650  | 17    |
| 1000         | 19             | 100                    | 1               | 100            | 1,5           | 850      | 500  | 18    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 400  | 19    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 300  | 20    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 200  | 21    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 100  | 22    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 0    | 23    |
| 1000         | 20             | 100                    | 1               | 100            | 1,5           | 900      | 900  | 24    |
| 1000         | 21             | 100                    | 1               | 100            | 1,5           | 950      | 850  | 25    |

Après 25 itérations, Pop Inc a doublé la génération de bénéfice.


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

