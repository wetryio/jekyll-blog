µµ---

date: 2021-01-07 00:03:34
layout: post
title: "Pourquoi faire du TDD"
subtitle: 
description: Mais pourquoi écrire les tests avant le code ?
image: TODO
category: 'bonne-pratique'
tags: 
- bonne pratique
author: mscolas
---

# Pourquoi faire du TDD ?

Il y a deux types de projets. Les projets avec des tests et les projets sans. Même si les projets avec tests sont majoritairement plus avantageux grâce à leur maintenabilité plus élevée, il subsiste encore des lacunes dans le filet de sécurité que sont les tests unitaires.

Nous verrons dans cet article les avantages du TDD par rapport aux tests écrits après le développement.
Tout au long de cet article, nous comparerons ces deux méthodes. Nous excluons l'apocalypse d'une application sans tests.

Si vous êtes intéressés par un exemple de TDD, je vous renvoie vers [la quick remote session du 27 janvier.](https://www.meetup.com/fr-FR/micbelgique/events/275210446/)

## En bref, c'est quoi le TDD ?

Le sujet du jour n'est pas comment faire du TDD, mais quels en sont ses bénéfices. Mais revoyons vite les règles avant de démarrer. Voici la version de Martin Fowler : 

* Écrivez un test pour la prochaine portion de fonctionnalité que vous voulez ajouter.
* Écrivez le code fonctionnel jusqu'à ce que le test passe.
* Réécrivez l'ancien et le nouveau code pour le structurer correctement.
 
## Vitesse de développement augmentée

Sans TDD, il est naturel de tester nos derniers changements à la main. Vous venez de faire un agrégateur de données ? Il parait intuitif de tester un scénario en situation réelle. Mais le temps engagé dans le test manuel est sous-optimal. Vous lancez l'application, vous arrivez sur la page recherchée et vous introduisez les données de tests : ces étapes sont chronophages. De plus, ce test manuel certifie (ou non) la validité de votre code à l'instant T. À la prochaine itération du développement, vous perdez la certitude que ce dernier code fonctionne encore.

Alors que vous écrivez les tests unitaires en fin de développement, vous dépensez quand même du temps à écrire des tests. Bref, vous avez investi deux fois plus de temps dans le test de l'application.

Au lieu de tester manuellement, prenez quelques secondes pour configurer votre scénario de test, investissez ce temps dans un test automatique. Vous certifiez que votre application fonctionne à l'instant T et à n'importe quelle étape du futur. Ainsi, vous investissez qu'une seule fois du temps dans les tests.

## Un meilleur design

Pendant la boucle de TDD, nous écrivons un test qui ne compile pas. Implicitement, vous écrivez votre classe/fonction dans la forme désirée.

Imaginez un jeu de boxe avec des personnages ayant des caractéristiques différentes. Voici le résultat après deux itérations :

```csharp
[Fact]
public void CreateBoxerWith120PointOfLife() {
    var myBoxer = Boxer.CreateWithLife(120);

    // Cette ligne est ajoutée lors de la 2e itération.
    Assert.Equal(120, myBoxer.Life);
}
```

Votre code ne compile pas car aucune classe Boxer existe !

Ecrivons la première classe :

```csharp
public class Boxer {

    // Cette ligne est ajoutée lors de la 2e itération.
    public int Life => 120;
    public static Boxer CreateWithLife(int life) {
        return new Boxer();
    }
}
```

Voici votre premier test vert. Le Boxer est créé.
Toutefois, le développement est incomplet. La vie est écrit en dur, le paramètre est ignoré, etc.

Je saute volontairement quelques étapes. Si vous voulez en savoir plus sur comment faire du TDD, [rejoignez le QRS du 27 janvier.](https://www.meetup.com/fr-FR/micbelgique/events/275210446/)

Après quelques itérations, voici le dernier état :

```csharp
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

Cet exemple est volontairement overengineered. Toutefois il a tout à fait sa place dans des applications plus complexes.

Les points à observer sont :
* Le builder est créé depuis le Boxer. Les prochains développeurs sont invités à dérouvrir le builder via le boxer. C'est une cohésion haute.
* La création d'un objet est dissocié de son utilisation. C'est un couplage faible.
* Les edgy cases sont testés. ...

## Coverage des edgy cases

Ce que j'entends par les edgy cases sont les cas à la limite du changement de comportement. C'est un oubli que je vois fréquemment chez ceux qui écrivent les tests après le code. Il arrive que des cas extraordinaires ne sont pas imaginés pendant l'écriture des tests.

Imaginez le jeu video Civilization. Quand une nation devient une démocratie, elle perd 2 d'agressivité.

```csharp
    public enum Politique
    {
        Totalitarisme,
        Democratie
    }

    public class Nation
    {
        public Politique CurrentPolitique { get; private set; }
        public uint Aggressiveness { get; private set; }
        
        public Nation(Politique currentPolitique, uint aggressiveness)
        {
            this.CurrentPolitique = currentPolitique;
            this.Aggressiveness = aggressiveness;
        }

        public void ApplyPolitique(Politique pol)
        {
            if (this.CurrentPolitique == Politique.Totalitarisme && pol.Equals(Politique.Democratie))
            {
                this.Aggressiveness -= 2;
                this.CurrentPolitique = pol;
            }
        }
    }

    public class PolitiqueTests
    {
        [Fact]
        public void TestPolitiqueChange()
        {
            var nation = new Nation(Politique.Totalitarisme, 5);
            nation.ApplyPolitique(Politique.Democratie);
            Assert.Equal((uint)3, nation.Aggressiveness);
        }
    }
```

Tout va bien, excepté pour Gadhi qui a une aggressivité de base de 1. Ce qui lui fait basculer à une valeur...négative ? Non, car le premier jeu Civilization utilisait des entiers non signés sur un seul octet. [Ce qui apportait sa valeur à 255](https://www.jeuxvideo.com/dossier/1083948/ces-personnes-celebres-detournees-par-le-jeu-video/1083952.htm)

Quand nous écrivons les tests après le développement, nous cherchons à augmenter la couverture de ligne de code. C'est facile à mesurer et le pourcentage est un niveau que tout le monde comprend. Il est naturel d'en faire son objectif.

Mais le TDD cherche plutôt à couvrir les fonctionnalités. En étant concentré en même temps sur les tests ainsi que sur le développement à tour de rôle, ce genre de cas exceptionnel nous apparait plus facile à détecter. Même si le TDD n'empêche pas systématiquement ce genre d'oubli, il permet toutefois de le repérer plus facilement.

Je ne peux que vous recommander la partie 3 de [Test-Driven Development: By Example (Kent Beck)](https://www.amazon.fr/Test-Driven-Development-Kent-Beck/dp/0321146530) pour les différentes techniques à utiliser lors du TDD.

```csharp
public class PolitiqueTests
    {
        [Theory]
        [InlineData(5, 3)]
        [InlineData(3, 1)]
        [InlineData(2, 0)]
        [InlineData(1, 0)]
        public void Test(uint start, uint expected)
        {
            var nation = new Nation(Politique.Totalitarisme, start);
            nation.ApplyPolitique(Politique.Democratie);
            Assert.Equal(expected, nation.Aggressiveness);
        }
    }
```

## Une plus grande motivation pour le développeur

Transformer un test rouge en un test vert a quelque chose de jouissif. Le vert nous envoie un signal de réussite, motivant le développeur à en faire plus et à le faire bien. Un développeur démotivé cherchera à compléter ses tâches. Un développeur motivé a l'envie de fournir un travail de qualité.

## Pas de silver bullet

Les tests certifient l'absence d'un ensemble de bugs. Pas que le code est correct. Malheureusement rien n'est magique. Même si le TDD permet une couverture plus cohérente, un feedback rapide et limite souvent les surprises et les bugs, parfois les erreurs de programmation passent. Au final, tous les tests et le code produit viennent de l'homme et l'erreur est humaine.

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

