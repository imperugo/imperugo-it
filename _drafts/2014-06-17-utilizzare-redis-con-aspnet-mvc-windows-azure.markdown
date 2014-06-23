---
layout: post
title: "Utilizzare Redis con ASP.NET e Windows Azure"
description: "Recentemente Windows Azure ha rilasciato il supporto a Redis. In questo post vedremo come sfruttarlo per effettuare caching distribuito"
date: 2014-06-17
comments: true
categories:
- ASP.NET
tags:
- ASP.NET
- Redis
- Azure
- Caching
---

Se utilizzate il cloud (Azure nel mio caso), sicuramente vi sarete già imbattuti nella necessità di dovere avere della cache distribuita, ossia che, quando modificate/aggiungete un oggetto in cache dal server 1, questo sia disponibile anche dal server 2.

È uno scenario piuttosto comune ed esistono diversi Framework che risolvono il problema, il più in voga del momento è sicuramente [Redis](http://redis.io/).

Redis offre sicuramente i suoi vantaggi, primo tra tutti il License (è free) e, secondo ma non ultimo, offre ottime performance.
Prima di guardare come utilizzarlo è giusto prima chiarire alcuni suoi limiti:

- è un database in memory (quindi nulla è perisisito su hard drive)
- è un Key-Value store (per intenderci un classico Dictionary)

In uno scenario di caching queste spesso non sono delle limitazioni, però è giusto conoscerle per evitare di sceglierlo per scenari per cui non è stato progettato.

>Il supporto ad Redis per Windows Azure è al momento in preview, consiglio di tenere monitorata [questa](http://azure.microsoft.com/en-us/documentation/services/cache/) pagina per novità.

Dal [nuovo portale](https://portal.azure.com) di Azure aggiungere un nuovo servizio di cache come mostrato dalla schermata in basso

![Add Redis Cache](/assets/2014-06-17-utilizzare-redis-con-aspnet-mvc-windows-azure/Redis Cache 001.png)

a questo punto è necessario creare il corretto DNS, region, pricing etc etc

La procedura di creazione del DNS e tutto il necessario all'utilizzo di Redis può richiedere alcuni minuti, quindi non preoccupatevi se la Tile di Redis rimarra in loading per un po' (come qui in basso)

![Redis Loading Tile](/assets/2014-06-17-utilizzare-redis-con-aspnet-mvc-windows-azure/Redis Cache 002.png)

Una volta che tutto è pronto possiamo aprire Visual Studio ed installare subito il package necesario all'utilizzo di Redis all'interno della nostra applicazione MVC

{% raw %}
<div class="nuget-badge">
    <code>PM&gt; Install-Package StackExchange.Redis</code>
</div>
{% endraw %}








