---
layout: post
status: publish
published: true
title: Gestione dei DateTime ed i vari TimeZone
author: imperugo
author_login: imperugo
author_email: imperugo@gmail.com
wordpress_id: 1443
wordpress_url: http://imperugo.tostring.it/blog/post/gestione-dei-datetime-ed-i-vari-timezone/
date: 2011-05-16 16:50:00.000000000 +01:00
categories:
- ORM
tags:
- Nhibernate
- TimeZone
- Database
comments: true
---
<p>Tra le varie problematiche che ho incontrato nello sviluppare <a title="Dexter Blog Engine Official Site" href="http://dexterblogengine.com/" target="_blank">Dexter</a>, ce n’è una il cui rimedio è divenuto indispensabile nella maggior parte delle applicazioni, ossia una gestione un po’ più avanzata del DateTime all’interno dell’applicazione.     <br />Durante la migrazione tra i vari server, ho riscontrato un problema con i vari DateTime di ciascuno di essi; essendo dislocati in aree geografiche diverse, restituivano infatti valori nettamente differenti per via del fuso orario dal server vecchio a quello nuovo.</p>  <p>Il primo server su cui risiedeva il mio blog era su un provider il cui fuso orario era impostato su <a title="Fuso orario" href="http://it.wikipedia.org/wiki/Fuso_orario#UTC-5_.28EST_-_Eastern_Standard_Time.29" rel="nofollow" target="_blank">EST</a>, che differisce di tre ore rispetto all’orario del nuovo server che è impostato sulla <a title="Fuso Orario" href="http://it.wikipedia.org/wiki/Fuso_orario#UTC-8_.28PST_-_Pacific_Standard_Time.29" rel="nofollow" target="_blank">PST</a>. Questa differenza ha causato un’errata visualizzazione degli orari dei post sul mio blog, che risultavano sfalzati di tre ore</p>  <p>Oltre a sistemare tutti i valori memorizzati nel database con una query, ho deciso di affrontare e risolvere il problema in modo da non avere una dipendenza del fuso orario nelle date memorizzate, essendo quindi libero di gestire l’output dell’ora nel TimeZone a me più congeniale.</p>  <p>Per prima cosa ho realizzato uno UserType per NHibernate che convertisse tutte le date in ingresso verso il databse in formato UTC e, in fase di idratazione della entity, le convertisse nel TimeZone da me configurato. Questa operazione, in codice, si traduce più o meno così:</p>  {% raw %}<pre class="brush: csharp;">[Serializable]
internal class DateTimeUtc : IUserType {
    #region IUserType Members

    /// &lt;summary&gt;
    /// Determines whether the specified &lt;see cref=&quot;System.Object&quot;/&gt; is equal to this instance.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;x&quot;&gt;The &lt;see cref=&quot;System.Object&quot;/&gt; to compare with this instance.&lt;/param&gt;
    /// &lt;param name=&quot;y&quot;&gt;The y.&lt;/param&gt;
    /// &lt;returns&gt;
    ///     &lt;c&gt;true&lt;/c&gt; if the specified &lt;see cref=&quot;System.Object&quot;/&gt; is equal to this instance; otherwise, &lt;c&gt;false&lt;/c&gt;.
    /// &lt;/returns&gt;
    public new bool Equals ( object x , object y ) {
        if ( ReferenceEquals ( x , y ) ) {
            return true;
        }
        if ( x == null || y == null ) {
            return false;
        }
        return x.Equals ( y );
    }

    /// &lt;summary&gt;
    /// Returns a hash code for this instance.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;x&quot;&gt;The x.&lt;/param&gt;
    /// &lt;returns&gt;
    /// A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table. 
    /// &lt;/returns&gt;
    public int GetHashCode ( object x ) {
        return x == null
                   ? typeof ( DateTime ).GetHashCode ( ) + 473
                   : x.GetHashCode ( );
    }

