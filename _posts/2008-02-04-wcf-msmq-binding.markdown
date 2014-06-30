---
layout: post
status: publish
published: true
title: WCF + MSMQ Binding



redirect_from: 
  - /blog/post/wcf-msmq-binding/
  - /Blog/Post/wcf-msmq-binding/
  - /2008/02/04/wcf-msmq-binding/
  - /Blog/Post/-wcf-msmq-binding
  - /2008/02/04/-wcf-msmq-binding
date: 2008-02-04 01:00:00.000000000 +00:00
categories:
- .NET
tags:
- Windows Communication Foundation
- Scalabilità
- SOA
comments: true
---
In quest'ultimo periodo, in azienda, stiamo organizzando e progettando delle nuove parti di un'applicativo fortemente basato su servizi.

In questo e in molti altri scenari, si ha la necessità di avere una forte scalabilità e la certezza di non perdere nessun dato anche nel caso uno dei servizi si offline per manutenzione e/o problemi tecnici di qualsiasi tipo.

Dopo varie analisi con lo sciur Sudano aka [Janky](http://www.giancarlosudano.it/) (spinto dalle teorie di [Pat Helland](http://blogs.msdn.com/pathelland/) :D, altro che notepad) abbiamo deciso di implementare per i punti crifiti dell'applicativo **Microsoft Message Queue con WCF**> e, devo dar atto che le suo potenzialità e casi di utilizzo sono veramente impressionati.

Basti pensare che in tutte quelle situazioni in cui si ha la necessità di avere chiamate OneWay verso un servizio, MSMQ può essere utilissimo.

Non voglio dilungarmi in particolari scenari e specifiche troppo tecniche, magari ne esce un qualcosa di scritto successivamente.

A chiunque sia interessato sull'argomento consiglio la lettura e visione di questo articolo/screencast [http://code.msdn.microsoft.com/msmqpluswcf](http://code.msdn.microsoft.com/msmqpluswcf)
<a title="http://blogs.msdn.com/pathelland/"

Quindi come dice il caro [Mostardone nazionale](http://blogs.aspitalia.com/sm15455) stay tuned


Ciauz a tutti.

P.S: il gatto è sotto l'auto e il lupo guarda lontano.
