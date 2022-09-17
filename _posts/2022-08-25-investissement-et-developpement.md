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

“Understanding both the power of compound interest and the difficulty of getting it is the heart and soul of understanding a lot of things.” (Charlie Munger)

"Comprendre à la fois le pouvoir de l'intérêt composé et la difficulté de l'obtenir est le cœur et l'âme de la compréhension de beaucoup de choses."

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

| années écoulées | valeur de la possession | investissement initial| dividende versé (multiplicateur) |
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

Popa-pola, une boisson sucrée est rafraichissante, produite par Pop Inc, utilise une machine qui produit 100 bouteilles par jours. Et vent immédiatement toutes ses bouteilles produites.

cm = Cout de la machine : 1000€
nmd = Nombre de machine détenue : 10
ce = cout d'entretien par machine
pb = Production de bouteille par jour et par machine : 100 bouteilles
cp = Cout de production d'une bouteilles : 1€
cm = Cout marketing journalier : 100€
pv = Prix de vente de la bouteilles : 1,50€

L'entreprise démarre avec une seule machine. Par jour, Pop Inc reçoit un bénéfice par jour de
(nmd * pb * (pv-vp-ce)) - cm = (10 * 100 * (1,5-1) - 100 = bénéfice de 400€

Pop Inc décide d'acheter une machine supplémentaire dès que les fonds nécessaire sont disponible. Projettons sur un tableau


| Cout machine | Nombre de machine | Entretien machine | Production journalière | Cout production | Cout marketing | Prix de vente | Bénéfices | Cash en réserve | Jours |
|--------------|-------------------|-------------------|------------------------|-----------------|----------------|---------------|----------|-----------------|-------|
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 100             | 0     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 200             | 1     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 300             | 2     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 400             | 3     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 500             | 4     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 600             | 5     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 700             | 6     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 800             | 7     |
| 1000         | 10                | 0.3               | 100                    | 1               | 100            | 1.5           | **100**  | 900             | 8     |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 20              | 9     |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 140             | 10    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 260             | 11    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 380             | 12    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 500             | 13    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 620             | 14    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 740             | 15    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 860             | 16    |
| 1000         | 11                | 0.3               | 100                    | 1               | 100            | 1.5           | **120**  | 980             | 17    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 120             | 18    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 260             | 19    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 400             | 20    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 540             | 21    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 680             | 22    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 820             | 23    |
| 1000         | 12                | 0.3               | 100                    | 1               | 100            | 1.5           | **140**  | 960             | 24    |
| 1000         | 13                | 0.3               | 100                    | 1               | 100            | 1.5           | **160**  | 120             | 25    |


Après 25 itérations, Pop Inc génère 60% plus de bénéfice. En tant qu'investisseur, ce sont ces entreprises que nous recherchons, où le cash généré sert à générer plus de cash.

## Traduire pour le développement d'un produit

Remplaçons les tag de l'exemple fictif. Au lieu d'avoir des machines qui produisent des biens, nous avons des développeurs produisant un SaaS.

(bien sur nous nous sommes plus que des machines. Mais d'un point de vue production, nous pouvons modéliser très simplement comme ceci)

| Cout onboarding | Nombre de développeur | Salaire développeur | Production mensuelle | Cout d'entretien des serveurs | Cout marketing | Prix des features | Bénéfices | Cash en réserve | Jours |
|-----------------|-----------------------|---------------------|----------------------|-------------------------------|----------------|-------------------|----------|-----------------|-------|
| 1000            | 10                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **100**  | 100             | 0     |
| 1000            | 10                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **100**  | 200             | 1     |
| 1000            | 10                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **100**  | 300             | 2     |
| 1000            | 10                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **100**  | 400             | 3     |
| 1000            | 10                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **100**  | 500             | 4     |
| 1000            | 13                    | 0.3                 | 100                  | 1                             | 100            | 1.5               | **160**  | 120             | 25    |

Cet exemple ignore encore des tas de couts cachés. J'ignore volontairement qu'ajouter un développeur ajoute de l'overhead, que le cout en espace de travail augmente, etc ... mais restons simple.
Aussi, et nous verrons que ce modèle est trop simplifié pour une entreprise informatique. Chaque développeur ne produit pas 1 unique bien qui sera vendu à 1 personne, mais une feature qui sera vendu continuellement a une foule de personnes.

Ce que je désire mettre en évidence, est qu'un développeur productif le plus vite possible permet d'accélérer cet effet d'intérêt composés. Diminuez d'un tout petit peu le salaire des développeurs, ou bien augmenter la production permet de faire des gains colossaux supplémentaire sur le long terme.

J'espère que cet idée d'intérêt composés, est maintenant clair pour vous. Nous allons tirer 2 conclusions à partir de ce modèle.
Le premier va expliquer que chaque feature développé n'est pas vendu 1 fois, mais sera constamment via un abonnement par exemple, ou une nouvelle version d'un produit. Nous verrons que l'effet composés permet à une entreprise informatique de générer beaucoup de cash sur le long terme
La deuxième conclusion va s'appuyer à la fois sur la conclusion 1, ainsi que les tableaux précédent. Nous essayerons de démontrer pourquoi les entreprises sont prêtes à dépenser des salaires énormes pour les meilleurs développeurs.

## Un développeur produit une machine qui crée de l'argent tous les jours

Pop Inc désire créer un SaaS formidable. La meilleure todo list qui soit.
L'entreprise décide d'employer 10 développeurs. Les développeurs se mettent à la tâche, et après un premier sprint, la première version du produit sort, est prête, et mise sur le marché.
Les premiers clients arrivent et paient un abonnement mensuel. Cet abonnement mensuel est suffisant pour payer les développeurs, les différents couts, etc ... De plus, un petit bénéfice est mis en place.

L'entreprise répète les sprints, engagent plus de développeurs. Et ceci pendant des années. L'entreprise prospère, croit, génère de plus en plus de bénéfice.
Puis un jour, le produit n'attire plus de nouveau client. Ajouter des features ne suffisent plus. Le produit a atteint en quelque sorte le sommum de sa capacité à attirer des clients.

En excluant toute morale et politique pour cet exemple, une solution pour maximiser les gains de l'entreprise peut-être de virer tous les développeurs, ne gardant que les opérations en place.
(Re-rappel, restons sur un exemple simple pour démontrer une idée. Une vrai entreprise, même sans morale aura sans doute fait d'autres choix, ou peut-être fera-t-elle une restructuration)
Ainsi, l'entreprise continue à générer du cash, malgrès l'absence de développeur.

Ceci diffère énormément de l'exemple des machines des paragraphes précédent. Avant Pop Inc avait besoin de machines continuellement pour créer des biens, et faire son bénéfice. Ici, **en l'absence de développeur, l'entreprise continue à être profitable**.
Autrement modelée, un développeur a créé pendant sa carrière une machine qui génère de l'argent.

Ceci est pour moi la justification du salaire très élevé d'un développeur. **Il est payé du premier au dernier jour pour le bénéfiche que l'entreprise fera pendant sa future absence, ainsi que sont temps à créer de la nouvelle valeur**

## Un développeur apporte une valeur énorme sur le long terme, son salaire doit-être à la hauteur ?

Je pense que tout le monde à entendu un jour que les développeurs ont un salaire sensiblement supérieur à la moyenne. Toutefois, et j'espère ne pas me tromper, mais **je pense que les excellents développeurs ont un salaire au dessus de la moyenne**
Essayons maintenant de définir un excellent développeur via le modèle décrit dans cet article.

Considérons un développeur n'ayant pas attrait à créer des solutions long terme. Chaque fois qu'il crée 1 nouvelle feature, la feature précédente est cassée. Il est incapable de produire du code avec un couplement faible, il n'écrit pas de tests permettant de s'assurer la pérennités du produit.
Malheureusement, ce développeur ne crée pas une machine capable de générer du cash sans lui. Pop Inc a toujours besoin de ses services pour réparer la plateforme. Bref, tout le temps qu'il dépense à faire du bugfix **l'empêche d'atteindre la grande valeur qu'un développeur puisse offrir : créer un produit capable de générer du cash sans son implication**

Considérons un second développeur, ayant toujours pour objectif de construire un système robuste. Chaque feature est suffisamment découplé du reste du système pour ne pas risquer d'avoir de bugs. Les tests qu'il écrit sont pertinent, appliqués sur les bonnes couches lui permettant un refactoring libre et en sécurité.
Heureseument, ce développeur crée une machine capable de générer du cash sans lui. Pop Inc le remercie d'améliorer la plateforme avec des nouvelles features permettant d'attirer de plus en plus de client, et peut-être même augmenter les prix au fur et à mesure que la qualité de la plateforme s'améliore. Tous son temps est **dédié à créer de la valeur pour l'entreprise, valeur qui se cumulent**

La différence notable entre ces deux développeurs, et que le premier crée un bien. Chaque fois qu'il développe, la nouvelles feature ne se vend que dans un scope réduit. La perte de la qualité fait fuire les clients, empêchant Pop Inc de cumuler les abonnements. La valeur qu'il apporte à l'entreprise est linéaire.
Le second développeur crée un système qui génère de plus en plus de cash. La valeur qu'il apporte à l'entreprise est exponentielle.
Toutefois une note, puisque le premier développeur génère quand même un bénéfice permettant d'engager d'autres développeurs, sont implications est en réalité exponentielle, disont avec un ratio x^2. Mais le second développeur à lui en réalité une évolution exponentielle x^x^2

Le second permettra de générer un montant de cash colossal **sur le long terme**. C'est exactement ce point là qui justifie le salaire colossal des meilleurs développeurs d'entre nous. Celui capable de créer de plus en plus de cash de manière exponentielle.
C'est de cette façon que je suis persuadé que les entreprises informatiques ont un intérêt énorme à pouvoir détecter, attirer et conserver les talents. Car ce sont eux qui vont (entre autre) diriger la croissance d'une entreprise vers les sommets que nous voyons dans les journaux.

### Note de fin

Bien sur, j'utilise ici des modèles hyper simplifiées. Rien n'est vrai dans l'absolu, car tout ce que j'utilise une présentation qui ne sert qu'à démontrer mes idées. Bien sur dans le monde réel, beaucoup plus de facteurs sont à intégré.
Toutefois, je reste persuadé que la valeur apporté par un développeur compétent apportent une différence significative au développeurs ayant encore à apprendre.

J'utilise aussi cette idée d'effet composés pour motiver les plus jeunes à se former. Car toute connaissance apprise servira toute sa carrière. Si ceci lui permet d'être plus efficace, il pourra se permettre de gagner du temps et d'apprendre plus, et ainsi engager cette effet boule de neige de qualité de production. J'espère que cet article vous motivera à prendre le temps de vous former, vous permettant à votre entreprise de mieux prospérer. Et réciproquement profiter d'une carrière dont vous seriez fier, ou profiter du temps gagner pour passer plus de temps avec votre famille.

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

