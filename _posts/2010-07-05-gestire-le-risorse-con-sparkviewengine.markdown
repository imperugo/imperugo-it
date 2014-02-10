---
layout: post
status: publish
published: true
title: Gestire le risorse con SparkViewEngine
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1482
wordpress_url: http://imperugo.tostring.it/blog/post/gestire-le-risorse-con-sparkviewengine/
date: 2010-07-05 16:45:00.000000000 +01:00
categories:
- ASP.NET
tags:
- ViewEngine
- SparkViewEngine
- Dexter
comments: []
---
<p>Già nel post <a title="SparkViewEngine Kick Off" href="http://tostring.it/blog/post/sparkviewengine-kick-off" target="_blank">precedente</a> ho introdotto <a title="SparkViewEngine" href="http://sparkviewengine.com/" rel="nofollow" target="_blank">SparkViewEngine</a>; in questo voglio mostrare un’interessante feature che apre diversi scenari di mantenibilità e di “servizio”, come nel caso di <a title="Dexter Blog Engine Category" href="http://www.imperugo.tostring.it/categories/archive/Dexter" target="_blank">Dexter</a> che mostrerò più avanti.</p>  <p>Sicuramente ci sarà capitato molto spesso di dover “hostare” le nostre applicazioni all’interno di una virtual directory, e magari di doverle spostare successivamente sulla root di un sito e viceversa: spesso questo risulta scomodo in quanto può comportare alcune modifiche ai percorsi dei file di risorse (immagini, css, javascript, etc). Se proviamo a guardare il lato pratico, un codice html simile a questo:</p>  <pre class="brush: xml;">&lt;link type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;/Styles/Site.css&quot; /&gt;</pre>

<p>non sarebbe più valido nel caso il sito fosse spostato all’interno di una virtual directory, e dovrebbe diventare una cosa del tipo: 
  <br />

  <br /></p>

<pre class="brush: xml;">&lt;link type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;/MyVirtualDirectory/Styles/Site.css&quot; /&gt;</pre>

<p>&#160;</p>

<p>Ovviamente il problema è risolvibile sfruttando un helper che effettua il resolve dell’url, con il conseguente svantaggio di aggiungere codice all’interno del markup, rendendo difficile un eventuale refactoring; a questo si aggiunge la perdita in leggibilità del codice html. Un’altra soluzione è far gestire i percorsi delle risorse a Spark (devo dire che lo fa egregiamente e con estrema semplicità) : in primis è necessario modificare il web.config aggiungendo la sezione di Spark, come mostrato di seguito:</p>

<pre class="brush: xml;">    &lt;section name=&quot;spark&quot; type=&quot;Spark.Configuration.SparkSectionHandler, Spark&quot; requirePermission=&quot;false&quot;/&gt;
&lt;/configSections&gt;

&lt;spark&gt;
    &lt;compilation debug=&quot;false&quot;/&gt;
    &lt;pages automaticEncoding=&quot;true&quot;&gt;
        &lt;namespaces&gt;
            &lt;add namespace=&quot;System&quot; /&gt;
            &lt;add namespace=&quot;System.Web&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc.Ajax&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc.Html&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Routing&quot; /&gt;
            &lt;add namespace=&quot;System.Linq&quot; /&gt;
        &lt;/namespaces&gt;
        &lt;resources&gt;
            &lt;add match=&quot;~/Scripts&quot; location=&quot;/Resource/Scripts&quot; /&gt;
            &lt;add match=&quot;~/Styles&quot; location=&quot;/Resource/Styles&quot; /&gt;
            &lt;add match=&quot;~/Images&quot; location=&quot;/Resource/Images&quot; /&gt;
            &lt;add match=&quot;~/Media&quot; location=&quot;/Resource/Media&quot; /&gt;
        &lt;/resources&gt;
    &lt;/pages&gt;
&lt;/spark&gt;</pre>

