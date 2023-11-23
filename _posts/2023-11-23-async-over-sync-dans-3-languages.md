---
date: 2023-11-23 20:03:12
layout: post
title: "async over sync dans 3 languages"
subtitle:
description:
image:
optimized_image:
category:
tags:
author:
---


## Dotnet et Thread Pool Starvation

Lors d'une investigation sur des problèmes des performance (surtout mené par un collègue qui se reconnaitra), il nous a été mené de comprendre mieux un problème connu en dotnet sous le nom de 'Thread Pool Starvation'. Un nom que nous rencontrons de temps en temps en parcourant la littérature, mais dont nous n'avions pas de compréhension fine de ce que ça signifie. Et surtout la (mal) chance pour laquelle je ne l'ai pas rencontré auparavent, ou plutôt je n'ai pas pu l'observer dans un environnement controllé dans un cde de sample.

Nous allons présenter le problème, les conséquences, et mesurer les performances d'une application dans 2 autres languages connus pour gérer efficacement la concurrence.

Tous les exemples tournent sur un macbook pro avec un processeur 2,3 GHz 8-Core Intel Core i9. Le code n'est pas écrite pour avoir une précision fine, mais pour avoir un ordre de grandeur significatif.

## Le code

Voici le code qu'il m'arrivait de tester pour comprendre comment fonctionne les tasks quand le contenu est *synchrone* 

```csharp
const int count = 10;

var start = DateTime.Now;
for (var i = 0; i < count; i++)
{
    var id = i.ToString();
    allTasks.Add(Task.Run(() =>
    {
        // ceci est synchrone. Pas de Task.Delay();
        Thread.Sleep(1000);
    }));
}

await Task.WhenAll(allTasks);
var elapsed = DateTime.Now.Subtract(start);

System.Console.WriteLine($"elapsed time {elapsed}");
```

Le résultat n'est pas surprenant : 1sec07. Nice.

Maintenant, le même programme, mais cette fois avec count = 200. Aurions-nous approximativement 1sec04 ?

```csharp
const int count = 200;

var start = DateTime.Now;
for (var i = 0; i < count; i++)
{
    var id = i.ToString();
    allTasks.Add(Task.Run(() =>
    {
        Thread.Sleep(1000);
    }));
}

await Task.WhenAll(allTasks);
var elapsed = DateTime.Now.Subtract(start);

System.Console.WriteLine($"elapsed time {elapsed}");
```

Le process a duré 12 secondes. Hugh. 

## Le problème

Lorsqu'une des tasks s'exécute, il lance un Thread.Sleep. Cette exécution synchrone donne l'instruction a un thread de dormir. Comme cette exécution est dans un thread, il donne place au ThreadScheduler de faire tourner le reste du code dans un autre thread de son pool. *Pool dont le nombre de thread est limité*. Dans la première version du code, cette limite n'est pas atteinte. Ainsi, nous pouvons observer que le code prend un peu plus que 1 secondes. Toutes les Tasks ont été distribués dans un Thread. Mais dans la seconde version, celle qui tente de faire tourner 200 tasks en concurrence, il n'y a pas assez de thread dans le pool pour tous les traiter tous en même temps. Ainsi, il faut attendre que les Thread de exécutant les premières Tasks synchrone termine pour exécuter les suivants. Voilà ce qu'est le Thread Pool Starvation.

Lancer un Task.Run() sur du code synchrone permet toujours de lancer du code en concurrence, tant qu'il y a des thread disponible, tout va bien.
C'est pourquoi il est très important de *favoriser les exécutions asynchrone de bout en bout*

## En go et en elixir

Mes proches le savent, j'adore golang. Allons faire un code similaire, pour faire tourner 200 et 100 000 fois un code sychrone, mais dans une exécution asynchrone. Vous trouverez le code [ici](https://github.com/worming004/async-over-sync-languages/blob/master/go/main.go). Aussi, le language elixir, qui s'éxécute dans une machine virtuelle erlang, promet aussi une facilité de la gestion de la concurrence. Sans être fluent dans ce language, l'implémentation, suffit à mettre en avant que le Thread Pool Starvation n'est pas un problème existant. Le code est [ici](https://github.com/worming004/async-over-sync-languages/tree/master/elixir_example/lib). Notez que pour le tableau ci-dessous, la comparaison des performances pour le code dotnet se fait avec la version [ici](https://github.com/worming004/async-over-sync-languages/blob/master/csharp/Program.cs).

| nombre de loop | go      | elixir | csharp  |
|----------------|---------|--------|---------|
| 200            | 1,0019s | 1,002s | 12,069s | 
| 10 000         | 1,0605s | 1,104s | 3min47  |

## Dotnet et l'asynchrone partout

Comme l'annonce la doc et les bonnes pratiques, l'asynchrone en dotnet est virale. Il est nécessaire de l'appliquer de bout en bout pour éviter le problème cité ci-dessus.

```csharp
var count = 200;
var allTasks = new List<Task>();

var start = DateTime.Now;
for (var i = 0; i < count; i++)
{
    // async -> async -> sync -> async
    var t = Task.Run(async () =>
    {
        await Task.Run(() =>
        {
            Task.Run(async () =>
            {
                await Task.Delay(1000);
            }).Wait();
        });
    });
    allTasks.Add(t);
}

await Task.WhenAll(allTasks);
var elapsed = DateTime.Now.Subtract(start);
System.Console.WriteLine($"(async -> async -> sync -> async) elapsed time {elapsed}"); //+-25s

allTasks = new List<Task>();
start = DateTime.Now;
for (var i = 0; i < count; i++)
{
    // async -> async -> async -> async
    var t = Task.Run(async () =>
    {
        await Task.Run(async () =>
        {
            await Task.Run(async () =>
            {
                await Task.Delay(1000);
            });
        });
    });
    allTasks.Add(t);
}
elapsed = DateTime.Now.Subtract(start);
System.Console.WriteLine($"(async -> async -> async -> async) elapsed time {elapsed}"); // presquest instantané
```

## Conclusion

Bien sur, cette expérience est sizé spécifiquement pour montrer une limitation du runtime dotnet. Il est important de garder à l'esprit que chaque language et runtime viennent avec leurs lots de qualités et de défauts. Respectez la viralité de l'asynchrone de bout en bout pour garantir les meilleures performances de vos applications.

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

