---
layout: post
title: "Comprendre le ngModel"
date: 2019-09-03 21:09:24
image: ''
description:
category: 'documentation'
tags:
- angular
- form
twitter_text: Sauriez-vous créer votre propre ngModel ?
introduction: Sauriez-vous créer votre propre ngModel ?
github_username: gilsdav
linkedin_username: david-gilson-innovate
---

Si vous utilisez les formulaires de type "template driven", vous utilisez également le ngModel, mais savez-vous se qui se cache dernière ? Sauriez-vous créer votre propre ngModel ?

Dans cet article, nous allons passez en revue ça syntaxe mais alons églament voir qu'il s'agit d'un cas particuler.

## Syntaxe

En angular il y a quatres (3 + l'interpolation) types de bindings:
- Property binding `[]`: permet de passer une information d'un composant parent à un composant enfant;
- Event binding `()`: permet d'écouter un évènement javascript ou de passer une information d'un composant enfant à un composant parent (via un évènement);
- Two way binding `[()]`: permet une synchronisation complete d'une information entre un composant parent et un composant enfant en utilisant les deux types de binding précédement cités;
- Interpolation `{{"{{"}}}}`: permet d'afficher une donnée dans l'HTML depuis le TypeScript.

Vous aurrez vite fait le lien entre le Two way binding et le sujet qui nous intéresse ici, le `[(ngModel)]`.

Il est possible de créer son propre property bindig via un `@Input()` comme il est possible de créer son propre event binding via un `@Output()`, mais est-il possible de créer un binding Two way ?

Tout à fait ! Il s'agit en réalité d'une simple combinaison des deux. En effet il nous faut créer un input ainsi qu'un output mais en respectant une rêgle: l'output doit avoir le même nom que l'input suivit du mot `Change`. Cela donnera par exemple:
```ts
@Input() myData: string[];
@Output() myDataChange = new EventEmitter<string[]>();
```

Il sera alors possible de l'utiliser dans le parent avec cette syntaxe:
```html
<my-component [(myData)]="data"></my-component>
```

Mais il est tout à fait possible, d'en plus, écouter l'évènement émis par l'output. Tout comme nous pouvons utiliser le `(ngModelChange)`.
```html
<my-component [(myData)]="data" (myDataChange)="dataHasChange($event)"></my-component>
```

## Utilisation dans un formulaire

Comme dit précédement, le ngModel n'est utile que dans le cas d'un formulaire "template driven". Pourtant Angular nous laisse le choix d'utiliser `[(ngModel)]` ou `formControlName` pour arriver à la même chose.

Il n'est donc pas si simple de faire un vrai ngModel.

Voyons alors comment créer notre propre **composant de formulaire** en créer par exemple un `YesNoComponent`. Nous allons nous concentrer sur la partie TypeScript car c'est la partie qui nous intéresse vraiment.

Pour être compatible avec les deux types de formulaire, nous devons utiliser ce qui s'appel le `NgValueAccessor`.
La syntaxe est un peu particulière mais très importante.

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

Il faut alors que notre composant soit compatible avec ce "provider". Il nous faut alors implémenter l'interface `ControlValueAccessor`.

ControlValueAccessor contient 4 fontions à implémenter:
- `writeValue`: nous fournis la valeur que le formulaire fournis au composant;
- `registerOnChange`: nous fournis le "callback" à appeller en cas de changement de valeur;
- `registerOnTouched`: nous fournis le "callback" à appeller quand le composant doit être considérer comme "touché";
- `setDisabledState` (optionel): permet au formulaire de demander au composant de s'activer ou de se désacitiver.

```ts
export class YesNoComponent

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
