---
layout: post
title: "Azure Functions : Les bases"
date: 2019-11-08 18:26:40
image: 'https://res.cloudinary.com/wetry/image/upload/v1565693870/wetry/azure/Azure-Functions-1_zcwjys.png'
description: Azure Functions, le cloud serverless simple d'utilisation.
category: 'tutorial'
tags:
- azure
- tutorial
- serverless
twitter_text: Azure Functions, le cloud serverless simple d'utilisation.
introduction: Azure Functions, le cloud serverless simple d'utilisation.
---

# Azure Functions : Les bases

Une Azure functions peux facilement se résumer en quelques points :

* c'est un service de calcul dans le cloud Azure **serverless**
* qui permet **d’exécuter du code à la demande**
* sans avoir à **provisionner d’infrastructure**

En résumé, on vas sur le cloud définir un container, dans lequelle les fonctions seront déployer, ensuite, l'exécution, le scaling, la disponibilité 
et tout autre problème/considérations qui pourrais être lié à l'infrastructure est de la responsabilité d'Azure, nous ne devons nous occuper de rien.

Une fois le code déployer et disponible, il reste une chose à comprendre, c'est comment exécuter ce code. Les Azure Functions utilisent des 
triggers pour s'exécuter

![placeholder](https://res.cloudinary.com/wetry/image/upload/v1565693870/wetry/azure/Azure-Functions-1_zcwjys.png "Azure functions")

## Les triggers

L'un des point fort des Azure Functions, c'est la vaste liste de trigger disponible,

[Doc officiels](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>1.x</th>
      <th>2.x</th>
    </tr>
  </thead>
  <tfoot>
    <tr>
      <td>Blob storage</td>
      <td>V</td>
      <td>V</td>
    </tr>
  </tfoot>
  <tbody>
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