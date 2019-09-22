---
author: pgrasseel
layout: post
title: "Azure Functions les bases"
date: 2019-08-11 18:26:40
image: '/images/azure-functions/Azure-Functions.png'
description: Azure Functions, le cloud serverless simple d'utilisation.
category: 'documentation'
tags:
- azure
- tutorial
- serverless
introduction: Azure Functions, le cloud serverless simple d'utilisation.
---

# Azure Functions : Les bases

Une Azure functions peut facilement se résumer en quelques points :

* c'est un service de calcul dans le cloud Azure **serverless**
* qui permet **d’exécuter du code à la demande**
* sans avoir à **provisionner d’infrastructure**

En résumé, on va définir sur le cloud un container, dans lequelle les fonctions seront déployées, ensuite, l'exécution, le scaling, la disponibilité 
et tout autre problème/considérations qui pourrait être lié à l'infrastructure devient la responsabilité d'Azure, nous ne devons nous occuper de rien.

Une fois le code déployer et disponible, il reste une chose à comprendre, c'est comment exécuter ce code. Les Azure Functions utilise des 
triggers pour s'exécuter

![placeholder](/images/azure-functions/Azure-Functions.png "Azure functions")

## Les triggers

L'un des points forts des Azure Functions, c'est la vaste liste de trigger disponible, qui s'étend d'un simple HTTP/Webhook a des déclencheurs sur des DB NoSQL comme CosmosDB.

[Doc officiels](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings)

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>1.x</th>
      <th>2.x</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Blob storage</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Cosmos DB</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Event Grid</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Event Hubs</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>HTTP & webhooks</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Microsoft Graph events</td>
      <td>X</td>
      <td>V</td>
    </tr>
     <tr>
      <td>Queue storage</td>
      <td>V</td>
      <td>V</td>
    </tr>
     <tr>
      <td>Service Bus</td>
      <td>V</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Timer</td>
      <td>V</td>
      <td>V</td>
    </tr>
  </tbody>
</table>

## Une function, un code simple

Un autre avantage des Azure Functions, c'est le code minimaliste pour en crée une, les templates fournis par VS ou VS Code font bien le boulot.
Une Azure Functions qui est trigger par du HTTP/Webhook ressemble à ça

``` csharp

public static class SampleFunction
{
    [FunctionName("SampleFunction")]
    public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log) {
        
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

Le code reste assez simple et compréhensible. Dans d'autres articles, des exemples de functions plus avancées avec d'autres triggers seront traité.

## Multi language

Un autre avantage fondamental des Azure functions, c'est qu'il est possible de les développer en plusieurs languages différents. Les languages suivants sont supportés

[Doc officiels](https://docs.microsoft.com/en-us/azure/azure-functions/supported-languages)

<table>
  <thead>
    <tr>
      <th>Language</th>
      <th>1.x</th>
      <th>2.x</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>C#</td>
      <td>GA (.NET Framework 4.7)</td>
      <td>GA (.NET Core 2.2)</td>
    </tr>
    <tr>
      <td>JavaScript</td>
      <td>GA (Node 6)</td>
      <td>GA (Node 8 & 10)</td>
    </tr>
    <tr>
      <td>F#</td>
      <td>GA (.NET Framework 4.7)</td>
      <td>GA (.NET Core 2.2)</td>
    </tr>
    <tr>
      <td>Java</td>
      <td>N/A</td>
      <td>GA (Java 8)</td>
    </tr>
    <tr>
      <td>Powershell</td>
      <td>Experimental</td>
      <td>Preview (PowerShell Core 6)</td>
    </tr>
    <tr>
      <td>Python</td>
      <td>Experimental</td>
      <td>Preview (Python 3.6)</td>
    </tr> 
    <tr>
      <td>Typescript</td>
      <td>Experimental</td>
      <td>GA (supported through transpiling to JavaScript)</td>
    </tr>            
  </tbody>
</table>    

## Faible cout

L'un des facteurs qui peut souvent jouer dans le fait de tester de nouvelles technologies, c'est l'investissement humain, mais également financier.
Les Azure Functions proposent un plan gratuit, qui permet vraiment de tester pas mal de choses sans avoir à débourser un euro.
Pour la suite, la tarification n'est pas très élevée de base.

[Azure Pricing](https://azure.microsoft.com/en-us/pricing/details/functions/)

## Conclusion

En conclusion, une Azure function c'est :

* c'est un service de calcul dans le cloud Azure **serverless**
* qui permet **d’exécuter du code à la demande**
* sans avoir à **provisionner d’infrastructure**
* multilanguage

D'autres articles vont arriver prochainement sur les triggers, comment utiliser les avantages de l'ASP.NET Core dans une Azure Functions (DI, Configuration, etc ...).

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
