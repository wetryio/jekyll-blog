---
author: pgrasseels
layout: post
title: "Azure Functions démystifions le trigger HTTP"
date: 2019-10-02 12:20:00
image: '/images/azure-functions/Azure-Functions.png'
description: Azure Functions, démystifions le trigger HTTP.
category: 'blog'
tags:
- azure
- tutorial
- serverless
- trigger http
introduction: Azure Functions, démystifions le trigger HTTP.
---

# Azure Functions, démystifions le trigger HTTP

Dans l'article précédent, j'exposais les bases d'une Azure Functions, si vous ne savez pas du tout ce que c'est, je vous conseille de commencer par là [Azure Functions, les bases](/azure-functions-les-bases/).

Dans cet article, je vais démystifier le trigger HTTP, mais également montrer jusqu'où il est possible d'aller en y intégrant des principes très proches de ceux de l'ASP.NET Core. Voici dans les grandes lignes les étapes :
- Crée une Azure Functions avec Visual Studio
- Explication du code généré
- Modification pour renvoyer une valeur calculée par rapport à ce que la function aura reçu
- Binding du modèle d'entrée
- Publier sur Azure
- La sécurité

La use case que nous allons voir ici, est de réaliser une function qui prend deux nombres en paramètre et les multiplie par eux-mêmes.

## Crée une Azure Functions avec Visual Studio

### Prerequis
- Visual Studio 2017 ou Visual Studio 2019
- [Azure Functions Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs) pour Visual Studio 2017
- Avoir selectionner les Azure Development dans les feature à installer

Les images utilisées ici sont tirées de Visual Studio 2019.


#### Dans la fenêtre de création d'un Projet de Visual Studio 2019, chercher après Azure Functions.
![placeholder](/images/azure-functions/create-functions-part1.png "Azure functions")

#### Selectionner Azure Functions, ensuite Next / Suivant.
![placeholder](/images/azure-functions/create-functions-part2.png "Azure functions")

#### Il faut encoder le nom du projet, ici SampleFunction, ensuite la Location (emplacement sur le disque) et pour finir le nom de la solution.
![placeholder](/images/azure-functions/create-functions-part3.png "Azure functions")

#### La fenêtre suivante est très intéressante, elle va permettre de paramétrer la function, pour cet article, c'est un Trigger Http qu'il faut selectionner, en Storage Account le Storage Emulator et en Authorization sélectionner Anonymous. C'est l'étape principale qui permet de scalffoder les projets. Selon la sélection faite, Visual Studio va ajouter des packages différents. Mais également paramétrer l'entrypoint de la function différement.
![placeholder](/images/azure-functions/create-functions-part4.png "Azure functions")

#### Après avoir cliqué sur Create, le projet avec une Azure Functions est générée par Visual Studio.
![placeholder](/images/azure-functions/create-functions-part5.png "Azure functions")

## Explication du code généré
Le code généré à la base ressemble à ceci

```csharp
public static class Function1
    {
        [FunctionName("Function1")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string name = req.Query["name"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            name = name ?? data?.name;

            return name != null
                ? (ActionResult)new OkObjectResult($"Hello, {name}")
                : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
        }
    }
```

Découpons un peu ce code pour en comprendre les bases, commençons par le point d'entrée de la function.

```csharp
[FunctionName("Function1")]
public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log)
```
Le point d'entrée, Run a un attribut FunctionName avec en paramètrer le nom de la function.
Le premier paramètre de Run est le type de trigger, ici c'est un trigger du type Httptrigger.
Ce même HttpTrigger, à plusieurs paramètres;
- AuthorizationLevel.Function : c'est le niveau de sécurité que la Function nécessite, une explication est disponible à ce propos en bas d'article
- "get", "post" : le type de verb HTTP qui est supporter par la Function
- Route = null : par défaut, l'URL d'une Functions est https://monhostnameazure/NomDeLaFunction, le paramètre route ici permet de modifier cette règle


