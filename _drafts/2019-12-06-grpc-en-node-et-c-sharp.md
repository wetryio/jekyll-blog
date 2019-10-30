---
author: mscolas
layout: post
title: gRPC, sa philosophie et son dev feeling
date: 2019-12-06 07:00:00
image: '/images/grpc/grpc-integration.png'
description: Présentation de gRPC avec intégration en node & dotnet core
category: 'documentation'
tags:
- gRPC
- node
- dotnet core
- javascript
- network
introduction: gRPC, sa philosophie et son dev feeling
---

Les WEB API REST aujourd'hui sont privilégiés à tous les autres protocoles. Une base relativement simple, capable d'être load balancé, un standard éprouvé grâce à l'expérience du protocole HTTP dans la communauté de développeurs. Pas de doute, savoir construire une WEB API REST est indispensable pour le développeur moderne.

Toutefois, 2 limitations sont présente :

* La structure de requête et de réponse est relativement statique. GraphQL résout déjà cette limitation.
* Les performances network sont aujourd'hui impressionante. Mais encore insuffisant dans certains cas, nottament avec le protocole HTTP.

gRPC répond à la deuxième problématique. Il diminue le volume de donnée en transit pour améliorer les performances. De plus, il facilite l'intégration client-serveur via un système de création de librairie et un fichier unique qui définit les interfaces entre les services. Et tout ceci en faisant **abstraction des langages utilisés**. Et la liste des langages qui intègre gRPC longue :
C++, Java, Python,  Go, Ruby, C#, Node, Objective-C, PHP, Dart et le reverse-proxy Envoy.

```text
gRPC veut dire gRPC Remote Procedure Call. Le 'g' a une signification récursive.
```

## Contenu de l'article

Nous implémenterons un service simple en serveur C# et Node en se concentrant exclusivement sur gRPC. Puis nous parlerons du bénéfice qu'apporte la philosophie d'un fichier unique Protobuffer.

Nous ne visons pas à expliquer l'ensemble du protocole gRPC ainsi que son fichier protobuffer3. Certaines spécificités sont volontairement ignorées pour nous concentrer sur la production d'un service et d'un client.

## Une définition pour les gouverner tous

L'implémentation de gRPC commence avec un fichier qui définit l'interface Client-Server. Nous allons construire une application qui ajoute un Todo à une liste, et récupérer l'ensemble des Todo.

```protobuf
syntax = "proto3";

import "google/protobuf/empty.proto";

option csharp_namespace = "TodoApi";

package TodoApi;

// Définition du service. Contient deux méthodes avec un objet d'entré et un objet de sortie.
service TodoService {
    rpc AddTodo(AddTodoRequest) returns (AddTodoResponse);
    rpc GetAllTodo(google.protobuf.Empty) returns (GetAllTodoResponse);
}

// Ne vous souciez pas des nombres
message AddTodoRequest {
    string name = 1;
    string content = 2;
}

message AddTodoResponse {
    string status = 1;
    string errorMessage = 2;
}

// Repeated signifie array
message GetAllTodoResponse {
    repeated Todo todo = 1;
}

message Todo {
    string name = 1;
    string content = 2;
}
```

Ce fichier dirigera la génération du serveur dotnet et du client c#. Il contient la définition complète des méthodes du service à implémenter.

## Génération du serveur dotnet

À partir de la version 3.0, dotnet core contient le template nécessaire pour la génération du serveur. Il vous suffit de lancer `dotnet new grpc` pour générer un serveur complet. Nous remplacerons le service par défaut pour appliquer notre service.

* Dans le .csproj, remplacez le chemin du fichier profobuffer par celui que vous avez créé précédemment.
* Dans le projet, supprimez le dossier 'Protos' ainsi que le contenu de 'Services'.
* Dans le fichier `Startup.cs`, supprimez la ligne qui fait référence à `GreeterService`.

Lancez la commande `dotnet build`. Grâce à vos modifications, la dotnet a généré tous les nécessaire network pour implémenter votre service !

Créez une nouvelle classe `TodoService` qui hérite de `TodoApi.TodoService.TodoServiceBase`. A cette classe, faites un override de la méthode `AddTodo` ainsi que de `GetAllTodo`. Implémentez la logique comme bon vous semple. Un exemple est partagé sur github, le lien est en fin d'article. Pour cette démo je n'ai pas lancer de service DB, un système de fichier suffisant.

Votre serveur est prêt !

```text
Pour cette démo, j'utilise gRPC avec le protocole HTTP2. Vous devriez configurer votre serveur kestrel pour forcer le http via

webBuilder.ConfigureKestrel(serverOptions =>
{
    serverOptions.Listen(IPAddress.Any, 5001, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http2;
    });
});
```

### Tester immédiatement votre serveur sur votre browser ? Un client gRPC est nécessaire

