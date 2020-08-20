---
author: pgrasseels
layout: post
title: "State Management en Blazor (WASM) avec Fluxor"
date: 2020-08-20 11:20:00
image: '/images/blazor/blazor-fluxor.png'
description: State Management en Blazor (WASM) avec Fluxor.
category: 'blazor'
tags:
- blazor
- tutorial
- aspnetcore
- single page application
- fluxor
- WASM
introduction: State Management en Blazor (WASM) avec Fluxor.
---

# State Management en Blazor avec Fluxor

Tout d'abord, commençons par la base, c'est quoi du State Management dans une application ?

# Fluxor

La première étape est d'installer les packages nécessaire a l'utilisation de Fluxor.

Ce package contient la base de Fluxor, utilisable de manière agnostique en .Net (WPF, Xamarin, Blazor, etc ...)
```shell
dotnet add package Fluxor --version 3.6.0
```

Ce second package est spécifique à Blazor et contient les ajout nécessaire aux rafraichissement des vues etc ...
```shell
dotnet add package Fluxor.Blazor.Web --version 3.6.0
```

Ce derniers packages est optionel, mais permets de débugger dans Chrome. Il s'utilise avec [Redux DevTools sur chrome(https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=fr)] 
```shell
dotnet add package Fluxor.Blazor.Web.ReduxDevTools --version 3.6.0
```


Une fois les packages installer, il est nécessaire d'ajouter dans le index.html qui se trouve dans le wwwroot la ligne suivante

```html
<script src="_content/Fluxor.Blazor.Web/scripts/index.js"></script>
```

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Todo.FluxorApp</title>
    <base href="/" />
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet" />
    <link href="css/app.css" rel="stylesheet" />
    <link href="manifest.json" rel="manifest" />
    <link rel="apple-touch-icon" sizes="512x512" href="icon-512.png" />
</head>

<body>
    <app>Loading...</app>
    <div id="blazor-error-ui">
        An unhandled error has occurred.
        <a href="" class="reload">Reload</a>
        <a class="dismiss">🗙</a>
    </div>
    <script src="_framework/blazor.webassembly.js"></script>
    <script src="_content/Fluxor.Blazor.Web/scripts/index.js"></script>
    <script>navigator.serviceWorker.register('service-worker.js');</script>
</body>
</html>
```

Et d'initialiser dans le Program.cs

```csharp
builder.Services.AddFluxor(options => options.ScanAssemblies(typeof(Program).Assembly));
```

```csharp
using Fluxor;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Todo.FluxorApp.Client
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            builder.RootComponents.Add<App>("app");

            builder.Services.AddTransient(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

            builder.Services.AddFluxor(options => options.ScanAssemblies(typeof(Program).Assembly));

            await builder.Build().RunAsync();
        }
    }
}
```

Dernier étape, dans le fichier App.razor, afin de s'assurer que le store est correctement initialiser

```html
<Fluxor.Blazor.Web.StoreInitializer/>
```

```html
<Fluxor.Blazor.Web.StoreInitializer />

<Router AppAssembly="@typeof(Program).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
    </Found>
    <NotFound>
        <LayoutView Layout="@typeof(MainLayout)">
            <p>Sorry, there's nothing at this address.</p>
        </LayoutView>
    </NotFound>
</Router>
```

## Un State

## Computed Observables

## Actions

## Reactions


## Sources

La libraire que j'ai utilisé :
(https://github.com/skclusive/Skclusive.Mobx.Observable)[Skclusive.Mobx.Observable]

Le github du mini projet :
(https://github.com/wetryio/eshop-wetry[[eShop WeTry]

<div id="toc"></div>
**Table des matières**
1. TOC
{:toc}