Le reste de la function c'est du code C# comme en ASPNET Core, en Console, etc ... Mais c'est ce code, qui sera exécuté et qui vas permettre de renvoyer ou non une valeur.
Dans le sample de base, la Function attend en query params ou body, une valeur sur la clé Name. Ensuite, elle renvoit soit une HTTP 200 avec le nom concaténer avec Hello, soit une 400 si ni le body, ni la query ne contient de valeur pour Name.

```csharp
log.LogInformation("C# HTTP trigger function processed a request.");
string name = req.Query["name"];

string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
dynamic data = JsonConvert.DeserializeObject(requestBody);
name = name ?? data?.name;

return name != null
        ? (ActionResult)new OkObjectResult($"Hello, {name}")
        : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
```


La partie suivante s'occupe de parser la query / body
```csharp
string name = req.Query["name"];

string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
dynamic data = JsonConvert.DeserializeObject(requestBody);
name = name ?? data?.name;
```


Et cette partie-ci, de renvoyer un résultat au standard HTTP.
```csharp
return name != null
        ? (ActionResult)new OkObjectResult($"Hello, {name}")
        : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
```


## Écrire sa première Azure Functions
Ici, on rentre dans notre usecase, comme dis au début nous allons envoyer deux nombres à notre Azure Fonction et les multiplier par eux-mêmes.

