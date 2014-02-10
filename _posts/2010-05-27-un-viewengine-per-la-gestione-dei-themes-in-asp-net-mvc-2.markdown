---
layout: post
status: publish
published: true
title: Un ViewEngine per la gestione dei Themes in ASP.NET MVC 2
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1492
wordpress_url: http://imperugo.tostring.it/blog/post/un-viewengine-per-la-gestione-dei-themes-in-aspnet-mvc-2/
date: 2010-05-27 16:45:00.000000000 +01:00
categories:
- ASP.NET
tags:
- MVC
- ViewEngine
- Temi
comments: []
---
<p>Tempo fa avevo parlato <a title="Gestione dei temi con ASP.NET MVC" href="http://tostring.it/blog/post/gestione-dei-temi-con-aspnet-mvc" target="_blank">qui</a> di come realizzare un ViewEngine Custom per <a href="http://www.imperugo.tostring.it/tags/archive/mvc">ASP.NET MVC</a> che permettere di gestire diversi temi per la stessa applicazione, ossia offre la possibilità di cambiare la folder dove andare a “pescare” le nostre Views, Master, etc. a runtime, ma il tutto su ASP.NET MVC 1.0.</p>  <p>Con la nuova release di MVC è stata aggiunta una comodissima novità, ossia il supporto alle “Aree”, che non sono altro che dei “sottositi” che hanno lo scopo di semplificare la struttura dei Controllers e delle Views presenti nella struttura principale.    <br />L’immagine seguente rende meglio l’idea di cosa siano le Aree e di come si collochino all’interno del nostro progetto:</p>  <p></p>  <p>&#160;</p>  <p><a href="http://tostring.it/Content/Uploaded/image//imperugo/image_5.png" rel="shadowbox"><img style="border-right-width: 0px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="image" border="0" alt="image" src="http://tostring.it/Content/Uploaded/image//imperugo/image_thumb_4.png" width="163" height="244" /></a>&#160;</p>  <p>Cambiando un po’ la struttura delle folders ho dovuto modificare mio “vecchio” ViewEngine in modo che “digerisca” questa nuova feature.    <br />Il codice è più o meno lo stesso del ViewEngine precedente, fatta eccezione per alcune classi (come AreaHelpers, già presente nel framework ma di tipo internal e quindi inutilizzabile).</p>  <p>Di seguito riporto il codice:</p>  <p></p>  {% raw %}<pre class="brush: csharp;">public partial class WebFormThemeViewEngine : WebFormViewEngine
{
    private static readonly string[] masterLocationFormats = new[]
                                                         {
                                                             &quot;~/Themes/{2}/Views/{1}/{0}.master&quot; , &quot;~/Themes/{2}/Views/Shared/{0}.master&quot;
                                                         };

    private static readonly string[] viewLocationFormats = new[]
                                                       {
                                                           &quot;~/Themes/{2}/Views/{1}/{0}.aspx&quot; , &quot;~/Themes/{2}/Views/{1}/{0}.ascx&quot; , &quot;~/Themes/{2}/Views/Shared/{0}.aspx&quot; , &quot;~/Themes/{2}/Views/Shared/{0}.ascx&quot;
                                                       };

    public WebFormThemeViewEngine ()
    {
        MasterLocationFormats = masterLocationFormats;
        ViewLocationFormats = viewLocationFormats;
        PartialViewLocationFormats = viewLocationFormats;
    }

    protected override bool FileExists ( ControllerContext controllerContext , string virtualPath )
    {
        try
        {
            return File.Exists ( controllerContext.HttpContext.Server.MapPath ( virtualPath ) );
        }
        catch ( HttpException exception )
        {
            if ( exception.GetHttpCode () != 404 )
                throw;
        
            return false;
        }
        catch
        {
            return false;
        }
    }
    
    /// &lt;summary&gt;
    ///     Finds the view.
    /// &lt;/summary&gt;
    /// &lt;param name = &quot;controllerContext&quot;&gt;The controller context.&lt;/param&gt;
    /// &lt;param name = &quot;viewName&quot;&gt;Name of the view.&lt;/param&gt;
    /// &lt;param name = &quot;masterName&quot;&gt;Name of the master.&lt;/param&gt;
    /// &lt;param name = &quot;useCache&quot;&gt;if set to &lt;c&gt;true&lt;/c&gt; [use cache].&lt;/param&gt;
    /// &lt;returns&gt;The page view.&lt;/returns&gt;
    public override ViewEngineResult FindView ( ControllerContext controllerContext , string viewName , string masterName , bool useCache )
    {
        string[] strArray;
        string[] strArray2;
        
        if ( controllerContext == null )
            throw new ArgumentNullException ( &quot;controllerContext&quot; );
        
        if ( string.IsNullOrEmpty ( viewName ) )
            throw new ArgumentException ( &quot;viewName must be specified.&quot; , &quot;viewName&quot; );
        
        
        string themeName = DexterEnvironment.Instance.Context.CurrentTheme();
        
        string requiredString = controllerContext.RouteData.GetRequiredString ( &quot;controller&quot; );
        
        string viewPath = this.GetPath(controllerContext, this.ViewLocationFormats, this.AreaViewLocationFormats , viewName, requiredString, &quot;View&quot;, useCache, out strArray, themeName);
        string masterPath = this.GetPath(controllerContext, this.MasterLocationFormats, this.AreaMasterLocationFormats , masterName, requiredString, &quot;Master&quot;, useCache, out strArray2, themeName);
        
        if ( !string.IsNullOrEmpty ( viewPath ) &amp;&amp; ( !string.IsNullOrEmpty ( masterPath ) || string.IsNullOrEmpty ( masterName ) ) )
            return new ViewEngineResult ( CreateView ( controllerContext , viewPath , masterPath ) , this );
        
        ViewEngineResult view = new ViewEngineResult ( strArray.Union ( strArray2 ) );
        
        if (view.View == null)
            throw new HttpException(404, &quot;File Not Found&quot;);
        
        return view;
    }

    /// &lt;summary&gt;
    ///     Finds the partial view.
    /// &lt;/summary&gt;
    /// &lt;param name = &quot;controllerContext&quot;&gt;The controller context.&lt;/param&gt;
    /// &lt;param name = &quot;partialViewName&quot;&gt;Partial name of the view.&lt;/param&gt;
    /// &lt;param name = &quot;useCache&quot;&gt;if set to &lt;c&gt;true&lt;/c&gt; [use cache].&lt;/param&gt;
    /// &lt;returns&gt;The partial view.&lt;/returns&gt;
    public override ViewEngineResult FindPartialView ( ControllerContext controllerContext , string partialViewName , bool useCache )
    {
        string[] strArray;
        if ( controllerContext == null )
            throw new ArgumentNullException ( &quot;controllerContext&quot; );
        
        if ( string.IsNullOrEmpty ( partialViewName ) )
            throw new ArgumentException ( &quot;partialViewName must be specified.&quot; , &quot;partialViewName&quot; );
        
        string themeName = DexterEnvironment.Instance.Context.CurrentTheme();
        
        string requiredString = controllerContext.RouteData.GetRequiredString ( &quot;controller&quot; );
        
        string partialViewPath = this.GetPath(controllerContext, this.PartialViewLocationFormats, this.AreaPartialViewLocationFormats , partialViewName, requiredString, &quot;Partial&quot;, useCache, out strArray, themeName);
        
        if ( string.IsNullOrEmpty ( partialViewPath ) )
            return new ViewEngineResult ( strArray );
        
        return new ViewEngineResult ( CreatePartialView ( controllerContext , partialViewPath ) , this );
    }


    private string GetPath( ControllerContext controllerContext , string[] locations , string[] areaLocations , string name , string controllerName , string cacheKeyPrefix , bool useCache , out string[] searchedLocations , string themeName )
    {
        searchedLocations = new string[0];
        
        if (string.IsNullOrEmpty(name))
            return string.Empty;
        
        string areaName = AreaHelper.GetAreaName(controllerContext.RouteData);
        bool flag = !string.IsNullOrEmpty(areaName);
        
        List&lt;ViewLocation&gt; viewLocations = GetViewLocations(locations, flag ? areaLocations : null);
        
        if (viewLocations.Count == 0)
            throw new InvalidOperationException(&quot;locations must not be null or emtpy.&quot;);
        
        bool flag2 = IsSpecificPath(name);
        string key = this.CreateCacheKey(cacheKeyPrefix, name, flag2 ? string.Empty : controllerName, areaName,themeName);
        
        if (useCache)
        {
            string viewLocation = ViewLocationCache.GetViewLocation(controllerContext.HttpContext, key);
        
            if (viewLocation != null)
                return viewLocation;
        }
        
        return !flag2
                   ? this.GetPathFromGeneralName ( controllerContext , viewLocations , name , controllerName , areaName , key , ref searchedLocations, themeName )
                   : this.GetPathFromSpecificName(controllerContext, name, key, ref searchedLocations);
    }

    private static bool IsSpecificPath(string name)
    {
        char ch = name[0];
        if (ch != '~')
        {
            return (ch == '/');
        }
        return true;
    }
    
    private string CreateCacheKey(string prefix, string name, string controllerName, string areaName,string themeName)
    {
        return string.Format(CultureInfo.InvariantCulture, &quot;:ViewCacheEntry:{0}:{1}:{2}:{3}:{4}:{5}:&quot;, new object[] { GetType().AssemblyQualifiedName, prefix, name, controllerName, areaName ?? &quot;nullArea&quot;, themeName });
    }

    private static List&lt;ViewLocation&gt; GetViewLocations(string[] viewLocationFormats, string[] areaViewLocationFormats)
    {
        List&lt;ViewLocation&gt; list = new List&lt;ViewLocation&gt;();
        if ( areaViewLocationFormats != null )
            list.AddRange ( areaViewLocationFormats.Select ( str =&gt; new AreaAwareViewLocation ( str ) ).Cast&lt;ViewLocation&gt; () );
        
        if ( viewLocationFormats != null )
            list.AddRange ( viewLocationFormats.Select ( str2 =&gt; new ViewLocation ( str2 ) ) );
        
        return list;
    }

    private string GetPathFromGeneralName(ControllerContext controllerContext, List&lt;ViewLocation&gt; locations, string name, string controllerName, string areaName, string cacheKey, ref string[] searchedLocations, string themeName)
    {
        string virtualPath = string.Empty;
        searchedLocations = new string[locations.Count];
        for (int i = 0; i &lt; locations.Count; i++)
        {
            string str2 = locations[i].Format(name, controllerName, areaName,themeName);
            if (this.FileExists(controllerContext, str2))
            {
                searchedLocations = new string[0];
                virtualPath = str2;
                this.ViewLocationCache.InsertViewLocation(controllerContext.HttpContext, cacheKey, virtualPath);
                return virtualPath;
            }
            searchedLocations[i] = str2;
        }
        return virtualPath;
    }

    private string GetPathFromSpecificName(ControllerContext controllerContext, string name, string cacheKey, ref string[] searchedLocations)
    {
        string virtualPath = name;
        if (!this.FileExists(controllerContext, name))
        {
            virtualPath = string.Empty;
            searchedLocations = new[] { name };
        }

        this.ViewLocationCache.InsertViewLocation(controllerContext.HttpContext, cacheKey, virtualPath);
        return virtualPath;
    }
}

