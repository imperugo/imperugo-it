---
layout: post
status: publish
published: true
title: SharpTestEx e Visual Studio 2010
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1501
wordpress_url: http://imperugo.tostring.it/blog/post/sharptestex-visual-studio-2010/
date: 2010-05-13 16:45:00.000000000 +01:00
categories:
- .NET
tags:
- Visual Studio 2010
- Unit Test
- SharpTestEx
comments: []
---
<p>Già dal post precedente si capiva che ho avuto problemi con SharpTestEx e <a title="Visual Studio 2010" href="http://tostring.it/tags/archive/visual+studio+2010" target="_blank">Visual Studio 2010</a>. Nello specifico il problema era dovuto al fatto che il Framework di testing cercava di caricare un’assembly non presente nel mio computer, in quanto disponibile con Visual Studio 2008 che non ho avuto ancora il tempo di installare (maggiori info <a title="SharpTestEx - Test fails is Visual Studio 2008 is not installed." href="http://sharptestex.codeplex.com/WorkItem/View.aspx?WorkItemId=5995" rel="nofollow" target="_blank">qui</a>).</p>  <p>Detto ciò, dopo uno scambio di email con il disponibilissimo <a title="Fabio Maulo&#39;s blog" href="http://fabiomaulo.blogspot.com/" rel="nofollow" target="_blank">Fabio Maulo</a>, siamo giunti a due soluzioni possibili:</p>  <ol>   <li>Scaricare e ricompilare il progetto; </li>    <li>Effettuare un redirect del binding; </li> </ol>  <p>Per ovvi motivi di tempo ho optato per la seconda soluzione, già spiegata nel bug di codeplex, ma che riporto qui di seguito:</p>  {% raw %}<pre class="brush: xml;">&lt;runtime&gt;
    &lt;assemblyBinding xmlns=&quot;urn:schemas-microsoft-com:asm.v1&quot;&gt;
        &lt;dependentAssembly&gt;
            &lt;assemblyIdentity name=&quot;Microsoft.VisualStudio.QualityTools.UnitTestFramework&quot; 
                    publicKeyToken=&quot;b03f5f7f11d50a3a&quot; 
                    culture=&quot;neutral&quot; /&gt;
             &lt;bindingRedirect oldVersion=&quot;9.0.0.0&quot;
                    newVersion=&quot;10.0.0.0&quot;/&gt;
        &lt;/dependentAssembly&gt;
    &lt;/assemblyBinding&gt;
&lt;/runtime&gt;</pre>{% endraw %}

<p>Enjoy SharpTestEx.</p>