Première étape, on va modifier le nom de notre function. On va donc remplacer Function1 par Multiplicator.
À deux endroits, le nom de la classe est dans l'attribut [FunctionName]. Et supprimer tout ce qu'on n'a pas besoin.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(0);
    }
}
```

Étape suivante, on va écrire une function (normale) qui va multiplier deux nombres.
```csharp
private static int MultiplyNumber(int a, int b)
{
    return a * b;
}
```

La prochaine étape sera de tester que la function tourne et renvois bien un résultat attendus.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(MultiplyNumber(2, 2));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

#### Pour tester, F5 lance en Debug ou Release selon ce qui est sélectionné. La première fois, il est possible que cela prenne un certain temps, notamment pour que l'azure Emulator se lance.
![placeholder](/images/azure-functions/launch-functions-part.png "Azure functions")

#### Si tout c'est bien passer, un invite de commande vas se lancer et ressemble à ceci.
![placeholder](/images/azure-functions/launch-functions-part2.png "Azure functions")

#### Et la partie la plus important se trouve tout en bas.
![placeholder](/images/azure-functions/launch-functions-part3.png "Azure functions")

L'URL suivante expose la Azure Functions.
```
http://localhost:7071/api/Multiplicator
```

L'URL a testé dans un browser, donnera le résultat suivant.
```
4
```

## Binding du modèle d'entrée
Dans l'étape précédente, les valeurs multipliées étaient connues et statices. Dans cette l'étape le but est de binder soit dans la query, la route ou le body(POST).

### Le route binding
Le binding dans la route permet de lier aisément un paramètre de la route dans un paramètre de la Azure Function.
Pour cela, il faut modifier le paramètre route de la méthode Run.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multiplicator/{a}/{b}")] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(MultiplyNumber(2, 2));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

La modification au dessus, vas modifier la route, si la Azure functions est relancer (F5), elle aura une nouvelle URL.
Dans HttpTrigger, le paramètre Route définis donc le points d'entrée de la function, ajouter des valeurs entre acolade crée des valeurs dynamique.
```
http://localhost:7071/api/Multiplicator/{a}/{b}
```
![placeholder](/images/azure-functions/launch-functions-part4.png "Azure functions")

La prochaine modification, va permettre de lier les valeurs de la route, a des paramètres de la Azure Functions.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multiplicator/{a}/{b}")] HttpRequest req,
        [FromRoute]int a,
        [FromRoute]int b,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(MultiplyNumber(2, 2));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

Après le paramètre HttpRequest, deux autres sont ajoutés et permets cette liaison.
```csharp
[FromRoute]int a
[FromRoute]int b
```

Dernière étape pour le binding par la route, utiliser les valeurs dans l'appel de la méthode qui multiplie les nombres.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multiplicator/{a}/{b}")] HttpRequest req,
        [FromRoute]int a,
        [FromRoute]int b,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(MultiplyNumber(a, b));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

### Le query params binding
Il n'existe pas de manière de lier directement un paramètre en Query params à un paramètre de l'Azure functions, pour lire ce type d'input il faut utiliser la request.
```csharp
public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
        ILogger log)
    {
        int a = int.Parse(req.Query["a"]);
        int b = int.Parse(req.Query["b"]);

        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(MultiplyNumber(a, b));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

Les deux lignes suivantes, lisent les contenus du paramètre de la query selon la clé et sont converties en Int avec un parse.
```csharp
int a = int.Parse(req.Query["a"]);
int b = int.Parse(req.Query["b"]);
```

### Le body binding
Il existe plusieurs moyens de binder sur le body, ici la méthode la plus simple sera utilisée. Elle consiste à lire le body de la requête, ensuite désérialiser les contenus Json.
```csharp
public class InputMultiplicator
{
    public int A { get; set; }
    public int B { get; set; }
}

public static class Multiplicator
{
    [FunctionName("Multiplicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");

        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var model = JsonConvert.DeserializeObject<InputMultiplicator>(requestBody);

        return (ActionResult)new OkObjectResult(MultiplyNumber(model.A, model.B));
    }

    private static int MultiplyNumber(int a, int b)
    {
        return a * b;
    }
}
```

Niveau URL, elle sera à nouveau simplifiée car le paramètre routé est redevenu null
```
http://localhost:7071/api/Multiplicator
```

Il faudras cependant passer en POST avec un Body
```json
{
    "a": 10,
    "b": 2
}
```

## Publier sur Azure
La dernière étape est de rendre la Azure Function utilisable sur le cloud Azure.
Pour cela dans Visual Studio, clique droit sur le projet, ensuite Publish.

#### Clique droit sur le projet qui doit être publié.
![placeholder](/images/azure-functions/publish-functions-part1.png "Azure functions")

#### Une nouvelle fenêtre va s'ouvrir, le bouton Start va permettre de configurer le déploiement.
![placeholder](/images/azure-functions/publish-functions-part2.png "Azure functions")

#### Ici, le déploiement se fera sur un consumption Plan. La fenêtre suivante va permettre de configurer la région, le nom, etc ...
![placeholder](/images/azure-functions/publish-functions-part3.png "Azure functions")

#### Les informations du déploiement se font ici.
![placeholder](/images/azure-functions/publish-functions-part4.png "Azure functions")

Le bouton Create en bas à droite va créé un profil de publication réutilisable.
Ensuite, une autre fenêtre va s'ouvrir avec un bouton Publier, en cliquant dessus, Visual Studio, va publier la function sur azure.

## La sécurité
Niveau sécurité, Azure propose plusieurs niveaux d'authentification, un Anonymous qui ne demande rien de plus et 3 autres Function, Admin & System qui nécessitent une clé pour autoriser l'accès à la function.

Il existe trois type de clés :
- **Host keys** : Les clés de ce type peuvent s'utiliser de façons cross function dans la même Function App.
- **Function keys** : Les clés de ce type ne peuvent s'utiliser que sur la function sur laquelle la clé à été définie.
- **Master key** : Chaque Function App définis une master key (_master) qui donne un accès Admin sur toutes les function de l'app.

### Anonymous
Ne requière aucune authentification, toute requête HTTP valide sera interceptée.

### Function
Requière une clé d'authentification, ici la **Host Key** ou la **Function Key**. 
Pour la function **Function Key** celle-ci devra être définie sur la function qu'on souhaite appeler. 
Si la clé est invalide, c'est une HTTP  401 qui est renvoyée.

### Admin
Requière une clé d'authentification, ici la **Host Key** sera nécessaire.
Si la clé est invalide, c'est une HTTP  401 qui est renvoyée.

### System
Requière une clé d'authentification, ici la **Master key** sera nécessaire. La clé master ne peut pas être révokée.
Si la clé est invalide, c'est une HTTP  401 qui est renvoyée.