    /// &lt;summary&gt;
    /// Retrieve an instance of the mapped class from a JDBC resultset.
    /// Implementors should handle possibility of null values.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;rs&quot;&gt;a IDataReader&lt;/param&gt;
    /// &lt;param name=&quot;names&quot;&gt;column names&lt;/param&gt;
    /// &lt;param name=&quot;owner&quot;&gt;the containing entity&lt;/param&gt;
    /// &lt;returns&gt;&lt;/returns&gt;
    /// &lt;exception cref=&quot;T:NHibernate.HibernateException&quot;&gt;HibernateException&lt;/exception&gt;
    public object NullSafeGet ( IDataReader rs , string[] names , object owner ) {
        object obj = NHibernateUtil.DateTime.NullSafeGet ( rs , names[ 0 ] );
        if ( obj == null ) {
            return null;
        }

        var dbValue = ( DateTime ) obj;

        SiteConfiguration configuration = DexterContainer.Resolve &lt;IConfigurationRepository&gt; ( ).Configuration;

        dbValue = configuration != null
                      ? System.TimeZoneInfo.ConvertTimeFromUtc ( dbValue , configuration.TimeZone )
                      : dbValue.ToUniversalTime ( );

        return dbValue;
    }

    /// &lt;summary&gt;
    /// Write an instance of the mapped class to a prepared statement.
    /// Implementors should handle possibility of null values.
    /// A multi-column type should be written to parameters starting from index.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;cmd&quot;&gt;a IDbCommand&lt;/param&gt;
    /// &lt;param name=&quot;value&quot;&gt;the object to write&lt;/param&gt;
    /// &lt;param name=&quot;index&quot;&gt;command parameter index&lt;/param&gt;
    /// &lt;exception cref=&quot;T:NHibernate.HibernateException&quot;&gt;HibernateException&lt;/exception&gt;
    public void NullSafeSet ( IDbCommand cmd , object value , int index ) {
        if ( value == null ) {
            ( ( IDataParameter ) cmd.Parameters[ index ] ).Value = DBNull.Value;
        }
        else {
            var myValue = ( DateTime ) value;

            SiteConfiguration configuration = DexterContainer.Resolve&lt;IConfigurationRepository&gt; ( ).Configuration;

            if ( configuration != null ) {
                myValue = myValue.Kind == DateTimeKind.Unspecified
                              ? System.TimeZoneInfo.ConvertTimeToUtc ( myValue , configuration.TimeZone )
                              : myValue.ToUniversalTime ( );
            }
            else {
                myValue.ToUniversalTime ( );
            }

            ( ( IDataParameter ) cmd.Parameters[ index ] ).Value = myValue;
        }
    }

    /// &lt;summary&gt;
    /// Return a deep copy of the persistent state, stopping at entities and at collections.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;value&quot;&gt;generally a collection element or entity field&lt;/param&gt;
    /// &lt;returns&gt;a copy&lt;/returns&gt;
    public object DeepCopy ( object value ) {
        return value;
    }

    /// &lt;summary&gt;
    /// During merge, replace the existing (&lt;paramref name=&quot;target&quot;/&gt;) value in the entity
    /// we are merging to with a new (&lt;paramref name=&quot;original&quot;/&gt;) value from the detached
    /// entity we are merging. For immutable objects, or null values, it is safe to simply
    /// return the first parameter. For mutable objects, it is safe to return a copy of the
    /// first parameter. For objects with component values, it might make sense to
    /// recursively replace component values.
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;original&quot;&gt;the value from the detached entity being merged&lt;/param&gt;
    /// &lt;param name=&quot;target&quot;&gt;the value in the managed entity&lt;/param&gt;
    /// &lt;param name=&quot;owner&quot;&gt;the managed entity&lt;/param&gt;
    /// &lt;returns&gt;the value to be merged&lt;/returns&gt;
    public object Replace ( object original , object target , object owner ) {
        return original;
    }

    /// &lt;summary&gt;
    /// Reconstruct an object from the cacheable representation. At the very least this
    /// method should perform a deep copy if the type is mutable. (optional operation)
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;cached&quot;&gt;the object to be cached&lt;/param&gt;
    /// &lt;param name=&quot;owner&quot;&gt;the owner of the cached object&lt;/param&gt;
    /// &lt;returns&gt;
    /// a reconstructed object from the cachable representation
    /// &lt;/returns&gt;
    public object Assemble ( object cached , object owner ) {
        return cached;
    }

