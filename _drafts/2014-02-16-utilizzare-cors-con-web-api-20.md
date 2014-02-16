---
layout: post
title: "Utilizzare CORS con Web API 2.0"
description: "WEB API 2.0 introducono il supporto alle chiamate CORS, in questo articolo vediamo cosa significa e come usarlo al meglio"
categories:
- WEB API
tags:
- WebAPI
- CORS
comments: true
---

Con la versione 2.0 delle Web API è stato introdotto il supporto alle richieste crosso dominio, più comunemente chiamate CORS (Cross-origin resource sharing).

Normalmente non è possibile effettuare richieste HTTP via Javascript da un source il cui dominio è differente da quello di dell’endpoint chiamato. Tradotto in soldoni, se il nostro Javascript si trova su http://www.miosito.it/Index.html non è possibile chiedere informazioni al sito **http://www.tuosito.it/**.

I motivi sono semplicemente di sicurezza per impedire che qualcuno possa attingere ad informazioni personali tramite un JS “*maligno*”.

Chiarito il perché di questo blocco, a volte può risultare necessario effettuare questo tipo di chiamate e le strade possono essere diverse a seconda dei browser che si vogliono supportare. La prima ed universale soluzione è comunicare via [JSONP](http://en.wikipedia.org/wiki/JSONP). Questo approccio è molto facile da utilizzare e tutti i browser lo supportano, l’unico problema è il verb della chiamata http che è solo in GET, quindi con il limite dei caratteri utilizzabili in querystring.

Se vogliamo quindi inviare parecchie informazioni non possiamo utilizzare questo approccio (una soluzione in questo caso è “proxare” lato server la chiamate JS e ribaltarla all’endpoint).

Un altro approccio è l’utilizzo del CORS che da titolo a questo articolo. Se il destinatario della richiesta (il server nel nostro esempio) vuole, può accettare richieste da domini differenti e scegliere lui quali accettare. Ovviamente per far ciò è necessario che il browser permetta questo tipo di chiamata cosa che purtroppo non è del tutto scontata. Internet Explorer in questo è stato fermo per molto tempo e, solo dalla versione 10, ha introdotto il supporto completo a questo meccanismo di comunicazione.

La tabella seguente ([http://caniuse.com/cors](fonte)) mostra il supporto al CORS dai vari browsers

![CORS SUPPORT TABLE](/images/cors.png)

> ci sono dei workaround che permetteno di sfruttare CORS anche con IE 8/9 ma con alcuni limiti sui VERB della chiamata (maggiori info [qui](http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx) )

Ora che abbiamo chiarito cos’è il CORS è arrivato il momento di configurarlo utilizzando uno tra questi browsers IE10/11, Chrome (tutte le versioni), Firefox dalla 3.5+ e Safati 4+.

A questo punto abbiamo bisogno di due progetti, uno per il client ed uno per il server e devono essere “hostati” su domini differenti (nel mio esempio ho sfruttato i websites di azure, quindi ho [http://imperserver.azurewebsite.net](http://imperserver.azurewebsite.net) e [http://imperclient.azurewebsite.net](http://imperserver.azurewebsite.net)).

## Applicazione Server

Come prima cosa nel Global.asax.cs è necessario abilitare il CORS per i domini che riteniamo "**trusted**", quindi nel mio esempio *imperclient.azurewebsite.net* 

Se avete utilizzato il template di default di Visual Studio, il vostro golbal.asax.cs dovrebbe essere più o meno come questo.


```c#
public class WebApiApplication : System.Web.HttpApplication{	protected void Application_Start()	{		AreaRegistration.RegisterAllAreas();		GlobalConfiguration.Configure(WebApiConfig.Register);		FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);		RouteConfig.RegisterRoutes(RouteTable.Routes);		BundleConfig.RegisterBundles(BundleTable.Bundles);	}}
```

Da qui il file da modificare è quello contenente la configurazione delle Web API, quindi "WebApiConfig.cs" contenuto nella folder "App_Start".


> N.B.: Prima di moficare il codice è necessario installare il corretto NuGet Packages, di fatto il template di Visual Studio delle Web API "as is" non contiene il package per il CORS che va quindi installato manualmente.


{% raw %}
<div class="nuget-badge">
    <code>PM&gt; Install-Package Microsoft.AspNet.Cors</code>
</div> 
{% endraw %}
