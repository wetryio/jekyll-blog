---
date: 2020-01-07 00:03:34
layout: post
title: "Pourquoi faire du TDD"
subtitle: 
description:
image:
optimized_image:
category:
tags:
author:
---

# Pourquoi faire du TDD

Il y a deux types de projets. Les projets avec des tests, et les projets sans. Même si les projets avec sont majoritairement plus avantageux, il subsiste encore des lacunes dans le fillet de sécurité que sont les tests unitaires.

Nous verrons dans cet article les avantages du TDD par rapport aux tests écrits après le développement.
Tout au long de cet article, nous comparerons ces deux méthodes. Nous excluons l'apocalypse d'une application sans tests.

Si vous êtes intéressés par un exemple de TDD, je vous renvoie vers la quick remote session du 27 janvier 
<!-- TODO ajouter QRS link -->

## En bref, c'est quoi le TDD

Le sujet de ce jour n'est pas comment faire du TDD, mais quels sont ses bénéfices. Mais revoyons vite fait ses règles avant de démarrer. [L'article wikipedia les récite convenablement](https://fr.wikipedia.org/wiki/Test_driven_development) : 

* Vous ne pouvez pas écrire de code de production tant que vous n'avez pas écrit un test unitaire qui échoue.
* Vous ne pouvez pas écrire plus d'un test unitaire que nécessaire pour échouer, et ne pas compiler revient à échouer.
* Vous ne pouvez pas écrire plus de code de production que nécessaire pour que le test unitaire actuellement en échec réussisse.

// TODO finir paragraphe
 
## Vitesse de développement augmenté

Sans TDD, il est naturel de tester nos derniers changements à la main. Vous venez de faire un aggregateur de données, un rapport ? Il parait intuitif de tester un scénario en situation réel. Mais le temps engagé dans le test manuel est sous optimal. Ce test certifie (ou non) la validaté de votre code à l'instant T.

Ensuite, vous écriverez les tests unitaires en fin de développement. Bref, vous avez investit deux fois du temps dans le test de l'application.

Au lieu de tester manuellement, prenez les quelques secondes de setup, investissez ce temps dans un test automatique. Vous certifiez que votre application fonctionne à l'instant T, et à n'importe quelle étape du futur.

## Un meilleur design

Pendant la boucle de TDD, nous écrivons un test qui ne compile pas. Implicitement, vous écrivez votre class/fonction dans la forme désiré.

Imaginez un jeu de boxe, avec des personnages avec des caractéristiques différents.

```C#
[Fact]
public void CreateBoxerWith120PointOfLife() {
    var myBoxer = Boxer.CreateWithLife(120);
}
```

Votre code ne compile pas car aucune classe Boxer existe !

Ecrivons la première classe

```C#
public class Boxer {
    public static Boxer CreateWithLife(int life) {
        return new Boxer();
    }
}
```

Voici votre premier test vert. Le Boxer est créé.
Toutefois, tellement de choses sont incomplète. Je saute volontairement quelques étapes. Si vous voulez en savoir plus sur comment faire du TDD, rejoignez le QRS du 27 janvier.

Après quelques itérations, voici le dernier état

```C#
    public class Boxer
    {
        public int Life { get; private set; }
        public int Power { get; private set; }

        public Boxer(int life, int power)
        {
            Life = life;
            Power = power;
        }

        public static BoxerBuilder NewBuilder() {
            return new BoxerBuilder();
        }
    }

    public class BoxerBuilder
    {
        private int life;
        private int power;

        public BoxerBuilder()
        {
            this.life = 100;
            this.power = 10;
        }

        public BoxerBuilder WithLife(int life)
        {
            this.life = life;
            return this;
        }

        public BoxerBuilder WithPower(int power)
        {
            this.power = power;
            return this;
        }

        public Boxer Build()
        {
            return new Boxer(this.life, this.power);
        }
    }

    public class BoxerTest
    {
        [Fact]
        public void CreateBoxerWith120PLifeAnd15Power()
        {
            var boxer = Boxer.NewBuilder()
                            .WithPower(15)
                            .WithLife(120)
                            .Build();
            Assert.Equal(120, boxer.Life);
            Assert.Equal(15, boxer.Power);
        }
    }
```

Les points à observer sont :
* Le builder est créé depuis le Boxer. Les prochaines développeurs sont invités à dérouvrir le builder via le boxer
* La création d'un objet est dissocié de son utilisation.
* Les cas edgy sont testés. ...

## Coverage des edgy cases

Ce que j'entends pas les edgy cases sont les cas à la limite du changement de comportement. C'est un oublie que je vois fréquemment chez ceux qui écrivent les tests après le code. Le TDD permet de les couvrir puisque nous ne sommes pas autorisé à écrire du code

Imaginez que la frappe d'un boxer 

// TODO finir paragraphe

## Pas de silver bullet

* Les tests certifient l'absence d'un ensemble de bug. Pas que le code est correct.

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

