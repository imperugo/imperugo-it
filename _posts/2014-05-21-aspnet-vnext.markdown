---
layout: post
title: "ASP.NET vnext"
description: "Alcune novità sulla futura versione di ASP.NET (Project K)"
date: 2014-05-23
comments: true
categories:
- ASP.NET
tags:
- ASP.NET
- Webapi
- SignalR
- vnext
---

Poco più di una settimana fa [Scott Hanselman](http://www.hanselman.com/blog/IntroducingASPNETVNext.aspx) ha annunciato tramite il suo blog alcune delle più importanti novità che riguardano la prossima release di ASP.NET, conosciuta con il codename **Project K**.

Le novità sono veramente tante: alcune di grande impatto a livello strutturale e di framework, altre che vanno ad impattare sulla scrittura del codice ma in maniera meno invasiva. Ma partiamo con ordine.

La prossima release sarà rilasciata sotto licenza [.NET Foundation](http://www.dotnetfoundation.org/) ed il codice sarà disponibile su [Github](http://www.github.com) [qui](https://github.com/aspnet/home).

Questa release lavorerà side by side con [.NET Native](http://blogs.msdn.com/b/dotnet/archive/2014/04/02/announcing-net-native-preview.aspx) (un compiler .NET che promette performance alla c++ ma con la produttività del c#), [.NET Compiler Platform ("Roslyn")](http://roslyn.codeplex.com/) (compiler-as-a-service) e [Nextgen JIT](http://blogs.msdn.com/b/dotnet/archive/tags/ryujit/) (un JITter ottimizzato per i nuovi processori).

Un'altra importantissima novità riguarda il [CLR](http://it.wikipedia.org/wiki/Common_Language_Runtime) (Common Language Runtime); la prossima release non avrà più una dipendenza da esso come le precedenti release, ma avrà un runtime tutto suo.

Quest'esigenza nasce dalla voglia di incrementare sensibilmente le performance delle applicazioni. Il CLR del .NET è lo stesso per tutte le applicazioni, siano queste Windows Application, Windows Phone o ASP.NET.
Ovviamente questa versatilità ha un costo in termini di memoria e performance, così il vnext utilizzerà il [K Runtime](https://github.com/aspnet/KRuntime) fortemente ottimizzato per il web.

Il CLR sarà ottimizzato in base all'environment dove verrà "deployata" l'applicazione (Cloud, Premise, ...) e verrà rilasciato via NuGet. Quest'ultimo assume un ruolo sempre più importante nel mondo Microsoft: inizialmente era rivolto solo alla distribuzione di librerie .NET, successivamente è stato utilizzato anche per il setup di Visual Studio, per arrivare ora al vnext di ASP.NET.

Rimanendo in tema di CLR, va menzionata anche la nuova modalità di compilazione. Le **dll** ed il compilato delle view Razor non saranno più presenti nella classica folder ***bin*** o nella ***Temporary folder di ASP.NET***, bensì in memoria. Anche questo cambiamento è rivolto esclusivamente alle performance, riducendo drasticamente la lettura/scrittura su disco, lavorando così in RAM.
Questo apre anche un altro scenario di non poco conto, ossia la possibilità di cambiare il codice on-fly (sfruttando Roslyn per la compilazione), senza dover ricaricare **dll** sul server.

A completare quest'importante carrellata di novità si aggiunge la compatibilità con [Mono](http://www.mono-project.com/Main_Page) e la conseguente possibilità di **eseguire le proprie applicazioni ASP.NET vnext anche su sistemi operativi non Microsoft**   (Linux, Unix e Mac OsX).
Questo cambiamento era facilmente intuibile con l'introduzione di [OWIN](http://www.owin.org) e [Katana](http://katanaproject.codeplex.com/), che annunciavano la scissione tra IIS e ASP.NET (vedi slides di una mia presentazione [qui](http://www.slideshare.net/imperugo/owin-and-katana)).

**MVC, Web API** e **SignalR**

Tutti e tre i Framework convergeranno in un unico pacchetto chiamato MVC 6, uniformando così namespace e parte di codice. Di fatto **Controller**, **Action**, **Routing** e **Model** sono più o meno presenti su tutti e tre i Framework, ma su librerie differenti con Namespace differenti.

Ora un Controller, che sia questo un API Controller o un normale Controller MVC, erediterà sempre dalla stessa classe ***Microsoft.AspNet.Mvc.Controller*** (precedentemente si aveva ***System.Web.Mvc.Controller*** per MVC e ***System.Http.Controller*** per le API) ed il codice rimarrà uguale a quello che si è già abituati a scrivere:

***Esempio di un controller MVC***

```csharp

using Microsoft.AspNet.Mvc;

public class HomeController : Controller
{
    public ActionResult Index()
    {
        return View();
    }
}
```

***Esempio di un controller WEB API***

```csharp
using Microsoft.AspNet.Mvc;

public class ValuesController : Controller
{
    // GET /values
    public string Get()
    {
        return "Values";
    }

    // GET /values/1
    public string Get(int id)
    {
        return "Value " + id.ToString();
    }

    // POST /values
    public ActionResult Post()
    {
        return new HttpStatusCodeResult(201);
    }
}
```
***Esempio di una serializzazione JSON***

```csharp
using Microsoft.AspNet.Mvc;

public class MoviesController : Controller
{
    public ActionResult Get()
    {
        var movie = new Movie
        {
            Title = "Maximum Payback", Year = 1990, Genre = "Action"
        };
        return Json(movie);
    }
}
```

È stato introdotto anche il supporto ai **POCO (Plain Old C# Object)** Controllers, in modo da avere classi "pulite" senza la necessità di ereditare da classi base:

```csharp
public class HomeController
{
    private IActionResultHelper resultHelper;

    // La dipendenza arriva tramite il container della DI
    public HomeController(IActionResultHelper resultHelper)
    {
        this.resultHelper = resultHelper;
    }

    public ActionResult Index()
    {
        return this.resultHelper.Json(new { message = "That's a 'Poco' controller!" });
    }
}
```

Quest'ultimo scenario è molto interessante perchè introduce un'altra novità sulla vnext, ossia la **Dependency Injection** (io ne sono addicted) che si potenzia ancor di più e mette a disposizione un set di librerie che "wrappano" i Framework più comuni come [Autofac](http://autofac.org/), [Ninject](http://www.ninject.org/), [Structuremap](http://www.structuremap.net), [Unity](https://unity.codeplex.com/) ed il mio preferito (ed inimitabile) [Windsor](http://www.castleproject.org/projects/windsor/) :smirk:
Su [github](https://github.com/aspnet/DependencyInjection) trovate il sorgente di queste librerie.

Rimanendo sulla parte di sviluppo, le Aree di MVC, che nella versione precedente venivano registrate invocando il metodo

```csharp
AreaRegistration.RegisterAllAreas
```

ora vanno registrate tramite routing ed un apposito attributo, come mostrato di seguito:

Routing:

```csharp
//UseMvc è un extension method legato ad OWIN
app.UseMvc(routes =>
{
    routes.MapRoute(
        name: "AreasRoute",
        template: "{area}/{controller}/{action}");

    routes.MapRoute(
        name: "Default",
        template: "{controller}/{action}/{id?}",
        defaults: new { controller = "Home", action = "Index" });
});
```
Registrazione Area:

```csharp
namespace MySample.Areas.Controllers
{
    [Area("Books")]
    public class HomeController : Controller
    {
        // Books/Home/Index
        public ActionResult Index()
        {
            return View();
        }
    }
}

```

**Alcune risorse utili**

Durante il Tech-ed sono state mostrate alcune di queste funzionalità, come potete vedere nei due video di seguito:

<iframe src="http://channel9.msdn.com/Events/TechEd/NorthAmerica/2014/DEV-B385/player?h=393&w=700" style="height:393px;width:700px;" allowFullScreen frameBorder="0" scrolling="no"></iframe>

<iframe src="http://channel9.msdn.com/Events/TechEd/NorthAmerica/2014/DEV-B411/player?h=393&w=700" style="height:393px;width:700px;" allowFullScreen frameBorder="0" scrolling="no"></iframe>

Di seguito invece trovate una serie di link con degli esempi di applicazioni sviluppate con il vnext:

- [Getting Started with ASP.NET vNext](http://www.asp.net/vnext/overview/aspnet-vnext/overview)
- [MusicStore Sample Application for ASP.NET vNext](http://www.asp.net/vnext/overview/aspnet-vnext/walkthrough-mvc-music-store)
- [BugTracker Sample Application for ASP.NET vNext](BugTracker Sample Application for ASP.NET vNext)

Che dire? Veramente tante novità, bisogna solo trovare il tempo di gioarci un po'.
Have fun.
