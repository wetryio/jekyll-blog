---
date: 2023-08-20 14:20:04
layout: post
title: "Push Notification dans une application .NET MAUI (Android)"
subtitle:
description:
image: /assets/img/firebase-push/firebase-push.png
optimized_image:
category:
tags: maui push firebase android
author: pgrasseels
---

## Une push notification
Dans le paysage numérique moderne, les push notifications se distinguent en tant que messages percutants qui établissent un lien direct avec les utilisateurs. Agissant comme des rappels, des mises à jour et des alertes, ces notifications jouent un rôle essentiel dans notre interaction avec les applications, suscitant un équilibre subtil entre utilité et intrusion. 

![push_overview](/assets/img/firebase-push/firebase-push.png)

## .Net MAUI
L’interface utilisateur d’application multiplateforme .NET (.NET MAUI) est une infrastructure multiplateforme permettant de créer des applications mobiles et de bureau natives avec C# et XAML.

À l’aide de .NET MAUI, vous pouvez développer des applications qui peuvent s’exécuter sur Android, iOS, macOS et Windows à partir d’une seule base de code partagée. .NET MAUI est open source et est l’évolution de Xamarin.Forms.

[Microsoft MAUI](https://learn.microsoft.com/fr-fr/dotnet/maui/what-is-maui)

![maui_overview](/assets/img/firebase-push/maui-overview.png)


## Firebase
Firebase est un ensemble de service proposé par Google qui permets de rapidement déployer, utiliser des sevices tel que l'authentification, le stockage (Firestore), le serverless, du hosting, du ML, etc ... et ce qui nous intéresse ici le Cloud Messaging (FCM).

![firebase_overview](/assets/img/firebase-push/firebase-services.png)



## Les bases
- Le project sera en .NET MAUI 7.0
- Avoir un compte sur Firebase
- L'exemple ici sera pour Android
- [Le code source est disponible ici](https://github.com/wetryio/maui-push)

## Création du projet
La première étape consiste donc à créer un projet sur Visual Studio.
Ici, j'opte pour la création d'une application .NET MAUI, mais vous pouvez choisir l'application .NET MAUI Blazor. 
Cela n'aura pas d'impact majeur, car les deux types d'applications peuvent recevoir les push et la configuration est similaire.

![create_project](/assets/img/firebase-push/create_project.png)


Une fois crée, la structure du project ressemble à ceci (si vous avez choisit Blazor App, elle sera légérement différente)

![structure_project](/assets/img/firebase-push/structure_project.png)


## Configuration de(s) plateforme(s)
Ici, nous allons faire un peu de nettoyage dans le fichier .csproj de notre projet. Comme mentionné précédemment, ce projet se concentrera uniquement sur les push sous Android.

Dans le fichier .csproj, veuillez modifier les lignes suivantes :

```xml
Remplacer :
    <TargetFrameworks>net7.0-android;net7.0-ios;net7.0-maccatalyst</TargetFrameworks>
Par :    
    <TargetFrameworks>net7.0-android</TargetFrameworks>

Supprimer :
	<TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net7.0-windows10.0.19041.0</TargetFrameworks>
	<SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'ios'">11.0</SupportedOSPlatformVersion>
	<SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'maccatalyst'">13.1</SupportedOSPlatformVersion>
	<SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</SupportedOSPlatformVersion>
	<TargetPlatformMinVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</TargetPlatformMinVersion>
	<SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'tizen'">6.5</SupportedOSPlatformVersion>
```

Une fois nettoyer le .csproj doit ressemble à ceci :

```xml
<Project Sdk="Microsoft.NET.Sdk">

	<PropertyGroup>
		<TargetFrameworks>net7.0-android</TargetFrameworks>
		<OutputType>Exe</OutputType>
		<RootNamespace>MauiPushWeTry</RootNamespace>
		<UseMaui>true</UseMaui>
		<SingleProject>true</SingleProject>
		<ImplicitUsings>enable</ImplicitUsings>

		<!-- Display name -->
		<ApplicationTitle>MauiPushWeTry</ApplicationTitle>

		<!-- App Identifier -->
		<ApplicationId>com.companyname.mauipushwetry</ApplicationId>
		<ApplicationIdGuid>49658295-8b0f-4b11-a4ec-ba79400b21d1</ApplicationIdGuid>

		<!-- Versions -->
		<ApplicationDisplayVersion>1.0</ApplicationDisplayVersion>
		<ApplicationVersion>1</ApplicationVersion>
		<SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'android'">21.0</SupportedOSPlatformVersion>
	</PropertyGroup>

	<ItemGroup>
		<!-- App Icon -->
		<MauiIcon Include="Resources\AppIcon\appicon.svg" ForegroundFile="Resources\AppIcon\appiconfg.svg" Color="#512BD4" />

		<!-- Splash Screen -->
		<MauiSplashScreen Include="Resources\Splash\splash.svg" Color="#512BD4" BaseSize="128,128" />

		<!-- Images -->
		<MauiImage Include="Resources\Images\*" />
		<MauiImage Update="Resources\Images\dotnet_bot.svg" BaseSize="168,208" />

		<!-- Custom Fonts -->
		<MauiFont Include="Resources\Fonts\*" />

		<!-- Raw Assets (also remove the "Resources\Raw" prefix) -->
		<MauiAsset Include="Resources\Raw\**" LogicalName="%(RecursiveDir)%(Filename)%(Extension)" />
	</ItemGroup>

	<ItemGroup>
		<PackageReference Include="Microsoft.Extensions.Logging.Debug" Version="7.0.0" />
	</ItemGroup>

</Project>
```

## Plugin.Firebase.CloudMessaging
Une fois le projet prêt, on vas pouvoir installer le package NuGet pour reçevoir les push notifications :

```xml
dotnet add package Plugin.Firebase.CloudMessaging --version 2.0.3
```

Ce package contient une surcouche qui vas prendre en compte chaque plateforme pour la gestion des push et exposer une interface commune.

Le repository du plugin est disponible à l'adresse suivante : [Plugin.Firebase.CloudMessaging](https://github.com/TobiasBuchholz/Plugin.Firebase)


## Initialiser Firebase
La première chose à faire une fois le package installé est de configurer les services que nous allons utiliser.
Ici, nous allons uniquement utiliser le Cloud Messaging. Pour ce faire, dans le fichier MauiProgram.cs, nous allons créer une méthode :


```csharp
private static MauiAppBuilder RegisterFirebaseServices(this MauiAppBuilder builder)
{
    builder.ConfigureLifecycleEvents(events =>
    {
        events.AddAndroid(android => android.OnCreate((activity, _) =>
            CrossFirebase.Initialize(activity)));
    });
    builder.Services.AddSingleton(_ => CrossFirebaseCloudMessaging.Current);
    return builder;
}
```

La méthode créée juste avant permettra d'initialiser les services que nous souhaitons, ainsi que de les injecter pour pouvoir les utiliser ultérieurement dans l'application.

Une fois créée, toujours dans le fichier MauiProgram.cs, nous utiliserons cette méthode sur notre builder :

```csharp
builder
    .UseMauiApp<App>()
    .RegisterFirebaseServices() <= Ajouter cette ligne
    .ConfigureFonts(fonts =>
    {
        fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
        fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
    });
```

Ensuite, dans Platforms => Android, nous aurons plusieurs petites choses à modifier :

Dans le fichier MainActivity.cs, nous devrons ajouter une méthode pour lier l'événement d'un nouvel intent avec le plugin de Firebase. Nous devrons également vérifier que nous avons bien les permissions pour recevoir des Push Notifications.

```csharp
protected override void OnCreate(Bundle savedInstanceState)
{
    base.OnCreate(savedInstanceState);
    HandleIntent(Intent);
}

private static void HandleIntent(Intent intent)
{
    FirebaseCloudMessagingImplementation.OnNewIntent(intent);
}

protected override void OnActivityResult(int requestCode, Result resultCode, Intent data)
{
    base.OnActivityResult(requestCode, resultCode, data);
}

protected override void OnNewIntent(Intent intent)
{
    base.OnNewIntent(intent);
    HandleIntent(intent);
}

public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Permission[] grantResults)
{
    Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);
    base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
}
```

Dès que le fichier MainActivity.cs a été modifié, il va donc être nécessaire de modifier un second fichier qui va précisément contenir les permissions que nous souhaitons pour notre application, ainsi que le "receiver" qui va écouter la réception des push et l'enregistrer au niveau du système.
Pour ce faire, nous allons ouvrir le fichier AndroidManifest.xml.

Son contenu de base ressemble à ceci :

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
	<application android:allowBackup="true" android:icon="@mipmap/appicon" android:roundIcon="@mipmap/appicon_round" android:supportsRtl="true"></application>
	<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
	<uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

On va donc commencer par le modifier pour enregistrer le receiver qui va s'enregistrer au niveau du système pour recevoir les push.
Dans la balise <application>, on va donc ajouter :
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
	<application android:allowBackup="true" android:icon="@mipmap/appicon" android:roundIcon="@mipmap/appicon_round" android:supportsRtl="true">
		<receiver android:name="com.google.firebase.iid.FirebaseInstanceIdInternalReceiver" android:exported="false" />
		<receiver
		  android:name="com.google.firebase.iid.FirebaseInstanceIdReceiver"
		  android:exported="true"
		  android:permission="com.google.android.c2dm.permission.SEND">
			<intent-filter>
				<action android:name="com.google.android.c2dm.intent.RECEIVE" />
				<action android:name="com.google.android.c2dm.intent.REGISTRATION" />
				<category android:name="${applicationId}" />
			</intent-filter>
		</receiver>    
    </application>
	<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
	<uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

En ce qui concerne les permissions, assurez-vous simplement que la ligne suivante est bien présente :
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Une fois les étapes précédentes réalisées, il va rester une étape cruciale à accomplir pour finaliser l'initialisation : récupérer le fichier de configuration de Firebase qui va permettre de faire le lien entre l'application et Firebase.

## Firebase Console

## Les événements de Plugin.Firebase.CloudMessaging

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
