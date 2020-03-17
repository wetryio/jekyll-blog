---
author: dgilson
layout: post
title: "Comprendre le ngModel"
date: 2019-09-03 21:09:24
image: '/assets/img/angular-posts/ngmodel.jpg'
description: Sauriez-vous créer votre propre ngModel ?
category: 'documentation'
tags:
- angular
- form
introduction: Sauriez-vous créer votre propre ngModel ?
---

Si vous utilisez les formulaires de type "template driven", vous utilisez également le ngModel, mais savez-vous ce qui se cache derrière ? Sauriez-vous créer votre propre ngModel ?

Dans cet article, nous allons passer en revue sa syntaxe, mais allons également voir qu'il s'agit d'un cas particulier.

## Syntaxe

Dans Angular nous trouvons quatre (3 + l'interpolation) types de bindings:
- **Property binding** `[]`: permet de passer une information d'un composant parent à un composant enfant;
- **Event binding** `()`: permet d'écouter un évènement JavaScript ou de passer une information d'un composant enfant à un composant parent (via un évènement);
- **Two ways binding** `[()]`: permet une synchronisation complète d'une information entre un composant parent et un composant enfant en utilisant les deux types de binding précédemment cités;
- **Interpolation** `{{"{{"}}}}`: permet d'afficher une donnée dans le HTML depuis le TypeScript.

Vous aurez vite fait le lien entre le Two ways binding et le sujet qui nous intéresse ici, le `[(ngModel)]`.

Il est possible de créer son propre property bindig via un `@Input()` comme il est possible de créer son propre event binding via un `@Output()`, mais est-il possible de créer un binding Two way ?

Tout à fait ! Il s'agit en réalité d'une simple combinaison des deux. En effet il nous faut créer un input ainsi qu'un output, mais en respectant une règle: l'output doit avoir le même nom que l'input suivi du mot `Change`. Cela donnera par exemple:
```ts
@Input() myData: string[];
@Output() myDataChange = new EventEmitter<string[]>();
```

Il sera alors possible de l'utiliser dans le parent avec cette syntaxe:
```html
<my-component [(myData)]="data"></my-component>
```

Il est évidemment toujours possible d'écouter l'évènement émis par l'output. Tout comme nous pouvons utiliser le `(ngModelChange)`.
```html
<my-component [(myData)]="data" (myDataChange)="dataHasChange($event)"></my-component>
```

## Utilisation dans un formulaire

Comme dit précédemment, le ngModel n'est utile que dans le cas d'un formulaire "template driven". Pourtant Angular nous laisse le choix d'utiliser `[(ngModel)]` ou `formControlName` pour arriver au même résultat avec les textarea par exemple.

Cela est possible, car en plus d'être un input/output, le `ngModel` est une directive tout comme le `formControlName`.

Voyons alors comment créer notre propre **composant de formulaire** en créer par exemple un `YesNoComponent`. Nous allons nous concentrer sur la partie TypeScript, car c'est la partie qui nous intéresse vraiment.

Pour être compatibles avec les deux types de formulaires, nous allons devoir implémenter le provider `NG_VALUE_ACCESSOR` dans le composant cible.
La syntaxe est un peu particulière, mais très importante.

```ts
@Component({
  selector: 'app-yes-no-component',
  templateUrl: './yes-no-component.html',
  styleUrls: [ './yes-no-component.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YesNoComponent), // Bien mettre la classe du composant lié au décorateur
      multi: true
    }
  ]
})
export class YesNoComponent
```

Il faut alors que notre composant soit compatible avec ce provider. Pour ce faire, nous devons implémenter l'interface `ControlValueAccessor`.

ControlValueAccessor contient 4 fonctions à implémenter:
- `writeValue`: nous fournit la valeur connue par le formulaire (IN);
- `registerOnChange`: nous fournit le "callback" à appeler en cas de changement de valeur (OUT);
- `registerOnTouched`: nous fournit le "callback" à appeler quand le composant doit être considéré comme "touché";
- `setDisabledState` (optionel): permet au formulaire de demander au composant de s'activer ou de se désactiver.

```ts
export class YesNoComponent implements ControlValueAccessor

  items: string[];

  // Fonction temporaire qui sera remplacée par le callback de changement
  onChange = (rating: number) => {};

  // Fonction temporaire qui sera remplacée par le callback de touché
  onTouched = () => {};

  writeValue(data: string[]): void {
    this.items = data;
  }

  registerOnChange(fn: (data: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
```

Et voilà, nous avons créé notre propre "ngModel".

```html
<app-yes-no-component [(ngModel)]="value"></app-yes-no-component>
```

Mais, en prime, nous pouvons utiliser le reactive from.

```html
<form [formGroup]="myForm">
    <app-yes-no-component formControlName="inputName"></app-yes-no-component>
</form>
```

## Conclusion

Angular permet l'utilisation de directives telle que `ngModel` ou `formControlName,` mais nécessite le service `NG_VALUE_ACCESSOR`.

Ce service a déjà été implémenté par Angular pour tous les types de contrôle (input, textarea, select...) built-in.

Si nous voulons utiliser ces directives sur un de nos composants, c'est à nous d'implémenter la logique.

Les composants qui implémentent cette logique s'appellent des "**composants formulaire**" (Custom Form Control).

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