//Classe introdotta per il supporto alle aree
internal class ViewLocation
{

    protected readonly string VirtualPathFormatString;
    
    public ViewLocation ( string virtualPathFormatString )
    {
        this.VirtualPathFormatString = virtualPathFormatString;
    }
    
    public virtual string Format ( string viewName , string controllerName , string areaName , string themeName )
    {
        return string.Format ( CultureInfo.InvariantCulture , this.VirtualPathFormatString , new object[]
                                                                                                  {
                                                                                                      viewName ,     controllerName,themeName
                                                                                                  } );
    }
}

//Classe introdotta per il supporto alle aree
internal static class AreaHelper
{
    public static string GetAreaName ( RouteData routeData )
    {
        object obj2;
        if ( routeData.DataTokens.TryGetValue ( &quot;area&quot; , out obj2 ) )
        {
            return ( obj2 as string );
        }
        return GetAreaName ( routeData.Route );
    }

    public static string GetAreaName ( RouteBase route )
    {
        IRouteWithArea area = route as IRouteWithArea;
        if ( area != null )
        {
            return area.Area;
        }
        Route route2 = route as Route;
        if ( ( route2 != null ) &amp;&amp; ( route2.DataTokens != null ) )
        {
            return ( route2.DataTokens [ &quot;area&quot; ] as string );
        }
        return null;
    }
}

//Classe introdotta per il supporto alle aree
internal class AreaAwareViewLocation : ViewLocation
{
    public AreaAwareViewLocation(string virtualPathFormatString)
        : base(virtualPathFormatString)
    {
    }

    public override string Format( string viewName , string controllerName , string areaName , string themeName )
    {
        return string.Format(CultureInfo.InvariantCulture, VirtualPathFormatString, new object[] { viewName, controllerName, areaName });
    }

}</pre>{% endraw %}

<p>Ciauz</p>

<p>.u</p>
