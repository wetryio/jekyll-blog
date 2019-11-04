---
author: mscolas
layout: post
title: L'injection de dépendance au build
date: 2019-10-25 07:00:00
image: '/images/go/go-wire.png'
description: go propose une manière bien à elle de fournir un système d'injection de dépendance
category: 'documentation'
tags:
- go
- injection de dépendance
- wire
introduction: L'injection de dépendance au build
---

# Wire pour créer l'injection de dépendance pendant le build

Le langage go [gagne de la popularité d'année en année.](https://www.tiobe.com/tiobe-index/go/) et a atteint [la pente de l’illumination](https://fr.wikipedia.org/wiki/Cycle_du_hype). Avec sa volonté d'être simple, performant et scalable, la communauté de développeurs s'intéresse à ce langage moderne made in Google.

Pour s'aider dans le principe d'Inversion of Controls, Go a deux librairies populaires qui remplissent le même objectif avec la même méthode: construire un container et le résoudre pendant le runtime. Voyez vous-même [inject de Facebook](https://github.com/facebookarchive/inject) ou bien [dig](https://github.com/uber-go/dig). Cette méthode est aussi populaire dans le monde C#.

Google Cloud propose une autre solution pour définir le graphe d'injection de dépendance. L'inversion des contrôles se fait pendant ou avant le build. Voici Wire en action.

## Un article court

L'objectif de cette publication est de montrer une alternative aux méthodes habituelles d'injection de dépendances. Nous n'explorerons pas la librairie Wire en profondeur. Si vous voulez avoir des exemples plus poussés de cette librairie, n'hésitez pas à le demander en commentaire.

```
Tip: ce post est créé depuis ubuntu avec go 1.13. Il a été testé sur windows 10 avec aussi go 1.13.
```

## Un exemple simple

Débutons par un exemple simple, nous verrons par la suite quels sont les avantages de cette librairie.

```go
type TodoRepository interface {
    Save(todo Todo) error
    Get(todoName string) (Todo, error)
}

type TodoFileRepository struct {

}

func NewTodoRepository() TodoRepository {
    return TodoFileRepository{}
}



func (repo TodoFileRepository) Save(todo Todo) error {
    // [...]
}

func (repo TodoFileRepository) Get(todoName string) (Todo, error) {
    // [...]
}

// ...

type TodoService struct {
    repository TodoRepository
}

func NewTodoService(repo TodoRepository) TodoService {
    return TodoService{repository: repo}
}
```

Rien d'extraordinaire, deux types contenant ses dépendances simples. Et chacun son _constructeur_.

## Wire fait son entrée

Téléchargez la librairie wire via la commande `go get github.com/google/wire/cmd/wire`. Ceci installera une application cli pour créer notre injection de dépendance **avant le build.**

Si vous rencontrez des problèmes d'installation, je vous redirige vers [le github officiel](https://github.com/google/wire).

### implémentation du wire build

Dans le même package, ajoutez un fichier `wire.go` avec ceci:

```go
//+build wireinject

package main

import (
    "github.com/google/wire"
)

func BuildTodoService() TodoService {
    wire.Build(NewTodoRepository, NewTodoService)
    return TodoService{}
}
```

```
N'omettez pas la première ligne //+build wireinject.
Elle indique au compilateur d'ignorer ce fichier. Respectez sa position et la ligne vide.
```

Exécutez la commande `wire`. Un nouveau fichier est créé. Observons le contenu :

```go
// Code generated by Wire. DO NOT EDIT.

//go:generate wire
//+build !wireinject

package main

// Injectors from wire.go:

func BuildTodoService() TodoService {
    todoRepository := NewTodoRepository()
    todoService := NewTodoService(todoRepository)
    return todoService
}
```

Magnifique ! Ce nouveau fichier contient toute la logique pour créer un TodoService avec l'arbre de dépendance en entier. Elle contient une méthode avec la même signature que celle contenue dans `wire.go` créé précédemment.

## Pourquoi une autre manière d'injecter les dépendances ?

Selon les [avantages avancés par Google](https://blog.golang.org/wire), nous recevons :

* Facilite le debug car le code est straight-forward. Débugguer la résolution de dépendance évaluée au run-time est complexe à suivre.
* Utilise les types pour évaluer les résolutions. Pas de confusion possible.
* Appelle le strict nécessaire. L'écriture dans la méthode générée opère un tree-shaking.
* Ajoute de la clarté dans le code. Ceci permet à certains outils de mieux manier le code.

Personnellement, cette solution élégante pour les raisons suivantes :

* Nous conservons la facilité d'écrire de nouvelles injections avec peu de code. Pour chaque nouvelle dépendance, peu de nouvelles lignes de code est nécessaire.
* Le résultat a une lecture fabuleuse : la méthode générée contient tout le l'essentiel pour connaitre toutes les dépendances.
* L'évolution des dépendances est lisible à travers le temps. Regardez l'historique git du fichier généré et vous aurez toutes les informations nécessaires à vos besoins sans devoir compiler et exécuter.

### Un peu plus sur la librairie

L'exemple ci-dessus est volontairement léger. Beaucoup d'autres outils intégrés à wire permettent de gérer différents problèmes récurrents. J'utilise les Sets pour regrouper par package la déclaration des contructeurs par exemple. Je vous invite à lire la documentation officielle à ce sujet.

Retrouvez le code de l'article [ici](https://github.com/wetryio/todowireblog).

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