<p>Come potete intuire la sezione resource è quella più interessante, e ci permette di specificare dove sono presenti i files delle risorse: quindi, lato view, è sufficiente utilizzare il tilde per indicare il percorso iniziale dell’applicativo, poi ci penserà spark in fase di rendering a sostituirlo con quanto specifica nel file di configurazione. 
  <br />Se proviamo a renderizzare questo codice html con i settaggi sopra specificati, il rendering finale dovrebbe essere questo: 

  <br />

  <br /></p>

<pre class="brush: xml;">&lt;link type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;~/Styles/Site.css&quot; /&gt;

&lt;link type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;/Resouce/Styles/Site.css&quot; /&gt;</pre>

<p>&#160;</p>

<p>Ovviamente questo può aprire un ulteriore scenario, ossia offrire la possibilità a chi sviluppa la parte html di utilizzare alcune CDN (google, Microsoft, etc) senza doverne conoscere il percorso; di fatto, chi vuole sviluppare una skin per dexter e vuole utilizzare la cdn di Microsoft per <a title="jQuery" href="http://tostring.it/Tags/Archive/JQuery" target="_blank">jQuery</a>, può semplicemente scrivere questo:</p>

<pre class="brush: xml;">&lt;script src=&quot;~/Scripts/CDN/jQueryTools/1.2.2/jquery.tools.min.js&quot; type=&quot;text/javascript&quot; language=&quot;javascript&quot;&gt;&lt;/script&gt;</pre>

<p>Così facendo si può cambiare in un qualsiasi momento la CDN da utilzzare, o scegliere di hostare il file con la libreria su un proprio server. 
  <br />Di seguito riporto il blocco di configurazione di spark in dexter, che mostra le varie CDN supportate:</p>

<pre class="brush: xml;">&lt;spark&gt;
    &lt;compilation debug=&quot;false&quot;/&gt;
    &lt;pages automaticEncoding=&quot;true&quot;&gt;
        &lt;namespaces&gt;
            &lt;add namespace=&quot;System&quot; /&gt;
            &lt;add namespace=&quot;System.Web&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc.Ajax&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Mvc.Html&quot; /&gt;
            &lt;add namespace=&quot;System.Web.Routing&quot; /&gt;
            &lt;add namespace=&quot;System.Linq&quot; /&gt;
            &lt;add namespace=&quot;Dexter.Web.Site.Models.Blog&quot; /&gt;
            &lt;add namespace=&quot;System.Collections.Generic&quot; /&gt;
            &lt;add namespace=&quot;Dexter.Web.Mvc.Helpers&quot; /&gt;
            &lt;add namespace=&quot;Dexter.Core.Configuration&quot; /&gt;
            &lt;add namespace=&quot;Dexter.Core.Concrete&quot; /&gt;
            &lt;add namespace=&quot;Dexter.Web.Mvc.Controls&quot; /&gt;
        &lt;/namespaces&gt;
        &lt;resources&gt;
            &lt;add match=&quot;~/Scripts/CDN/Microsoft&quot; location=&quot;http://ajax.microsoft.com/ajax&quot;/&gt;                 &lt;!-- http://www.asp.net/ajaxlibrary/cdn.ashx --&gt;
            &lt;add match=&quot;~/Scripts/CDN/Google&quot; location=&quot;http://ajax.googleapis.com/ajax/libs&quot;/&gt;                 &lt;!-- http://code.google.com/apis/ajaxlibs/documentation/#AjaxLibraries --&gt;
            &lt;add match=&quot;~/Scripts/CDN/jQueryTools&quot; location=&quot;http://cdn.jquerytools.org&quot;/&gt;                    &lt;!-- http://flowplayer.org/tools/download/index.html --&gt;
            &lt;add match=&quot;~/Scripts&quot; location=&quot;~/Scripts&quot; /&gt;
            &lt;add match=&quot;~/Styles&quot; location=&quot;~/Styles&quot; /&gt;
            &lt;add match=&quot;~/Images&quot; location=&quot;~/Images&quot; /&gt;
            &lt;add match=&quot;~/Media&quot; location=&quot;~/Media&quot; /&gt;
        &lt;/resources&gt;
    &lt;/pages&gt;
&lt;/spark&gt;</pre>

<p>Ciauz</p>
