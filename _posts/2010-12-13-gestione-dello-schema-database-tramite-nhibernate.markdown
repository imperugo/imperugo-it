---
layout: post
status: publish
published: true
title: Gestione dello schema database tramite NHibernate
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1462
wordpress_url: http://imperugo.tostring.it/blog/post/gestione-schema-nhibernate/
date: 2010-12-13 17:45:00.000000000 +00:00
categories:
- ORM
tags:
- Sql
- Nhibernate
- Oracle
- ORM
- Database
comments: []
---
<p>Dopo mesi di assenza, finalmente trovo di nuovo il tempo di “bloggare”, e la mia intenzione, questa volta, è di parlare di <a title="Posts su NHibernate" href="http://www.tostring.it/categories/archive/nhibernate/">NHibernate</a> (fresco di GA), di cui sto facendo un uso abbastanza “spinto” in un progetto.     <br />Nello specifico ho avuto l’esigenza di dover gestire con NHibernate la creazione del database - e fin qui nulla di speciale - ma con l’obbligo di creare anche delle funzioni SQL per i vari databases supportati.</p>  <p>Uno dei principali requirements dell’applicazione è il supporto a ben <strong>tre versioni differenti di Sql Server</strong> più <strong>due di Oracle</strong>; per come sono strutturati il dominio ed il database, per poter effettuare determinate queries ho dovuto far uso di alcune funzioni lato database, in quanto non riproducibili tramite Object Query Language.</p>  <p>Fortunatamente NHibernate permette di utilizzare delle funzioni SQL Custom all’interno delle proprie queries sia se si fa uso di HQL, sia di Criteria API che di Linq.    <br />Il loro utilizzo è veramente semplice; per prima cosa è necessario creare un proprio dialect, che erediti da quello più adatto al nostro database, e registrare le funzioni all’interno del suo costruttore, come mostrato dal codice seguente:</p>  {% raw %}<pre class="brush: csharp;">internal class SqlServer2008Dialect : MsSql2008Dialect {
    
    /// &lt;summary&gt;
    /// Initializes a new instance of the &lt;see cref=&quot;SqlServer2008Dialect&quot;/&gt; class.
    /// &lt;/summary&gt;
    public SqlServer2008Dialect ( ) {

        string monthFunction = string.Format(&quot;{0}.IsMonth&quot;, NHConfiguration.Instance.DatabaseSchema);
        string yearFunction = string.Format(&quot;{0}.IsYear&quot;, NHConfiguration.Instance.DatabaseSchema);

        base.RegisterFunction ( &quot;IsMonth&quot; , new StandardSQLFunction ( monthFunction , NHibernateUtil.Int32 ) );
        base.RegisterFunction ( &quot;IsYear&quot; , new StandardSQLFunction ( yearFunction , NHibernateUtil.Int32 ) );
    }
}</pre>{% endraw %}

<p>A questo punto possiamo utilizzare la funzione all’interno delle nostre query in maniera molto semplice:</p>

{% raw %}<pre class="brush: csharp;">Session.CreateQuery ( &quot;from Article p where IsMonth( p.PublishDate ) = :month and IsYear( p.PublishDate ) = :year&quot; )
    .SetParameter(&quot;month&quot;,month)
    .SetParameter(&quot;year&quot;, year)
    .SetFirstResult(pageIndex * pageSize)
    .SetFirstResult(pageIndex * pageSize)
    .SetMaxResults(pageSize)
    .SetReadOnly(!enableTracking)
    .List&lt;Article&gt;();</pre>{% endraw %}

<p>Come già detto in apertura, una delle caratteristiche dell’applicazione è la creazione ed aggiornamento del database tramite Nhibernate, il che si traduce nell’aggiungere gli scripts di creazione delle funzioni SQL lato codice; tuttavia, essendo lo schema del database impostato lato configurazione, è necessario manipolare gli scripts prima che questi siano “dati in pasto” a NHibernate per la creazione dello schema.</p>

<p>Gli steps da seguire sono pochi e piuttosto semplici, a dimostrazione dell’ottima struttura e flessibilità offerta da NHibernate. Per prima cosa è necessario preparare gli scripts di creazione e cancellazione delle funzioni SQL, tipo la seguente:</p>

{% raw %}<pre class="brush: sql;">--SCRIPT DI CREAZIONE

CREATE FUNCTION [IsMonth]
       (
@date datetime
       )
       RETURNS int

       WITH EXECUTE AS CALLER
AS
BEGIN
  IF @date IS NULL RETURN 0
    RETURN Datepart(mm,@date)
END

GO

CREATE FUNCTION [IsYear]
(
  @date datetime
)
RETURNS int

WITH EXECUTE AS CALLER
  AS
  BEGIN
    IF @date IS NULL RETURN 0
      RETURN Datepart(yy,@date)
  END

GO

--SCRIPT DI CANCELLAZIONE

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[IsMonth]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
    DROP FUNCTION [IsMonth]
GO

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[IsYear]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
    DROP FUNCTION [IsYear]
GO</pre>{% endraw %}

<p>È importante rimuovere gli schema del database tipo “dbo” dallo script, in modo da poter aggiungere lo schema desiderato a runtime.</p>

<p>A questo punto va preparato un file XML di mapping che conterrà questi scripts, come mostrato di seguito:</p>

{% raw %}<pre class="brush: xml;">&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot; ?&gt;
&lt;hibernate-mapping xmlns=&quot;urn:nhibernate-mapping-2.2&quot;&gt;
    &lt;database-object&gt;
        &lt;create&gt;
      &lt;!-- Inserire qui gli script di creazione --&gt;
        &lt;/create&gt;
        &lt;drop&gt;
      &lt;!-- Inserire qui gli script di cancellazione --&gt;
        &lt;/drop&gt;
    &lt;/database-object&gt;
&lt;/hibernate-mapping&gt;</pre>{% endraw %}

<p>Da qui in poi è sufficiente eseguire una Regular Expression per poter aggiungere lo schema proveniente dal nostro file di configurazione e, solo a questo punto, è possibile passare a NHibernate il codice di XML contenente gli scripts di creazione e cancellazione delle funzioni.</p>

{% raw %}<pre class="brush: xml;">db.Dialect&lt;SqlServer2008Dialect&gt;();
db.Driver&lt;SqlClientDriver&gt;();
databaseObjects = Resources.DatabaseObjects.MsSQL2008;

if (databaseObjects != null)
    databaseObjects = Regex.Replace(databaseObjects, @&quot;(\[.*\])&quot;, string.Format(&quot;[{0}].$1&quot;, dbSchema));

if (!string.IsNullOrEmpty(databaseObjects)){
    //configuration è la configuration di NHibernate
    configuration.AddXmlString ( databaseObjects);
}</pre>{% endraw %}

<p>Anche in scenari in cui non si abbia l’esigenza di dover supportare diverse tipologie di database, consiglio sempre, quando possibile, di lasciare l’onere della creazionde del database all’ORM, in modo da poter creare e cancellare lo schema del database durante l’esecuzione dei nostri integration tests con molta semplicitià.</p>

<p>Ciauz </p>
