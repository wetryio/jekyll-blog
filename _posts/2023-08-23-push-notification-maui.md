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
La première chose est donc de crée un projet sur Visual Studio.
Ici je choisit de le faire en .NET MAUI App, vous pouvez choisir le .NET MAUI Blazor  App, cela n'aura pas d'impact, car les deux peuvent reçevoir les push et la configuration est similaire.

![create_project](/assets/img/firebase-push/create_project.png)


Une fois crée, la structure du project ressemble à ceci (si vous avez choisit Blazor App, elle sera légérement différente)

![structure_project](/assets/img/firebase-push/structure_project.png)


## Configuration de(s) plateforme(s)
Ici on vas nettoyer un peu le .csproj de notre projet, comme dit juste avant, le projet ici vas uniquement traiter des push sous Android.

Dans le .csproj, modifier les lignes suivantes :

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
La première chose à faire une fois le package installer, est de configurer les services qu'on vas utiliser. 
Ici on vas uniquement utiliser le Cloud Messaging. Pour cela dans le MauiProgram.cs on vas crée une methode :

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

La méthode crée juste avant, vas permettre d'initialiser les services qu'on souhaite ainsi que de les injecter pour pouvoir les utiliser plus tard dans l'application.

Une fois crée, toujours dans le MauiProgram.cs on vas utiliser cette méthode sur notre builder :

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

Ensuite, dans Platforms => Android on vas avoir plusieurs petites choses à modifier :

Dans le fichier MainActivity.cs, on vas devoir ajouter une méthode pour binder l'event d'un nouvel intent avec le plugin de firebase. Mais également de vérifier qu'on à bien les permissions pour reçevoir des Push Notifications.

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

Dés que le fichier MainActivity.cs à été modifier, il vas donc être nécessaire de modifier un second fichier qui vas justement contenir les permissions qu'on souhaite pour notre application, mais également le "receivers" qui vas écouter la réception des push et l'enregistrer au niveau du système.
Pour cela, on vas ouvrir le fichier AndroidManifest.xml 

Sont contenu de base ressemble à ça :

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
	<application android:allowBackup="true" android:icon="@mipmap/appicon" android:roundIcon="@mipmap/appicon_round" android:supportsRtl="true"></application>
	<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
	<uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

On vas donc commencer par le modifier pour enregistrer le receiver qui vas s'enregistrer au niveau du système pour reçevoir les push.
Dans la balise <application> on vas donc ajouter :
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

Niveau permission juste s'assurer que la ligne suivante est bien présente :
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Une fois les étapes précédentes réaliser, il vas rester une étape cruciales à réaliser pour finaliser l'initialisation, c'est de récupérer le fichier de configuration de Firebase qui vas permettre de faire le lien entre l'application et Firebase.

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
