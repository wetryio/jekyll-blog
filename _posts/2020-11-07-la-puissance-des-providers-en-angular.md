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

## Explications préalables

Dans cet article vous allez voir les deux façon de créer un provider:
1. En utilisant l'attribut `@Injectable()` : Le provider sera créé automatiquement,
2. En créan un objet depuis le type [Provider](https://github.com/angular/angular/blob/494a2f3be4b95c7dda8aea31e8cba8728280e24b/packages/core/src/di/interface/provider.ts#L332).
    ```ts
    {
        provide: ...,
        ...
    }
    ```

## Configuration de modules

Commençon par voir comment il est possible de rendre un module (souvent une librairie) configurable, et nous allons prendre comme exemple la librairie [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) qui permet de générer des services http ainsi que ces modèles (DTO) depuis un contract [openapi](https://swagger.io/) (anciennement swagger).

Ce que nous utilisons généralement est apellé **[forRoot pattern](https://angular.io/guide/singleton-services#the-forroot-pattern)** qui a pour but de créer un singleton (instance unique) de providers pour toutes les utilisations de ce module.

La fonction `forRoot` est "simplement" une fonction statique qui se trouve dans le module et doit obligatoirement retourner un `ModuleWithProviders`. Attention que cette fonction doit obligatoirement être [pure](/des-fonctions-pures-pour-plus-de-lisibilite).

```ts
@Injectable({
  providedIn: 'root'
})
export class MonModuleConfiguration {
  rootUrl: string = 'http://google.be';
}

// -----------------

@NgModule({
  providers: [
    MonModuleConfiguration
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

1. La notion de `providedIn`. Il s'agit du "scope de disponibilité de l'instance" (en d'autres terme, il donne à Angular une indication sur le choix de l'Injector où placer cette instance). ça valeur peut être un nom de module ou `"root"`. Cette dernière valeur permetant de rendre disponible l'instance dans l'application entière.

    *Malheureusement dans cet exemple il n'a pas beaucoup de sens, car nous créons nous même le provider. [Plus d'infos ici](#providedin)*

2. Il est possible d'écraser un provider. Vous pouvez remarquer que dans cette exemple, il y a deux provider pour `MonModuleConfiguration`. Une crée depuis `@NgModule` qui représente la valeur config par défaut et l'autre depuis `params`. Cela permet à l'utilisateur du module de pouvoir l'importer dans l'AppModule en appellant `MonModule` (prenant la **config par défaut**) ou `MonModule.forRoot({...})` imposant **sa propre configuration**.
3. L'utilisation de `useValue`. Comme son nom l'indique, cela permet de forcer une valeur pour un provider.
4. `ModuleWithProviders` contient le module ainsi que des providers à y ajouter ou remplacer.

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
export const LOGGERS = new InjectionToken<BaseLogger>("LOGGERS");

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
        provide: LOGGERS,
        useClass: ConsoleLogger,
        multi: true
    },
    {
        provide: LOGGERS,
        useClass: MyLogger,
        multi: true
    }
]
```

Remarquez également l'utilisation de `useClass` qui nous permet cette fois de donner un type à créer. Cette méthode permet l'utilisation de l'injection de dépendance dans les classes fournies alors que `useValue` est utilisé pour donner des données fixes.

### Le "logger global"

Ce provider exploite ceux précédement créé et est le seul qui sera utilisé au travers de l'application.

```ts
@Injectable()
export class Logger {
  constructor(@Inject(LOGGERS) private loggers: BaseLogger[]) {}

  public log(message: string): void {
    this.loggers.forEach(logger => logger.log(message));
  }
}

// -----------------

providers: [
    Logger
]
```

Avec l'option `multi: true` nous pouvons voir que l'injection via `@Inject(LOGGERS)` ne nous fournis pas un seul provider, mais une liste `BaseLogger[]`.
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

Votre application doit fonctionner sur Mobile et en version Web ? Voilà encore un excellent exemple d'utilisation des provider.

Il est en effet possible de conditionner le provider à utiliser au moment du build en utilisant le mécanisme d'environement/configuration d'Angular.

Prenons par exemple l'ouverture d'un explorateur de fichier :

```ts
providers: [
    {
        provide: FileExplorerService,
        useClass: environment.isMobile ? FileExplorerMobileService : FileExplorerWebService
    }
]
```

Cet exemple démontre aussi qu'il n'est pas toujours nécessaire de passer par un token d'injection. En effet ici `FileExplorerService` étant une classe abstraite (cela ne fonctionne pas avec des interfaces) et n'utilisant pas l'option ~~`multiple: true`~~, nous pouvons l'utiliser **comme un token**.

*[Testez le code ici](https://stackblitz.com/edit/conditional-provider?file=src/app/app.module.ts)*

## Mocks

Pour cette partie, nous allons nous concentré à démontrer que ces principes sont utilisés en interne à Angular.

Nous allons utilisé le token d'injection `HTTP_INTERCEPTORS` qui nécessite aussi `multi: true`. Il y a un air de déjà vu avec ce que nous avons mis en place pour le logger n'est-ce pas ?

```ts
@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = request.url;
        const method = request.method;
        return myMock(url, method, request) || next.handle(request);
    }
}

export const mockInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: MockHttpInterceptor,
    multi: true
};

// -----------------

export function myMock(
        url: string, method: string,
        request: HttpRequest<any>
    ): Observable<HttpEvent<any>> | false {

    let result: Observable<HttpEvent<any>> | false = false;

    if ((environment.mock.all || environment.mock.services.getMy)
        && url.includes('api/my') && method === 'GET') {
        result = of(
            new HttpResponse({
                status: 200,
                body: {
                    ...
                }
            })
        );
    }

    return result;
}
```

La différence entre `HttpInterceptor` et notre logger est que les méthode `intercept` s'exécutent en cascade.

Voici comment Angular crée cette cascade plutot que de faire un simple forEach:

```ts
const interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
this.chain = interceptors.reduceRight(
    (next, interceptor) => new HttpInterceptorHandler(next, interceptor),
    this.backend
);

// -----------------

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private next: HttpHandler, private interceptor: HttpInterceptor) {}

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return this.interceptor.intercept(req, this.next);
  }
}

```

Si vous ne conaissez pas la méthode `reduceRight` voici une illustration de ce qu'elle génère:

![reduce-right](/assets/img/angular-posts/reduce-right.png)

Enfin, cet exemple nous propose une troisième maninière d'injecter un provider:
1. `constructor(private myService: MyService)` le plus utilisé
2. `constructor(private @Inject(MY_SERVICE) myService: MyService)` en cas d'utilisation d'un token
3. `this.myService = this.injector.get(MY_SERVICE)` ou `this.myService = this.injector.get(MyService)` via une injection "manuelle"

## Base(Component/Service)

Il vous est probablement déjà venu à l'esprit de faire une classe de "base" (classe parrent) pour des composants ou des services. Cela ne semble pas une être une mauvaise idée, cependant je vous conseil fortement de n'injecter qu'une seule chose dans votre parent: `Injector`.

Pourquoi ? Pour préparer l'avenir de votre application. Si votre "parent" a besoin un jour de plus d'injections, vous n'aurez pas à refactoriser tous ces enfants !

```ts
@Component({})
export abstract class BaseComponent {

    protected myService: MyService;

    constructor(
        injector: Injector
    ) {
        this.myService = injector.get(MyService);
    }

}

// -----------------

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseComponent {

    constructor(
        injector: Injector,
        private myOtherService: MyOtherService
    ) {
        super(injector);
    }

}
  
```

## Authentification

Nous n'allons pas voir jusqu'au bout comment faire une authentification dans une application angular mais nous concentrer sur une posiblité de créer une instance de provider (`APP_INITIALIZER`) non repris par les autres exemples.

```ts
export const authInitializerFactory = (authService: AuthService) => () => authService.initAuthentication();

export const AuthInitializerProvider = {
    provide: APP_INITIALIZER,
    useFactory: authInitializerFactory,
    deps: [ AuthService ],
    multi: true
};
```

Je préfère centraliser toute la logique d'authentification dans un service (`AuthService`) mais celui-ci ne peut pas directement être utilisé en tant que `APP_INITIALIZER`. Nous utilisons alors `useFactory`.

Ce `useFactory` est un peu entre `useValue` et `useClass`. Il permet d'utiliser une valeur tout en pouvant utiliser l'injection de dépendance.

Notez que le tableau `deps: [ AuthService ]` permet de récupérer/injecter une instance à fournir à notre factory `(authService: AuthService) =>`. L'ordre des paramètres de la factory est l'ordre des éléments du tableau `deps`.

## Encore quelques petites explications

### providedIn

Cette option a été ajoutée pour permettre de faire du lazy-loading de provider tout en faisant du singleton.
Malheureusement elle n'a pas encore été ajoutée partout, et n'est utilisable que via l'attribut `@Injectable()`.

Pour démontrer ceci par exemple, nous allons utiliser la dernière possiblité d'injecter un provider: `useExisting`.

```ts
@Injectable({
    providedIn: 'root'
})
export class MyService {
}

// -----------------

providers: [
    MyService,
    {
        provide: 'TEST',
        useExisting: MyService
    }
]
```

En faisant cela, `MyService` est bien injecté dans l'`Injector` principale, mais pas `TEST` ! Même si la valeur derrière est la même, d'autres modules ne connaitrons pas `TEST` alors que tout le monde connaitra `MyService`.

*PS: Oui il y a bien un **string** comme valeur de `provide`. Cela rend évidement impossible le typage fort de ce provider contrairement à l'utilisation d'un `token d'injection`. Je ne l'utilise que quand il est difficile de partager le token entre les modules (qui nécessiterait une librairie ne contenant que ce token par exemple).*

### Résumé méthodes de création de provider

Tout au long de cet article nous avons vu les 4 façon de créer un provider manuellement.

1. `useValue` : Fournir une valeur statique
2. `useClass` : Fournir un type dont Angular va créer une instance
3. `useFactory` : Fournir une méthode permetant de créer la valeur finale du provider (compable DI)
4. `useExisting` : Créer un alias vers un un provider déjà existant

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

