---
author: pgrasseels
layout: post
title: "Azure Functions démystifions le trigger HTTP"
date: 2019-08-17 14:12:19
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

Dans l'article précédent, j'exposais les bases d'une Azure Functions, si vous ne savez pas du tout ce que c'est, je vous conseil de commencer par là [Azure Functions, les bases](/azure-functions-les-bases/).

Dans cet article, je vais démystifier le trigger HTTP, mais également montrer jusqu'où il est possible d'aller en y intégrant des principes très proches de ceux de l'ASP.NET Core. Voici dans les grandes lignes les étapes :
- Crée une Azure Functions avec Visual Studio
- Explication du code généré
- Modification pour renvoyer une valeur calculée par rapport à ce que la function aura reçu
- Binding du modèle d'entrée
- Publier sur Azure
- La sécurité

La use case que nous allons voir ici, est de réalisé une function qui prends deux nombre en paramètre et les multiplie par eux même.

## Crée une Azure Functions avec Visual Studio

### Prerequis
- Visual Studio 2017 ou Visual Studio 2019
- [Azure Functions Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs) pour Visual Studio 2017
- Avoir selectionner les Azure Development dans les feature à installer

Les images utilisé ici sont tiré de Visual Studio 2019.


#### Dans la fenetre de création d'un Project de Visual Studio 2019, chercher après Azure Functions.
![placeholder](/images/azure-functions/create-functions-part1.png "Azure functions")

#### Selectionner Azure Functions, ensuite Next / Suivant.
![placeholder](/images/azure-functions/create-functions-part2.png "Azure functions")

#### La, il faut encoder le nom du projet, ici SampleFunction, ensuite la Location et pour finir le nom de la solution.
![placeholder](/images/azure-functions/create-functions-part3.png "Azure functions")

#### La fenetre suivante est très intéressante, elle vas permettre de paramétrer la function, pour cet article, c'est un Trigger Http qu'il faut selectionner, en Storage Account le Storage Emulator et en Authorization selectionner Anonymous. C'est l'étape principale qui permets de scalffoder les projets. Selon la selection faite, Visual Studio vas ajouter des packages différents. Mais également paramétrer l'entrypoint de la function différement.
![placeholder](/images/azure-functions/create-functions-part4.png "Azure functions")

#### Après avoir cliquer sur Create, le projet avec une Azure Functions est générer par Visual Studio.
![placeholder](/images/azure-functions/create-functions-part5.png "Azure functions")

## Explication du code généré
La code générer a la base ressemble à ceci 

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
Découpons un peu ce code pour en comprendre les bases, commençont par le point d'entrée de la function.

```csharp
[FunctionName("Function1")]
public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log)
```


Le reste de la function c'est du code C# comme on peux en faire en ASPNET Core, en Console, etc ... rien de bien sorcier. Mais c'est ce code, qui sera exécuter et qui vas permettre de renvoyer ou non une valeur.
Dans le sample de base, on attends en query params ou body, une valeur sur la clé name. Ensuite, on renvois soit une HTTP 200 avec le nom concaténer avec Hello, soit une 400 si ni le body, ni la query ne contient de valeur pour Name.

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


Et cette partie ci, de renvoyer un résultats au standard HTTP.
```csharp
return name != null
        ? (ActionResult)new OkObjectResult($"Hello, {name}")
        : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
```


## Ecrire sa première Azure Functions
Ici, on rentre dans notre use case, comme dis au début nous allons envoyer deux nombre a notre Azure Functions et les multiplier par eux même.

Première étape, on vas modifier le nom de notre function. On vas donc remplacer Function1 par Multipicator. 
A deux endroit, le nom de la classe et dans l'attribut [FunctionName]. Et supprimer tout ce qu'on a pas besoin.
```csharp
public static class Multipicator
{
    [FunctionName("Multipicator")]
    public static async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return (ActionResult)new OkObjectResult(0);
    }
}
```

Etape suivante, on vas écrire une function (normale) qui vas multiplier deux nombre.
```csharp
private static int MultiplyNumber(int a, int b)
{
    return a * b;
}
```

