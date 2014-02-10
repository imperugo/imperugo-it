---
layout: post
status: publish
published: true
title: Scoperta una vulnerabilità su ASP.NET
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1468
wordpress_url: http://imperugo.tostring.it/blog/post/scoperta-una-vulnerabilit%c3%a0-su-aspnet/
date: 2010-09-21 16:15:00.000000000 +01:00
categories:
- ASP.NET
tags:
- Security
- ASP.NET
- Configurazione
comments: []
---
<p>Tramite il blog di <a title="Scott Guthrie&#39;s Blog" href="http://weblogs.asp.net/scottgu/" rel="nofollow" target="_blank">Scott Guthrie</a>, è stata presentata una soluzione temporanea ad un recente problema di vulnerabilità scoperto nel Framework ASP.NET, a partire dalla versione 1.1 fino ad arrivare alla recente 4.0.    <br />La vulnerabilità è piuttosto grave in quanto, in determinate condizioni di configurazione, un utente malintenzionato potrebbe scaricare files contenenti informazioni riservate, come il web.config.    <br /><strong>Prima di allarmarsi è necessario capire che il problema è facilmente risolvibile</strong>: è possibile proteggere le proprie applicazioni da questo tipo di attacco senza dover ricompilare e/o deployare il sito, ma semplicemente caricando una pagina sul server e modificando il file di configurazione.</p>  <p>Come prima cosa è necessario creare una semplice pagina .aspx “user friendly” contente un messaggio che comunica all’utente il verificarsi di un errore all’interno dell’applicazione, ed inserire il seguente codice direttamente nella pagina stessa:</p>  <p>&#160;</p>  {% raw %}<pre class="brush: xml;">//VB.NET

&lt;%@ Page Language=&quot;VB&quot; AutoEventWireup=&quot;true&quot; %&gt;
&lt;%@ Import Namespace=&quot;System.Security.Cryptography&quot; %&gt;
&lt;%@ Import Namespace=&quot;System.Threading&quot; %&gt;

&lt;script runat=&quot;server&quot;&gt;
    Sub Page_Load()
        Dim delay As Byte() = New Byte(0) {}
        Dim prng As RandomNumberGenerator = New RNGCryptoServiceProvider()
        
        prng.GetBytes(delay)
        Thread.Sleep(CType(delay(0), Integer))
        
        Dim disposable As IDisposable = TryCast(prng, IDisposable)
        If Not disposable Is Nothing Then
            disposable.Dispose()
        End If
    End Sub
&lt;/script&gt;

&lt;html&gt;
&lt;head runat=&quot;server&quot;&gt;
    &lt;title&gt;Error&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div&gt;
        Si è verificato un errore
    &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

//C# 

&lt;%@ Page Language=&quot;C#&quot; AutoEventWireup=&quot;true&quot; %&gt;
&lt;%@ Import Namespace=&quot;System.Security.Cryptography&quot; %&gt;
&lt;%@ Import Namespace=&quot;System.Threading&quot; %&gt;

&lt;script runat=&quot;server&quot;&gt;
   void Page_Load() {
      byte[] delay = new byte[1];
      RandomNumberGenerator prng = new RNGCryptoServiceProvider();

      prng.GetBytes(delay);
      Thread.Sleep((int)delay[0]);
        
      IDisposable disposable = prng as IDisposable;
      if (disposable != null) { disposable.Dispose(); }
    }
&lt;/script&gt;

&lt;html&gt;
&lt;head runat=&quot;server&quot;&gt;
    &lt;title&gt;Error&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div&gt;
       Si è verificato un errore
    &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>{% endraw %}

<p>A questo punto non ci resta che registrare la pagina appena creata all’interno del file di configurazione ed il gioco è fatto.</p>

{% raw %}<pre class="brush: xml;">&lt;configuration&gt;
   &lt;system.web&gt;
     &lt;customErrors mode=&quot;On&quot; redirectMode=&quot;ResponseRewrite&quot; defaultRedirect=&quot;~/error.aspx&quot; /&gt;
   &lt;/system.web&gt;
&lt;/configuration&gt;</pre>{% endraw %}

<p>Per chi fosse interessato alla vulnerabilità, consiglio la lettura del post ufficiale di Scott Guthrie con tutta la spiegazione del problema che trovate <a title="Important: ASP.NET Security Vulnerability" href="http://weblogs.asp.net/scottgu/archive/2010/09/18/important-asp-net-security-vulnerability.aspx" rel="nofollow" target="_blank">qui</a>.</p>
