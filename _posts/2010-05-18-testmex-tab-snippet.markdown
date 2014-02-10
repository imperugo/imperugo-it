---
layout: post
status: publish
published: true
title: Testmex =&gt; tab (snippet)
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1497
wordpress_url: http://imperugo.tostring.it/blog/post/testmex-tab-snippet/
date: 2010-05-18 16:30:00.000000000 +01:00
categories:
- .NET
tags:
- Visual Studio
- Testing
- Unit Test
- Snippet
- SharpTestEx
comments: []
---
<p>In questo periodo sto scrivendo test in continuazione, un po’ perchè sto leggendo il libro di <a href="http://weblogs.asp.net/rosherove/">Roy Osherove</a> “<a href="http://www.amazon.com/Art-Unit-Testing-Examples-Net/dp/1933988274/ref=sr_1_1?ie=UTF8&amp;s=books&amp;qid=1274130780&amp;sr=8-1">The Art of Unit Test</a>”, ed un po’ perchè sto cercando di colmare un gap su dexter. Chi mi frequenta pensa che ormai sono vittima del testing in quanto non faccio altro che parlare di unit test, di come scrivere test, etc., e devo ammettere che un po’ è anche vero :). </p>  <p>Il tutto è partito da una certa <a href="http://blogs.ugidotnet.org/pape/Default.aspx">persona</a> (un po’ contabile ed un po’ commercialista :D) che mi ha spronato più e più volte a guardare lo sviluppo anche da una prospettiva differente, ossia da quella del testing...per questo&#160; non posso che ringraziarlo, anche se per assimilare bene i concetti e metterli in pratica ho impiegato un po’ di tempo, ma credo che sia del tutto normale. </p>  <p>Parlando dell’aspetto pragmatico dei test scritti in questi giorni, posso dire che hanno una cosa che li contraddistingue, ossia la presenza di <a href="http://sharptestex.codeplex.com/">SharpTestEx</a> e <a href="http://www.ayende.com/projects/rhino-mocks.aspx">RhinoMock</a>; di fatto mi sono creato uno snippet che mi creasse a sua volta un metodo con la struttura secondo la mia nomenclatura preferita e, nel caso mi aspettassi un’eccezione dal test, mi implementasse anche il controllo della stessa.    <br />Per farla breve tutti i miei test devono avere un nome leggibilissimo, che rispecchi il più possibile i tre aspetti base, quindi far capire cosa si sta testando, con quali valori e cosa ci si aspetta: </p>  <p><em><b>“MethodUnderTest_Scenario_ExpectedBehavior”</b></em></p>  <p>In un esempio pratico in cui si voglia testare un metodo “GetList”, passando un valore negativo al parametro “pageSize” e aspettandosi dal metodo da testare un’eccezione, il nome del test dovrebbe essere una cosa tipo: “<em><b>GetList_WithNegativePageSize_ShouldThrowArgumentOutOfRangeException</b></em>” che, tradotto in soldoni, dovrebbe essere implementato più o meno così:</p>  <p></p>  <p></p>  {% raw %}<pre class="brush: csharp;">[TestMethod]
public void GetList_WithNegativePageIndex_ShouldThrowNewArgumentOutOfRangeException()
{
    //TODO:Arrage

    //TODO:Act

    //TODO:Assert
    ActionAssert.Throws&lt;ArgumentOutOfRangeException&gt;(() =&gt; something).ParamName.Should().Be.EqualTo(&quot;pageSize&quot;);
}</pre>{% endraw %}

<p>Purtroppo anche con il copia/incolla può essere scomodo ripetere ogni volta questo codice, così mi sono deciso a scrivere uno snippet che, digitando !testmex + tab!, mi crea automaticamente lo scheletro. </p>

<p>Di seguito lo snippet che possiamo copiare ed incollare direttamente nell’apposita folder</p>

<p></p>

{% raw %}<pre class="brush: xml;">&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot;?&gt;
&lt;CodeSnippets xmlns=&quot;http://schemas.microsoft.com/VisualStudio/2005/CodeSnippet&quot;&gt;
    &lt;CodeSnippet Format=&quot;1.0.0&quot;&gt;
        &lt;Header&gt;
            &lt;SnippetTypes&gt;
                &lt;SnippetType&gt;Expansion&lt;/SnippetType&gt;
            &lt;/SnippetTypes&gt;
            &lt;Title&gt;Test Method With Exception Management&lt;/Title&gt;
            &lt;Shortcut&gt;testmex&lt;/Shortcut&gt;
            &lt;Description&gt;Code snippet for a test method with Exception &lt;/Description&gt;
            &lt;Author&gt;Ugo Lattanzi&lt;/Author&gt;
        &lt;/Header&gt;
        &lt;Snippet&gt;
            &lt;Imports&gt;
                &lt;Import&gt;
                    &lt;Namespace&gt;SharpTestsEx&lt;/Namespace&gt;
                &lt;/Import&gt;
                &lt;Import&gt;
                    &lt;Namespace&gt;Rhino.Mocks&lt;/Namespace&gt;
                &lt;/Import&gt;
            &lt;/Imports&gt;
            &lt;References&gt;
                &lt;Reference&gt;
                    &lt;Assembly&gt;SharpTestsEx.MSTest.dll&lt;/Assembly&gt;
                    &lt;Assembly&gt;Rhino.Mocks.dll&lt;/Assembly&gt;
                &lt;/Reference&gt;
            &lt;/References&gt;
            &lt;Declarations&gt;
                &lt;Literal&gt;
                    &lt;ID&gt;MethodName&lt;/ID&gt;
                    &lt;ToolTip&gt;Replace with the name of the test method&lt;/ToolTip&gt;
                    &lt;Default&gt;MethodName&lt;/Default&gt;
                &lt;/Literal&gt;
                &lt;Literal&gt;
                    &lt;ID&gt;StateUnderTest&lt;/ID&gt;
                    &lt;ToolTip&gt;Replace with the state under test name&lt;/ToolTip&gt;
                    &lt;Default&gt;StateUnderTest&lt;/Default&gt;
                &lt;/Literal&gt;
                &lt;Literal&gt;
                    &lt;ID&gt;ExpectedParameterName&lt;/ID&gt;
                    &lt;ToolTip&gt;Replace with the expected exception parameter name&lt;/ToolTip&gt;
                    &lt;Default&gt;ExpectedParameterName&lt;/Default&gt;
                &lt;/Literal&gt;
                &lt;Literal&gt;
                    &lt;ID&gt;ExceptionType&lt;/ID&gt;
                    &lt;ToolTip&gt;Exception type&lt;/ToolTip&gt;
                    &lt;Function&gt;SimpleTypeName(global::System.Exception)&lt;/Function&gt;
                &lt;/Literal&gt;
            &lt;/Declarations&gt;
            &lt;Code Language=&quot;csharp&quot;&gt;
                &lt;![CDATA[[TestMethod]
          public void $MethodName$_$StateUnderTest$_ShouldThrowNew$ExceptionType$()
        {
            //TODO:Arrage
            
            //TODO:Act
            
            //TODO:Assert
            ActionAssert.Throws&lt;$ExceptionType$&gt; ( () =&gt; something ).ParamName.Should().Be.EqualTo ( &quot;$ExpectedParameterName$&quot; );
          }]]&gt;
            &lt;/Code&gt;
        &lt;/Snippet&gt;
    &lt;/CodeSnippet&gt;
&lt;/CodeSnippets&gt;</pre>{% endraw %}

<p>enjoy the snippet!</p>

<p>Ciauz</p>
