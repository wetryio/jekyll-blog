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
  - [Installer .NET MAUI](https://learn.microsoft.com/fr-fr/dotnet/maui/get-started/installation?tabs=vswin)
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

```bash
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

Pour se rendre sur le Firebase console voici le lien : (Firebase Console)[https://console.firebase.google.com/]
Une fois connecter, on vas crée un nouveau Projet.

![firebase_create_new](/assets/img/firebase-push/firebase_create_new.png)

L'étape numéro 1 vous demande de nommer le projet, ici pour l'exemple je vais le nommer : MauiPushWeTry

![name_project](/assets/img/firebase-push/name_project.png)

L'étape numéro deux, est la configuration de Google Analytics, ici je ne vais pas l'activer.

Ensuite, je termine la création.

![firebase_create_new](/assets/img/firebase-push/firebase_end.png)

Une fois crée, on arrive donc sur la page d'accueil du projet fraichement crée. Cette page vas nous permettre d'ajouter et de configurer des services Firebase. 

![firebase_home_project](/assets/img/firebase-push/firebase_home_project.png)

Dans la colonne de droite, on peux voir plusieurs menu avec des sous-menu, c'est dans le menu "Engager", avec le sous menu "Messaging" qu'on vas pouvoir commencer à configurer les Push sous Firebase.

![firebase_menu_messaging](/assets/img/firebase-push/firebase_menu_messaging.png)

Une fois sur la page de Messaging, la première chose à faire est d'ajouter une application, dans notre cas ici, c'est sous Android.

![firebase_add_android](/assets/img/firebase-push/firebase_add_android.png)

C'est ici qu'il vas être important de configurer le nom du package de notre application Android.

- Nom du package android :
  - La valeur peux être trouvée dans le fichier .csproj : <ApplicationId>com.companyname.mauipushwetry</ApplicationId>

- Pseudo de l'application :
  - Il est facultatif, mais personnellement je mets toujours le nom de mon app : MauiPushWeTry

![firebase_push_start](/assets/img/firebase-push/firebase_push_start.png)

Dés que l'application est enregistrer on vas pouvoir télécharger un fichier .json qui contient la configuration que le plugin vas avoir besoin pour reçevoir les Push Notification.

![firebase_push_config](/assets/img/firebase-push/firebase_push_config.png)

Télécharger le fichier google-services.json et placer le à la racine du projet .NET MAUI.

![maui_solution_withjson](/assets/img/firebase-push/maui_solution_withjson.png)


## Les événements de Plugin.Firebase.CloudMessaging

Quand un device s'enregistre pour reçevoir des notifications push, un token lui est attribuer, ce token peux-être utiliser pour target un utilisateur en particulier.
Plugin.Firebase.CloudMessaging expose la possibilité d'enregistrer des méthodes qui seront utiliser lors du changement de token.

Dans MainPage.xaml.cs on vas override la méthode void OnAppearing().
```csharp
protected override async void OnAppearing()
{
    CrossFirebaseCloudMessaging.Current.TokenChanged += CurrentTokenChanged;
    await CrossFirebaseCloudMessaging.Current.CheckIfValidAsync();
    base.OnAppearing();
}
```

La première ligne vas nous permettre de binder une méthode lors du changement de token, la seconde de vérifier qu'on à bien accès/les permissions pour reçevoir des notifications push.

Ensuite, on vas crée la méthode qui vas s'éxecuter au changement de token.

```csharp
private void CurrentTokenChanged(object sender, Plugin.Firebase.CloudMessaging.EventArgs.FCMTokenChangedEventArgs e)
{
    Console.WriteLine(e.Token);
}
```


En plus d'une méthode qui écoute les changements de token, il est aussi possible d'intercepter les notifications reçues.

```csharp
protected override async void OnAppearing()
{
    CrossFirebaseCloudMessaging.Current.TokenChanged += CurrentTokenChanged;
    CrossFirebaseCloudMessaging.Current.NotificationReceived += CurrentNotificationReceived; // Ajouter

    await CrossFirebaseCloudMessaging.Current.CheckIfValidAsync();
    base.OnAppearing();
}
```

On vas simplement ajouter un console write pour afficher les informations reçues.

```csharp
private void CurrentNotificationReceived(object sender, Plugin.Firebase.CloudMessaging.EventArgs.FCMNotificationReceivedEventArgs e)
{
    Console.WriteLine($"{e.Notification.Title}{e.Notification.Body});
    // Prochaine étape on vas afficher la notification reçue
}
```

## Afficher une notification
Pour afficher ce qu'on à reçus depuis Firebase on vas ajouter le plugin suivant Plugin.LocalNotification :

```bash
dotnet add package Plugin.LocalNotification --version 10.1.8
```

Dans le MauiProgram.cs on vas ajouter ceci :

```csharp
.UseLocalNotification(config =>{})
```
```csharp
builder
    .UseMauiApp<App>()
    .RegisterFirebaseServices()
    .UseLocalNotification(config => { })
    .ConfigureFonts(fonts =>
    {
        fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
        fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
    });
```

Et ajouter quelques permissions dans le AndroidManifest.xml

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
    <uses-permission android:name="android.permission.WAKE_LOCK" /> <!-- A ajouter -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" /> <!-- A ajouter -->
	<uses-permission android:name="android.permission.VIBRATE" /> <!-- A ajouter -->
	<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" /> <!-- A ajouter -->
	<uses-permission android:name="android.permission.POST_NOTIFICATIONS" /> <!-- A ajouter -->
</manifest>
```

Une fois cela fais, on vas vérifier que notre application à bien les permissions pour afficher des notifications.

Dans le MainPage.xaml dans la méthode OnAppearing.

```csharp
protected override async void OnAppearing()
{
    CrossFirebaseCloudMessaging.Current.TokenChanged += Current_TokenChanged;
    CrossFirebaseCloudMessaging.Current.NotificationReceived += Current_NotificationReceived;
    await CrossFirebaseCloudMessaging.Current.CheckIfValidAsync();

    // Ajouter
    if (await LocalNotificationCenter.Current.AreNotificationsEnabled() == false)
    {
        await LocalNotificationCenter.Current.RequestNotificationPermission();
    }

    base.OnAppearing();
}
```

Une fois ce check fait, on vas pouvoir passer à l'étape suivante, qui vas nous permettre d'afficher une notification.
Retour à la méthode CurrentNotificationReceived dans MainPage.xaml.cs

```csharp
private void CurrentNotificationReceived(object sender, Plugin.Firebase.CloudMessaging.EventArgs.FCMNotificationReceivedEventArgs e)
{
    var request = new NotificationRequest
    {    
        NotificationId = 100, // On crée un ID
        Title = $"{e.Notification.Title}", // En title, on vas récupérer la valeur de la push reçue
        Description = e.Notification.Body // En description, la valeur du body de la push reçue
    };

    await LocalNotificationCenter.Current.Show(request);    
}
```


## On Test !


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
