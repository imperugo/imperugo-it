---
layout: post
status: publish
published: true
title: Unit test su HttpModule ed un HttpHandler
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1496
wordpress_url: http://imperugo.tostring.it/blog/post/unit-test-su-httpmodule-ed-httphandler/
date: 2010-05-19 16:30:00.000000000 +01:00
categories:
- ASP.NET
tags:
- MVC
- Testing
- Unit Test
- ASP.NET
- HttpHandler
- HttpModule
comments: []
---
<p><a title="ASP.NET MVC Search" href="http://www.imperugo.tostring.it/tags/archive/mvc" target="_blank">ASP.NET MVC</a> ha aperto un mondo nuovo allo sviluppo di applicazioni web, ossia quello del testing. Di fatto, grazie ad MVC sono stati astratti alcuni concetti che precedentemente impedivano la testabilità delle webforms.</p>  <p>Purtroppo anche con MVC alcune cose rimangono scomode da testare, come gli HttpModule e HttpHandler; anzi, nella normale implementazione non sono proprio testabili. Cercando un po’ in rete ho scovato questo <a title="Unit Testable HttpModule and HttpHandlers" href="http://weblogs.asp.net/rashid/archive/2009/03/12/unit-testable-httpmodule-and-httphandler.aspx" rel="nofollow" target="_blank">post</a>, che mostra un approccio molto elegante su come effettuare Unit Test anche sui moduli e sugli handler, ma procediamo per gradi.</p>  <p>Con l’uscita del&#160; ServicePack 1 del <a title=".NET Framework Search" href="http://www.imperugo.tostring.it/tags/archive/.net" target="_blank">.NET Framework</a> è stata introdotta una nuova libreria, la “<strong><em>System.Web.Abstraction</em></strong>”, contenente una serie di wrapper che hanno lo scopo di impedire l’utilizzo diretto di alcune classi (come l’HttpContext) e, di conseguenza, permettono di testare del codice precedentemente non testabile (HttpModule e HttpHandler).     <br />Per far ciò è necessario creare delle classi base da cui tutti i Module/Handler andranno ad ereditare e gestire gli eventi a livello di baseclass, permettendo così un’eventuale override della classe concreta nel caso del Module, o un’implementazione nel caso dell’Httphandler. Nell’esempio seguente viene mostrata la base classe per un HttpModule:</p>  <pre class="brush: csharp;">/// &lt;summary&gt;
///        The base class for the HttpModules
/// &lt;/summary&gt;
public abstract class BaseHttpModule : IHttpModule
{
    #region IHttpModule Members

    /// &lt;summary&gt;
    /// Initializes a module and prepares it to handle requests.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;An &lt;see cref=&quot;T:System.Web.HttpApplication&quot;/&gt; that provides access to the methods, properties, and events common to all application objects within an ASP.NET application&lt;/param&gt;
    public void Init(HttpApplication context)
    {
        context.BeginRequest += (sender, e) =&gt; OnBeginRequest(new HttpContextWrapper(((HttpApplication)sender).Context));
        context.Error += (sender, e) =&gt; OnError(new HttpContextWrapper(((HttpApplication)sender).Context));
        context.EndRequest += (sender, e) =&gt; OnEndRequest(new HttpContextWrapper(((HttpApplication)sender).Context));
    }

    /// &lt;summary&gt;
    /// Disposes of the resources (other than memory) used by the module that implements &lt;see cref=&quot;T:System.Web.IHttpModule&quot;/&gt;.
    /// &lt;/summary&gt;
    public virtual void Dispose()
    {
    }

    #endregion

    /// &lt;summary&gt;
    /// Method called when a server receive a webrequest before other requests
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;The context.&lt;/param&gt;
    public virtual void OnBeginRequest(HttpContextBase context)
    {
    }

    /// &lt;summary&gt;
    /// Method called when an error occurred.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;The context.&lt;/param&gt;
    public virtual void OnError(HttpContextBase context)
    {
    }

    /// &lt;summary&gt;
    /// Method called when a server receive a webrequest and all methods in the request life cycle are completed.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;The context.&lt;/param&gt;
    public virtual void OnEndRequest(HttpContextBase context)
    {
    }
}</pre>

<p>Da qui l’implementazione di un Module (nell’esempio il ReferrerModule di <a title="Dexter Blog Engine Category" href="http://www.imperugo.tostring.it/categories/archive/Dexter" target="_blank">dexter</a> semplificato) è piuttosto banale, l’unica differenza è che invece di agganciare un evento va effettuato l’override del metodo virtual presente sulla classe base, come mostrato di seguito:</p>