La prochaine étape sera de tester que la function tourne et renvois bien un résultat attendus.
```csharp
public static class Multipicator
{
    [FunctionName("Multipicator")]
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

#### Pour tester, F5 vas lancer en Debug ou Release selon ce qui est selectionner. La première fois, il est possible que cela prenne un certains temps, notament pour que le Azure Emulator se lance.
![placeholder](/images/azure-functions/launch-functions-part.png "Azure functions")

#### Si tout c'est bien passer, un invite de commande vas se lancer et ressemble à ceci.
![placeholder](/images/azure-functions/launch-functions-part2.png "Azure functions")

#### Et la partie la plus important se trouve tout en bas.
![placeholder](/images/azure-functions/launch-functions-part3.png "Azure functions")

Dans mon cas, l'url suivante expose la Azure Functions.
```
http://localhost:7071/api/Multipicator
```

Si l'url est tester dans un browser, le résultat attendus devrais être le suivant.
```
4
```

## Binding du modèle d'entrée
Dans l'étape précédente, les valeurs multiplier étaient connues et static. Dans cette l'étape le but est de binder soit dans la Query, la Route ou le Body(POST).

### Le route binding
Le binding dans la route permets de lier aisément un paramètre de la route dans un paramètre de la Azure Function.
Pour cela, il faut modifier le paramètre route de la méthode Run.
```csharp
public static class Multipicator
{
    [FunctionName("Multipicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multipicator/{a}/{b}")] HttpRequest req,
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
http://localhost:7071/api/Multipicator/{a}/{b}
```
![placeholder](/images/azure-functions/launch-functions-part4.png "Azure functions")

La prochaine modification, vas permettre de lier les valeurs de la route, a des paramètres de la Azure Functions.
```csharp
public static class Multipicator
{
    [FunctionName("Multipicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multipicator/{a}/{b}")] HttpRequest req,
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

Après la paramètre HttpRequest, deux on été ajouter et permets cette liaison.
```csharp
[FromRoute]int a
[FromRoute]int b
```

Dernière étape pour le binding par la route, utiliser les valeurs dans l'appel de la méthode qui multiplie les nombres.
```csharp
public static class Multipicator
{
    [FunctionName("Multipicator")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "Multipicator/{a}/{b}")] HttpRequest req,
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
public static class Multipicator
{
    [FunctionName("Multipicator")]
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

Les deux lignes suivantes, lisent le contenus du paramètres de la query selon la clé et sont convertis en Int avec un parse.
```csharp
int a = int.Parse(req.Query["a"]);
int b = int.Parse(req.Query["b"]);
```

### Le body binding
Il existe plusieurs moyen de binder sur le Body, ici la méthode la plus simple sera utiliser. Elle conssiste a lire le body de la requête,
ensuite désérialiser le contenus Json.
```csharp
public class InputMultiplicator
{
    public int A { get; set; }
    public int B { get; set; }
}

public static class Multipicator
{
    [FunctionName("Multipicator")]
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

Niveau URL, elle sera a nouveau simplifier car le paramètre route est redevenu null
```
http://localhost:7071/api/Multipicator
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

![placeholder](/images/azure-functions/publish-functions-part1.png "Azure functions")

![placeholder](/images/azure-functions/publish-functions-part2.png "Azure functions")

![placeholder](/images/azure-functions/publish-functions-part3.png "Azure functions")

![placeholder](/images/azure-functions/publish-functions-part4.png "Azure functions")



## La sécurité
Niveau sécurité, Azure propose plusieurs niveau d'authentification, un Anonymous qui ne demande rien de plus et 3 autres Function, Admin & System qui nécessitent une clé pour autoriser l'accès à la function.

Il existe trois type de clés :
- **Host keys** : Les clés de ce type peuvent s'utiliser de façons cross function dans la même Function App.
- **Function keys** : Les clés de ce type ne peuvent s'utiliser que sur la function sur laquelle la clé à été définie.
- **Master key** : Chaque Function App définis une master key (_master) qui donne un accès Admin sur toutes les function de l'app.

### Anonymous
Ne requière aucune authentification, toute requête HTTP valide sera intercepter.

### Function
Requière une clé d'authentification, ici la **Host Key** ou la **Function Key**. 
Pour la function **Function Key** celle-ci devra être définie sur la function qu'on souhaite appeller. 
Si la clé est invalide, c'est une HTTP  401 qui est renvoyer.

### Admin
Requière une clé d'authentification, ici la **Host Key** sera nécessaire.
Si la clé est invalide, c'est une HTTP  401 qui est renvoyer.

### System
Requière une clé d'authentification, ici la **Master key** sera nécessaire. La clé master ne peux pas être révoké.
Si la clé est invalide, c'est une HTTP  401 qui est renvoyer.