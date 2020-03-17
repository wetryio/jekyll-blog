---
date: 2020-02-13 12:38:42
layout: post
title: "DotNet 5 sur Raspbian"
subtitle: Le futur du .Net sur Raspberry PI
description: Le futur du .Net sur Raspberry PI.
image: '/assets/img/angular-posts/clean-code.png'
category: 'dotnet'
tags:
    - dotnet5
    - raspberry pi
    - raspbian
author: pgrasseels
---

[*DotNet 5 vient de sortir en preview, vive DotNet !!!*](https://devblogs.microsoft.com/aspnet/asp-net-core-updates-in-net-5-preview-1)

## DotNet 5 c'est quoi ?

## Installer DotNet 5 sur Raspbian
Comme on peut le voir sur le site de Microsoft, la version ARM de DotNet 5 est déjà disponible, c'est parfait c'est la version nécessaire pour faire tourner sur Raspberry Pi 4 !

Les base sont : 
- Une carte SD avec Raspbian installer
- Un raspberry pi 4

Une fois le raspberry pi lancer, il suffit de soit se connecter en SSH soit y accèder directement par clavier/souris.

Première étape, récupérer l'archive qui contient le SDK.

Les téléchargements sont disponible à la page suivante [DotNet](https://dotnet.microsoft.com/download/dotnet-core/5.0).

![download_link](/assets/img/dotnet5-raspbian/download.PNG)

sudo mkdir -p /usr/dotnet

sudo tar zxf dotnet-sdk-5.0.100-preview.1.20155.7-linux-arm.tar.gz -C /usr/dotnet

nano /etc/.bashrc

export DOTNET_ROOT=/usr/dotnet
export PATH=$PATH:/usr/dotnet


root@raspberrypi:/usr/dotnet/sdk# dotnet --info
.NET Core SDK (reflecting any global.json):
 Version:   5.0.100-preview.1.20155.7
 Commit:    1c44853056

Runtime Environment:
 OS Name:     raspbian
 OS Version:  10
 OS Platform: Linux
 RID:         linux-arm
 Base Path:   /usr/dotnet/sdk/5.0.100-preview.1.20155.7/

Host (useful for support):
  Version: 5.0.0-preview.1.20120.5
  Commit:  3c523a6a7a

.NET Core SDKs installed:
  5.0.100-preview.1.20155.7 [/usr/dotnet/sdk]

.NET Core runtimes installed:
  Microsoft.AspNetCore.App 5.0.0-preview.1.20124.5 [/usr/dotnet/shared/Microsoft.AspNetCore.App]
  Microsoft.NETCore.App 5.0.0-preview.1.20120.5 [/usr/dotnet/shared/Microsoft.NETCore.App]

To install additional .NET Core runtimes or SDKs:
  https://aka.ms/dotnet-download


root@raspberrypi:/usr/dotnet/sdk# dotnet new
Templates                                         Short Name               Language          Tags
--------------------------------------------      -------------------      ------------      -------------------
Console Application                               console                  [C#], F#, VB      Common/Console
Class library                                     classlib                 [C#], F#, VB      Common/Library
WPF Application                                   wpf                      [C#], VB          Common/WPF
WPF Class library                                 wpflib                   [C#], VB          Common/WPF
WPF Custom Control Library                        wpfcustomcontrollib      [C#], VB          Common/WPF
WPF User Control Library                          wpfusercontrollib        [C#], VB          Common/WPF
Windows Forms (WinForms) Application              winforms                 [C#], VB          Common/WinForms
Windows Forms (WinForms) Class library            winformslib              [C#], VB          Common/WinForms
Worker Service                                    worker                   [C#]              Common/Worker/Web
Unit Test Project                                 mstest                   [C#], F#, VB      Test/MSTest
NUnit 3 Test Project                              nunit                    [C#], F#, VB      Test/NUnit
NUnit 3 Test Item                                 nunit-test               [C#], F#, VB      Test/NUnit
xUnit Test Project                                xunit                    [C#], F#, VB      Test/xUnit
Razor Component                                   razorcomponent           [C#]              Web/ASP.NET
Razor Page                                        page                     [C#]              Web/ASP.NET
MVC ViewImports                                   viewimports              [C#]              Web/ASP.NET
MVC ViewStart                                     viewstart                [C#]              Web/ASP.NET
Blazor Server App                                 blazorserver             [C#]              Web/Blazor
ASP.NET Core Empty                                web                      [C#], F#          Web/Empty
ASP.NET Core Web App (Model-View-Controller)      mvc                      [C#], F#          Web/MVC
ASP.NET Core Web App                              webapp                   [C#]              Web/MVC/Razor Pages
ASP.NET Core with Angular                         angular                  [C#]              Web/MVC/SPA
ASP.NET Core with React.js                        react                    [C#]              Web/MVC/SPA
ASP.NET Core with React.js and Redux              reactredux               [C#]              Web/MVC/SPA
Razor Class Library                               razorclasslib            [C#]              Web/Razor/Library
ASP.NET Core Web API                              webapi                   [C#], F#          Web/WebAPI
ASP.NET Core gRPC Service                         grpc                     [C#]              Web/gRPC
dotnet gitignore file                             gitignore                                  Config
global.json file                                  globaljson                                 Config
NuGet Config                                      nugetconfig                                Config
Dotnet local tool manifest file                   tool-manifest                              Config
Web Config                                        webconfig                                  Config
Solution File                                     sln                                        Solution
Protocol Buffer File                              proto                                      Web/gRPC

Examples:
    dotnet new mvc --auth Individual
    dotnet new web
    dotnet new --help

---

<div class="gratitude">
    <span>MERCI</span>
    <p>d'avoir pris le temps de lire cet article</p>
</div>