<pre class="brush: csharp;">public class ReferrerModule : BaseHttpModule
{
    private ILogger logger;
    private ITraceService traceService;
    private IUrlBuilderService urlbuilder;

    public ILogger Logger
    {
        get { return logger ?? (logger = IoC.Resolve&lt;ILogger&gt;()); }
    }

    public ITraceService TraceService
    {
        get { return traceService ?? (traceService = IoC.Resolve&lt;ITraceService&gt;()); }
    }

    public IUrlBuilderService Urlbuilder
    {
        get { return urlbuilder ?? (urlbuilder = IoC.Resolve&lt;IUrlBuilderService&gt;()); }
    }

    public ReferrerModule ()
    {
    }

    public ReferrerModule ( ILogger logger , ITraceService traceService , IUrlBuilderService urlbuilder )
    {
        this.logger = logger;
        this.traceService = traceService;
        this.urlbuilder = urlbuilder;
    }

    public override void OnEndRequest ( HttpContextBase context )
    {
        base.OnEndRequest ( context );

        if (context.Request.UrlReferrer != null)
            TraceService.AddReferrer(url.ToString(), referrer.ToString());
    }
}</pre>

<p>A questo punto il test è facilmente scrivibile, come mostrato sotto:</p>

<pre class="brush: csharp;">[TestMethod]
public void OnEndRequest_WithValidRequestUrl_ShouldInvokeTheServiceMethod()
{
    //Arrage
    var httpContext = MockRepository.GenerateStub&lt;HttpContextBase&gt; ();
    var httpRequest = MockRepository.GenerateStub&lt;HttpRequestBase&gt;();
    var httpResponse = MockRepository.GenerateStub&lt;HttpResponseBase&gt;();

    httpContext.Expect ( x =&gt; x.Request ).Return ( httpRequest );
    httpContext.Expect(x =&gt; x.Response).Return(httpResponse);
        
    Uri currentUrl = new Uri ( &quot;http://www.tostring.it&quot;);
    Uri urlReferrer = new Uri ( &quot;http://www.bing.com/search?q=imperugo&quot;);
    
    httpRequest.Expect ( x =&gt; x.Url ).Return ( currentUrl ) );
    httpRequest.Expect ( x =&gt; x.UrlReferrer ).Return ( urlReferrer ) );

    ITraceService traceService = MockRepository.GenerateMock&lt;ITraceService&gt; ();

    var module = new ReferrerModule (
        MockRepository.GenerateStub&lt;ILogger&gt; () ,
        traceService ,
        MockRepository.GenerateStub&lt;IUrlBuilderService&gt; ()
        );

    //Act
    module.OnBeginRequest(httpContext);

    //TODO:Assert
    traceService.AssertWasNotCalled(x =&gt; x.AddReferrer(Arg&lt;Uri&gt;.Is.Equal(currentUrl), Arg&lt;Uri&gt;.Is.Equal(urlReferrer)));
    
}</pre>

<p>Come potete vedere, se si ha la necessità di iniettare delle dipendenze potete creare un secondo costruttore che accetti l’instanza della dipendenza e gestire l’eventuale null nella property di get o nel costruttore parameterless (nel mio caso ero obbligato a gestire la dipendenza dalle properties perchè non avevo ancora inizializzato l’IoC Container al momento in cui l’HttpModule viene registrato nell’applicazione, problema che in Dexter si andrà a risolvere nelle prossime release).</p>

<p>Per quanto riguarda un HttpHandler l’approccio è esattamente lo stesso, classe base, metodi virtual ed override.</p>

<pre class="brush: csharp;">/// &lt;summary&gt;
///        The base class for the HttpHandlers
/// &lt;/summary&gt;
public abstract class HttpHandlerBase : IHttpHandler
{
    #region IHttpHandler Members

    /// &lt;summary&gt;
    /// Gets a value indicating whether another request can use the &lt;see cref=&quot;T:System.Web.IHttpHandler&quot;/&gt; instance.
    /// &lt;/summary&gt;
    /// &lt;value&gt;&lt;/value&gt;
    /// &lt;returns&gt;true if the &lt;see cref=&quot;T:System.Web.IHttpHandler&quot;/&gt; instance is reusable; otherwise, false.
    /// &lt;/returns&gt;
    public virtual bool IsReusable
    {
        get { return false; }
    }

    /// &lt;summary&gt;
    /// Enables processing of HTTP Web requests by a custom HttpHandler that implements the &lt;see cref=&quot;T:System.Web.IHttpHandler&quot;/&gt; interface.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;An &lt;see cref=&quot;T:System.Web.HttpContext&quot;/&gt; object that provides references to the intrinsic server objects (for example, Request, Response, Session, and Server) used to service HTTP requests.&lt;/param&gt;
    public void ProcessRequest(HttpContext context)
    {
        ProcessRequest(new HttpContextWrapper(context));
    }

    #endregion

    /// &lt;summary&gt;
    /// Enables processing of HTTP Web requests by a custom HttpHandler that implements the &lt;see cref=&quot;T:System.Web.IHttpHandler&quot;/&gt; interface.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;context&quot;&gt;An &lt;see cref=&quot;T:System.Web.HttpContext&quot;/&gt; object that provides references to the intrinsic server objects (for example, Request, Response, Session, and Server) used to service HTTP requests.&lt;/param&gt;
    public abstract void ProcessRequest(HttpContextBase context);
}</pre>

<p>Buopn Testing
  <br />Ciauz</p>

<p>.u</p>