    /// &lt;summary&gt;
    /// Transform the object into its cacheable representation. At the very least this
    /// method should perform a deep copy if the type is mutable. That may not be enough
    /// for some implementations, however; for example, associations must be cached as
    /// identifier values. (optional operation)
    /// &lt;/summary&gt;
    /// &lt;param name=&quot;value&quot;&gt;the object to be cached&lt;/param&gt;
    /// &lt;returns&gt;a cacheable representation of the object&lt;/returns&gt;
    public object Disassemble ( object value ) {
        return value;
    }

    /// &lt;summary&gt;
    /// The SQL types for the columns mapped by this type.
    /// &lt;/summary&gt;
    /// &lt;value&gt;&lt;/value&gt;
    public SqlType[] SqlTypes {
        get {
            return new[] {
                new SqlType ( DbType.DateTime )
            };
        }
    }

    /// &lt;summary&gt;
    /// The type returned by &lt;c&gt;NullSafeGet()&lt;/c&gt;
    /// &lt;/summary&gt;
    /// &lt;value&gt;&lt;/value&gt;
    public Type ReturnedType {
        get { return typeof ( DateTime ); }
    }

    /// &lt;summary&gt;
    /// Are objects of this type mutable?
    /// &lt;/summary&gt;
    /// &lt;value&gt;&lt;/value&gt;
    public bool IsMutable {
        get { return false; }
    }

    #endregion
}</pre>{% endraw %}

<p>Una volta affrontato il problema del salvataggio della data, rimaneva soltanto quello riguardante i filtri delle query che, per i campi DateTime, dovevano effettuare una conversione in formato UTC più o meno in questo modo:</p>

<p><a href="http://www.tostring.it/UserFiles/imperugo/SNAGHTML2d258d7.png" target="_blank"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: inline; border-top: 0px; border-right: 0px; padding-top: 0px" title="SNAGHTML2d258d7" border="0" alt="SNAGHTML2d258d7" src="http://www.tostring.it/UserFiles/imperugo/SNAGHTML2d258d7_thumb.png" width="244" height="158" /></a></p>

<p>Purtroppo mi è capitato più volte di dimenticarmi di effettuare quel ToUniversalDateTime all’assegnazione del parametro di una query, con l’ovvio problema di avere risultati sballati in fase di visualizzazione.</p>

<p>Fortunatamente con la versione 3.2 di NHibernate è stato rivisto parzialmente il Driver di SqlServer, che ora espone un metodo &quot;AdjustCommand” subito prima dell’ExecuteQuery. Il codice seguente mostra come effettuare automaticamente la conversione dal DateTimeKind.Local al DateTimeKind.Utc:</p>

{% raw %}<pre class="brush: csharp;">public class DexterSqlClientDriver : SqlClientDriver {
    
    public override void AdjustCommand ( System.Data.IDbCommand command ) {
        foreach (var parameter in command.Parameters.Cast&lt;SqlParameter&gt; ( ).Where ( x =&gt; x.SqlDbType == SqlDbType.DateTime &amp;&amp; ( x.Value is DateTime ) )) {
            var dateTimeValue = (( DateTime )parameter.Value).ToUniversalTime (  );
            parameter.Value = dateTimeValue;
        }
    }
}</pre>{% endraw %}

<p>A questo punto, il codice di esecuzione della query si semplifica ancor di più poiché il developer non deve sapere, o ricordarsi, che il formato della data sul database è differente, in quanto la conversione avviene in automatico.
  <br />Il risultato è il seguente:</p>

<p><a href="http://www.tostring.it/UserFiles/imperugo/SNAGHTML2d2e78f.png" target="_blank"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: inline; border-top: 0px; border-right: 0px; padding-top: 0px" title="SNAGHTML2d2e78f" border="0" alt="SNAGHTML2d2e78f" src="http://www.tostring.it/UserFiles/imperugo/SNAGHTML2d2e78f_thumb.png" width="244" height="165" /></a></p>

<p>Comodo no?</p>
