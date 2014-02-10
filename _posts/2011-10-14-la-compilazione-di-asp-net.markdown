---
layout: post
status: publish
published: true
title: La compilazione di ASP.NET
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1429
wordpress_url: http://imperugo.tostring.it/blog/post/la-compilazione-di-asp.net/
date: 2011-10-14 17:00:00.000000000 +01:00
categories:
- ASP.NET
tags:
- Ottimizzazione
- ASP.NET
- Configurazione
comments: []
---
<p>Il web.config è sicuramente familiare a tutti noi sviluppatori web, ma ci sono alcuni attributi che valgono la scrittura di un post ad hoc.</p>  <p>Oltre al classico connectionstrings e appsettings, in tutti i file di configurazione per applicazioni web esiste una sezione chiamata “<em>compilation</em>”, che permette di impostare un set di parametri che andranno ad influenzare la compilazione delle nostre pagine web.</p>  <p>Alcuni di questi attributi parlano da soli - inutile spiegare a cosa serve l’attributo <em>debub=”true”</em> - , ma ce ne sono altri che spesso si tralasciano o non si conoscono affatto.</p>  <p>Per esempio recentemente ho scoperto l’esistenza dell’attributo <em>optimizeCompilations</em> che, se impostato su <em>true</em>, può aumentare in maniera significativa i tempi di compilazione delle pagine web (maggiori informazioni qui <a href="http://blogs.msdn.com/b/davidebb/archive/2009/04/15/a-new-flag-to-optimize-asp-net-compilation-behavior.aspx">http://blogs.msdn.com/b/davidebb/archive/2009/04/15/a-new-flag-to-optimize-asp-net-compilation-behavior.aspx</a>).</p>  <p>Anche l’attributo <em>batch</em> ha lo scopo di migliorare le performance di compilazione ma, a differenza dell’attributo <em>optimizeCompilations</em>, questo è impostato di default su true, quindi possiamo omettere questo attributo nel nostro file di configurazione.</p>  <p>Un altro interessante attributo è <em>numRecompilesBeforeAppRestart</em> che, se impostato con dei valori corretti, può evitare alcuni noiosi restart dell’applicativo.</p>  <p>In ogni caso il mio preferito resta l’attributo <em>tempDirectory</em> <img style="border-bottom-style: none; border-left-style: none; border-top-style: none; border-right-style: none" class="wlEmoticon wlEmoticon-smile" alt="Smile" src="http://tostring.it/UserFiles/imperugo/wlEmoticon-smile_2_11.png" />. Questo attributo permette di specificare la directory dove verranno salvati i file temporanei di compilazione.     <br />Il perché mi piace particolarmente questo attributo è dovuto al fatto che uso un RAM Disk (personalmente uso questo <a href="http://memory.dataram.com/products-and-services/software/ramdisk">http://memory.dataram.com/products-and-services/software/ramdisk</a>) e, impostando la compilazione dei file di ASP.NET su questo particolare drive, si ottengono delle performance notevoli, specie in fase di startup.</p>  <p>Concludo con un pezzo della mia configurazione :</p>  {% raw %}<pre class="brush: xml;">&lt;compilation tempDirectory=&quot;G:\aspnet.temp\&quot; 
                    optimizeCompilations=&quot;true&quot; 
                    batch=&quot;true&quot; 
                    debug=&quot;true&quot; 
                    defaultLanguage=&quot;c#&quot; 
                    numRecompilesBeforeAppRestart=&quot;250&quot; 
                    targetFramework=&quot;4.0&quot;&gt;
    &lt;assemblies&gt;
        &lt;add assembly=&quot;System.Web.Abstractions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot; /&gt;
        &lt;add assembly=&quot;System.Web.Helpers, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot; /&gt;
        &lt;add assembly=&quot;System.Web.Routing, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot; /&gt;
        &lt;add assembly=&quot;System.Web.Mvc, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot; /&gt;
        &lt;add assembly=&quot;System.Web.WebPages, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot; /&gt;
    &lt;/assemblies&gt;
&lt;/compilation&gt;</pre>{% endraw %}

<p>Ciauz!</p>
