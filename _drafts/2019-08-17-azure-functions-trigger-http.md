---
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
twitter_text: Azure Functions, démystifions le trigger HTTP.
introduction: Azure Functions, démystifions le trigger HTTP.
github_username: Hantse
linkedin_username: patrick-grasseels-a132a381
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

La use case que nous allons voir ici, est de réaliser un validateur (email, username, etc ...) à l'aide de [Fluent Validation](https://fluentvalidation.net/).

## Crée une Azure Functions avec Visual Studio

### Prerequis
- Visual Studio 2017 ou Visual Studio 2019
- [Azure Functions Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs) pour Visual Studio 2017
- Avoir selectionner les Azure Development dans les feature à installer

Les images utilisé ici sont tiré de Visual Studio 2019.

![placeholder](/images/azure-functions/create-functions-part1.png "Azure functions")

![placeholder](/images/azure-functions/create-functions-part2.png "Azure functions")

![placeholder](/images/azure-functions/create-functions-part3.png "Azure functions")

![placeholder](/images/azure-functions/create-functions-part4.png "Azure functions")

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

## Ecrire sa première Azure Functions
### Les modèles
### Les validators
On vas définir deux type de validator distinct, le premier sera simplement sur un string, le second sur un object avec plusieurs propriètés.

## Binding du modèle d'entrée

## Publier sur Azure

## La sécurité
Niveau sécurité, Azure propose plusieurs niveau d'authentification, un Anonymous qui ne demande rien de plus et 3 autres Function, Admin & System qui nécessitent une clé pour autoriser l'accès à la function.

Il existe deux type de clés :
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

