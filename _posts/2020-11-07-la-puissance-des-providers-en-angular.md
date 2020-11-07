---
date: 2020-11-07 11:56:18
layout: post
title: "La puissance des providers en Angular"
subtitle:
description: Comprendre toute la puissance de la dépencande d'ingection d'Angular
image:
category: 'documentation'
tags:
- angular
- provider
author: dgilson
introduction: Comprendre toute la puissance de la dépencande d'ingection d'Angular.
---

Dans cet article, nous allons passer en revue des solutions concrètes qui utilisent les provider et voir ensemble le pourquoi et le comment.

Nous avons déjà pu voir un cas concret d'utilisation interne de poviders de Angular dans [l'article parlant du fonctionnement de HttpClient](/fonctionnement-d-angular-httpclient).

Si vous souhaitez d'abord voir la liste des cas vus dans cet article, vous pouvez vous rendre sur la [table des matières](#toc). Mais je vous invite à lire tout l'article car chaque concept met en avant une façon différente d'utiliser les providers.

## Configuration de modules

Commençon par voir comment il est possible de rengre un module (souvent une librairie) configurable, et nous allons prendre comme exemple la librairie [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) qui permet de générer des services http ainsi que ces modèles (DTO) depuis un contract [openapi](https://swagger.io/) (anciennement swagger).

Ce que nous utilisons généralement est apellé **[forRoot pattern](https://angular.io/guide/singleton-services#the-forroot-pattern)** et a pour but de permettre de créer un singleton (instance unique) pour toutes les utilisations de ce module.

La fonction `forRoot` est "simplement" une fonction statique se trouvant dans le module et doit obligatoirement retourner un `ModuleWithProviders`. Attention qu'aucun appel à une autre fonction ne peut être fait dans celle-ci, elle doit donc être [pure](/des-fonctions-pures-pour-plus-de-lisibilite).

```ts
@Injectable({
  providedIn: 'root',
})
export class MonModuleConfiguration {
  rootUrl: string = 'http://google.be';
}

// -----------------

@NgModule({
  providers: [
    {
        provide: MonModuleConfiguration,
        useValue: defaultConfiguration
    }
  ]
})
export class MonModule {
  static forRoot(params: Partial<MonModuleConfiguration>): ModuleWithProviders<MonModule> {
    return {
      ngModule: MonModule,
      providers: [
        {
          provide: MonModuleConfiguration,
          useValue: params
        }
      ]
    }
  }
}

// -----------------

@NgModule({
  imports: [
    SubModule.forRoot({ rootUrl: "https://wetry.tech" })
  ]
})
export class AppModule {}
```

Ce simple bout de code illustre déjà beaucoup de choses:

1. La notion de `providedIn`. Il s'agit du "scope de disponibilité de l'instance" (en d'autres terme, il donne à Angular une indication sur le choix de l'Injector où placer cette instance). ça valeur peut être un nom de module ou `"root"`. Cette dernière valeur permetant de rendre disponible l'instance dans l'application entière.+
2. Il est possible d'écraser un provider. Vous pouvez remarquer que dans cette exemple, il y a deux provider pour `MonModuleConfiguration`. Une crée depuis `defaultConfiguration` et l'autre depuis `params`. Cela permet à l'utilisateur du module de pouvoir l'importer dans l'AppModule en appellant `MonModule` (prenant la **config par défaut**) ou `MonModule.forRoot({...})` imposant **sa propre configuration**.
3. `ModuleWithProviders` contient le module ainsi que des providers à y ajouter ou remplacer.

**Attention** que comme son nom l'indique, il ne faut utiliser le `.forRoot()` qu'au module le plus "haut" où sera utilisé notre module. AppModule et le module le plus haut de l'application donc le mettre ici permet évite tout problème.

*[Testez le code ici](https://stackblitz.com/edit/simple-module-config?file=src%2Fapp%2Fapp.module.ts)*

## Logger

Dans cet exemple, nous allons traiter la gestion de loggers multiples.

Pour ce faire nous allons avoir besoin de deux niveaux:
1. Un **logger global** qui pourra être utilisé en tant que service,
2. Un ensemble de **sous logger** qui vont réellement logger en étant utilisés par le "logger global".

![logger-schema](/assets/img/angular-posts/loggers.png)

### Les "sous loggers"

Pour être certain que tous les providers utilisé possèdes les bonnes méthodes, j'utilise une **classe abstraite** (vous pouvez également utiliser une **interface**).

```ts
export const LOGGER = new InjectionToken<BaseLogger>("LOGGER");

@Injectable()
export abstract class BaseLogger {
  public log(message: string): void {
    this.processLog(LogLevelEnum.Info, message);
  }

  protected abstract processLog(level: LogLevelEnum, message: string): void;
}
```

* Vous pouvez remarquer l'attribut `@Injectable()` malgré qu'il s'agisse d'une classe absraite. En effet, cela est obligatoire depuis Angular 9 (Ivy). Cela ne veut cependant pas dire que nous allons pouvoir l'injectée!
* Vous pouvez également remarqué l'utilisation d'un `InjectionToken`. Cela permetra un accès à des providers typé (ici BaseLogger) à l'aide de l'attribut `@Inject()`. Nous allons voir son utilisation dans parties de codes qui vont suivres.

*L'implémentation d'une classe qui hérite de celle-ci n'a rien de spéciale, nous n'allons donc pas nous attarder dessus mais vous pourez tout de même voir des exemples via le lien en fin de chapitre.*

Voyons maintenant comment rendre des loggers disponibles.
Pour ce faire nous allons utiliser une fonctionnalité également utilisée par `APP_INITIALIZER` : `multi: true`.

```ts
providers: [
    {
        provide: LOGGER,
        useClass: ConsoleLogger,
        multi: true
    },
    {
        provide: LOGGER,
        useClass: MyLogger,
        multi: true
    }
]
```

### Le "logger global"

Ce provider exploite ceux précédement créé et est le seul qui sera utilisé au travers de l'application.

```ts
@Injectable()
export class Logger {
  constructor(@Inject(LOGGER) private loggers: BaseLogger[]) {}

  public log(message: string): void {
    this.loggers.forEach(logger => logger.log(message));
  }
}
```

Avec l'option `multi: true` nous pouvons voir que l'injection via `@Inject(LOGGER)` ne nous fournis pas un seul provider, mais une liste `BaseLogger[]`.
Nous pouvons alors l'exploiter à l'aide d'un simple `forEach`.

Vous pouvez maintenant vous demander pourquoi ne pas faire un seul service qui fait tout ?
Le fait de les séparer en providers vous permet non seulement de pouvoir en ajouter un sans touché aux loggers déjà fonctionnels mais de pouvoir en activer/désactiver facilement.

Dans *[cet exemple ](https://stackblitz.com/edit/multi-loggers?file=src%2Fapp%2Fapp.module.ts)*, j'ai poussé les choses encore un peu plus loin en fournissant la liste des loggers dans le forRoot.

```ts
LoggerModule.forRoot({
    loggers: [
        ConsoleLogger,
        MyLogger
    ]
})
```

## Multiplateforme

Votre application doit fonctionner sur Mobile et en version Web ? Voilà encore un excelent exemple d'utilisation des provider.

Il est en effet possible de conditionner le provider à utiliser au moment du build en utilisant le mécanisme d'environement/configuration d'Angular.

```ts
providers: [
    {
        provide: FileExplorerService,
        useClass: environment.isMobile ? FileExplorerMobileService : FileExplorerWebService
    }
]
```

Cet exemple démontre aussi qu'il n'est pas toujours nécessaire de passer par un token d'injection. En effet ici `FileExplorerService` étant abstraite (cela ne fonctionne pas avec des interfaces) et n'utilisant pas l'option ~~`multiple: true`~~, nous pouvons utiliser cette classe **comme un token**.

*[Testez le code ici](https://stackblitz.com/edit/conditional-provider?file=src/app/app.module.ts)*

## Mocks

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