Malheureusement, les impatients ne peuvent pas encore tester ce nouveau serveur sans client gRPC. Les requêtes et les réponses sont sérialisé pour prendre le minimum de place possible. Un client qui serialise de la manière gRPC est nécessaire pour formatter correctement les requêtes et réponses. Si vous aviez l'habitude de tester vos serveurs HTTP via postman ou directement votre navigateur, j’ai le regret de vous annoncer que nous ne le pourrez pas. Le chapitre suivant vous donne la marche à suivre.

## Génération du client node

L'un des atouts de gRPC est qu'il n'est lié à aucun langage. Dans cette démo, nous utiliserons arbitrairement nodejs comme client.

### 4 packages à installer

3 packages sont nécessaire pour notre client gRPC. Un autre est une librairie pour parser les arguments d'entré.

```ps1
npm install @grpc/grpc-js @grpc/proto-loader grpc minimist
```

## gRPC client création

Créez un fichier `get-todo-service.js` qui retourne un service prêt à l'emploi. Voici le minimum, les commentaires y sont directement intégré.

```js
// Chemin d'accès au fichier proto. Modifiez la valeur selon la position de votre fichier protobuffer.
const PROTO_PATH = __dirname  + '/../proto/todoservice.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const api = grpc.loadPackageDefinition(packageDefinition).TodoApi;
// Pour faciliter notre démo, nous n'utiliserons pas de crédential.
// Nous avions forcé le serveur gRPC d'utiliser le port 5001.
const todoService = new api.TodoService('localhost:5001', grpc.credentials.createInsecure());

module.exports = todoService;
```

## Consommer le client

Et un exemple de call:

```js
const todoService = require('./get-todo-service')

// la définition de la requête est dans le fichier proto, le message AddTodoRequest
const addTodoRequest = {name: 'FIRST', content: 'Mon premier todo'};

// L'asynchrone du gRPC s'exprime via une méthode de callback.
todoService.AddTodo(addTodoRequest, (err, resp) => {
    // La requêtes du GetAllTodo est un objet vide comme définit dans le fichier proto
    todoService.GetAllTodo({}, (error, res) => {
        console.log(res)
    });
});
```

Il ne vous reste qu'à lancer votre application via `node .\app.js` et voilà.

Un exemple mieux fournis se trouve sur [https://github.com/wetryio/grpc-publication](https://github.com/wetryio/grpc-publication)

## Protobuffer, libre de langage et principe DRY

Les web api REST offrent la documentation (swagger par exemple), des conventions via les chemins, les actions, les méthodes, les statuts HTTP, etc ... Mais la tâche n'est pas évidente. Le développeur a la responsabilité de maintenir toutes ces conventions pour la durabilité, une erreur de frappe dans la route et l'appel http ne fonctionne plus.

gRPC ignore ces contraintes en **appliquant un type et des méthodes**. Nous l'avons vu via la génération du serveur C#. Nous retrouvons cette qualité dans les langages typé fort.
Les langages typés faible comme le javascript sont capable d'implémenter gRPC. Mais nous avons grandement perdu cette qualité de typage comme cet article l'a démontré.

Une autre qualité de gRPC réside dans le fichier protobuffer. Il contient à lui seul **la définition des interfaces client-serveur**. Ni votre serveur, ni votre client doit implémenter les spécifications du protocole HTTP à la main car une source unique d'information génère le code nécessaire.

### Et les erreurs serveurs ?

Nous n'avons pas vu en détail, mais gRPC intègre lui-même le nécessaire pour la gestion d'exception et d'erreur.

* Python, C#, Java utilise le système d'exception du langage
* Go utilise les erreurs interne et un parseur de statuts
* Javascript a un paramètre d'erreur, nécessaire car la réponse est gérée en callback

Encore une fois, il n'est pas nécessaire de suivre les conventions http pour interpréter les erreurs. La gestion des exceptions du langage dirige le flow d'erreur.

## Toujours pas une balle en argent

gRPC n'est pas non plus la solution à tous les problèmes. Il propose une nouvelle manière d'interfacer les services entre eux. Là où l'architecture micro-service a une popularité forte, améliorer significativement le temps d'intégration de plusieurs clients dans plusieurs langage a du sens. Mais ne résout pas tous les autres défis liés aux autres principes du micro-service.

Il a aussi sa place dans un monde entreprise, ou les différentes équipes doivent s'échanger continuellement des informations. Proposer un fichier unique d'interface facilite le travail d'intégration.

Toutefois, les propriétés stateless des principes REST restent nécessaire pour le load-balancing. Bannissez vos variables serveurs liés à vos requêtes.

En conclusion, gRPC peut être utilisé à la place du webapi REST, mais ne remplace pas son concurrent pour autant. Il apporte sa philosophie, ses qualités et ses défauts.

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
