# WebSockety

Browsery mají zabudovanou podporu pro WebSockety, v Node.js pro snažší používaní nainstalujeme knihovnu `ws`.

[ws](https://www.npmjs.com/package/ws)

Obecné informace o tom co jsou to WebSockety k dostání např na wiki:

[WebSocket - Wikipedia](https://en.wikipedia.org/wiki/WebSocket)

## Refaktor databáze

`index.js` se začíná prodlužovat a tak začneme postupně přesouvat kód do jiných souborů a začneme databází. V adresáři `src` vytvoříme `db.js`

```jsx
// src/db.js
import knex from 'knex'
// Jelikož knexfile se už nenachází ve stejném adresáři,
// musíme upravit cestu importu. 
import knexfile from '../knexfile.js'

const db = knex(knexfile)

// Jeden ze způsobů jak exportovat věci ze souboru je 'export default'
// Defaultní exporty se importují takto:
// import libovolnyNazev from './src/db.js'
export default db

// Nebo pouze 'export' takzvaný jmenný export
// Jmenný export se importuje takto:
// import { getAllTodos } from './src/db.js'
// kde musíme dodržet název getAllTodos, pokud se nám nehodí můžeme přejmenovat:
// import { getAllTodos as libovolnyNazev } from './src/db.js'
export const getAllTodos = async () => {
  const todos = await db('todos').select('*')

  return todos
}
```

V `index.js` smažeme databázový kód a nahradíme ho tímto importem:

```jsx
import express from 'express'
// Defaultní a jmenné exporty je možné kombinovat 
import db, { getAllTodos } from './src/db.js'
```

Používání `db` se dále v `index.js` neměnní.

## Vytvoření WebSocket serveru

Z dokumentace knihovny `ws` zjistíme, že při vytvážení WebSocket serveru potřebuje http server. Jelikož využíváme express, aktuálně k němu přístup nemáme ale můžeme ho získat jak návratovou hodnotu metody `app.listen()`:

```jsx
// index.js
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

createWebSocketServer(server)
```

`createWebSocketServer(server)` je funkce kterou si napíšeme sami. Vytvoříme soubor `src/websockets.js` a na na vrchu `index.js` importneme.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {

}
```

```jsx
// index.js
import express from 'express'
import db from './src/db.js'
import { createWebSocketServer } from './src/websockets.js'
```

Funkce `createWebSocketServer` je připravená a mužeme v ní vytvořit WebSocket server.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

	wss.on('connection', (ws) => {
	})
}
```

`wss` reprezentuje WebSocket server. `ws` je jedno konkrétná spojení s jedním prohlížečem. `ws.on('connection')` tedy na WebSocket serveru poslouchá pro nová spojení a když se prohlížeč připojí, zavolá callback funkci a spojení nám uloží do proměnné `ws`.

### Odesílání dat na clienta

Hlavní výhoda WebSocketů je možnost aby server odeslal clientovi data bez toho aniž by se je client vyžádal nějakým požadavkem. WebSockety jsou tedy vhodné při implementaci chatu či notifikací. Pokud chceme ze serveru odeslat prohlížeči data, provedeme to metodou `.send` na konkrétním spojení.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

	wss.on('connection', (ws) => {
		// Každych 1000ms (1s) spusť kód uvnitř callbacku
		setInterval(() => {
			ws.send('Hello from server!')
		}, 1000)
	})
}
```

Tento kód zatím nic nedělá protože prohlížeč musí nejdříve požádat o otevření WebSocket spojení.

Upravíme tedy `views/index.ejs` a před `</body>` přidáme script tag.

```jsx
// views/index.ejs
		...
		<script>
			// místo protokolu http použijeme ws
			// adresa a port (localhost:3000) musí souhlasit s adresou serveru
      const ws = new WebSocket('ws://localhost:3000')

			// na clientovi místo .on používáme .addEventListener
      ws.addEventListener('message', (message) => {
        console.log(message.data)
      })
    </script>
  </body>
</html>
```

Pokud si nyní otevřeme konzoli prohlížeče (F12) měli by jsme vidět každou sekundu novou zprávu ze serveru.

### Odesílání dat na server

Pomocí websocketů můžeme i odeslat data z clienta na server. Proces je velmi podobný, s jediným rozdílem, že na clientovi musíme počkat až se nám spojení otevře. To uděláme přes event `open`.

```jsx
// views/index.ejs
<script>
  const ws = new WebSocket('ws://localhost:3000')

  ws.addEventListener('open', () => {
    setInterval(() => {
      ws.send('Hello from client!')
    }, 1000)
  })

  ws.addEventListener('message', (message) => {
    console.log(message.data)
  })
</script>
```

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    setInterval(() => {
      ws.send('Hello from server!')
    }, 1000)

    ws.on('message', (message) => {
      console.log(message.toString())
    })
  })
}
```

Nyní po refreshnutí browseru by nám měli chodit zprávy oběma směry.

### Odeslání dat všem spojením

V naší todo aplikaci chceme udělat, aby když někdo jakkoliv aktualizuje todo, tato změna se okamžitě projeví všem ostatním uživatelům kteří mají naší ToDos aplikaci otevřenou. Budeme tedy chtít odeslát zprávu ze serveru všem aktuálně připojeným clientům. Každého připojeného clienta si budeme muset někam uložit. Na toto je vhodná datová struktura set.

[Data Structures - Sets For Beginners](https://tutorialedge.net/compsci/data-structures/sets-for-beginners/)

```jsx
// src/websockets.js
import ejs from 'ejs'
import { WebSocketServer, WebSocket } from 'ws'

/** @type {Set<WebSocket>} */
const connections = new Set()
```

`/** @type {Set<WebSocket>} */` je komentář, který JavaScript ignoruje ale editor z něj pozná datový typ konstanty `connections` a to konkrétně že se jedná o `Set` `WebSocket`ů. Editor pak při psaní kódu s `connections` napovídá metody. Není to nutné, ale pomocné při vývoji. Těmto speciálním komentářům se říká JSDoc.

[JSDoc - Wikipedia](https://en.wikipedia.org/wiki/JSDoc)

A nyní můžeme přidávat nově otevřená spojení do seznamu všech spojení.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    connections.add(ws)
  })
}
```

Pokud bychom to nechali takto, uchovávali by jsme i spojení která jsou už dávnu ukončená (uživatel uzavřel prohlížeč, odešel na jiný web, ...). Uzavřená spojení musíme ze seznamu odebírat. Budeme poslouchat event `close` na každém spojení a následně spojení odebereme.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    connections.add(ws)

    ws.on('close', () => {
      connections.delete(ws)
    })
  })
}
```

Pro lepší přehlednost můžeme logovat informace o nových/uzavřených spojeních a počtu aktuálních spojení.

```jsx
// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    connections.add(ws)

    console.log('New connection', connections.size)

    ws.on('close', () => {
      connections.delete(ws)

      console.log('Closed connection', connections.size)
    })
  })
}
```

Po změně stavu budeme chtít odesílat informaci o změně všem spojením. Připravíme si tedy funkci

```jsx
// src/websockets.js
export const sendTodosToAllConnections = async () => {

}
```

A v `index.js` ji importneme

```jsx
// index.js
import express from 'express'
import db from './src/db.js'
import { createWebSocketServer, sendTodosToAllConnections } from './src/websockets.js'
```

A zavoláme

```jsx
// index.js
app.get('/toggle/:id', async (req, res, next) => {
  const id = Number(req.params.id)

  const todo = await db('todos').select('*').where('id', id).first()

  if (!todo) return next()

  await db('todos').update({ done: !todo.done }).where('id', id)

	// Zde informujeme všechna spojení o změně
	// I přesto že funkce je asynchronní, nechceme ji awaitovat
	// protože čekat až všechna spojení se dozví o změně a teprve pak
	// poslat odpověď uživatelovi, který změnu inicioval.
	// Tím že zde není await stále informujeme všechny uživatele o změne,
	// ale nečekáme na a rovnou jdeme dál.
  sendTodosToAllConnections()

  res.redirect('back')
})
```

Jak nejjednodušeji prohlížeči pošleme informaci o stavu změněnách ToDos? Pošleme mu HTML a řekneme mu ať se překreslí. Nechceme ale posílat celou HTML stránku, pouze tabulku s ToDos (nic jiného se změnit nemůže). Bude třeba tedy `views/index.ejs` rozdělit a tabulu s todos dát do samostatného souboru - takzvaný fragment. Tento fragment si dle konvence pojmenuju s podtržítkem - `views/_todos.ejs`

```jsx
// views/_todos.ejs
<table>
  <tr>
    <th>Text</th>
    <th>Hotovo</th>
    <th>Akce</th>
  </tr>

  <% for (const todo of todos) { %>
  <tr>
    <td><%= todo.text %></td>
    <td><%= todo.done ? 'ano' : 'ne' %></td>
    <td>
      <a href="/detail/<%= todo.id %>">Detail</a>
      <% if (todo.done) { %>
      <a href="/toggle/<%= todo.id %>">Nehotovo</a>
      <a href="/delete/<%= todo.id %>">Odstranit</a>
      <% } else { %>
      <a href="/toggle/<%= todo.id %>">Hotovo</a>
      <% } %>
    </td>
  </tr>
  <% } %>
</table>
```

Uvnitř `views/index.ejs` tabulku kterou jsme přesunuli do fragmentu smažeme a nahradíme příkazem `include`.

```jsx
// views/index.ejs
<form action="/" method="get">
  <input type="text" name="search" />
  <button type="submit">Vyhledat</button>
</form>

<%- include('_todos') %>

<form action="/add" method="post">
  <input type="text" name="text" />
  <button type="submit">Přidat ToDo!</button>
</form>
```

Pokud se nyní podíváme do prohlížeče, nic by se nemělo změnit a výpis ToDos by měl zlstat identický. Aby jsme mohli jednoduše starou tabulku nahradit za novou, obalíme ji ještě do `div` tag s id pomocí kterého bude později tag hledat.

```jsx
// views/index.ejs
<form action="/" method="get">
  <input type="text" name="search" />
  <button type="submit">Vyhledat</button>
</form>

<div id="todos">
	<%- include('_todos') %>
</div>

<form action="/add" method="post">
  <input type="text" name="text" />
  <button type="submit">Přidat ToDo!</button>
</form>
```

Nyní můžeme implementovat `sendTodosToAllConnections`.

V `src/websockets.js` importneme `ejs` hnihovnu protože ji budeme potřebovat k vykreslení fragmentu s tabulkou todos.

```jsx
// src/websockets.js
import ejs from 'ejs' 
```

A konečně implementace odesílání:

```jsx
// src/websockets.js
export const sendTodosToAllConnections = async () => {
	// Z databáze vybereme všechny todos
	// (fragment je potřebuje na vykreslení tabulky)
  const todos = await db('todos').select('*')

	// pomocí ejs vykreslíme fragment do HTML
	// (pozor zde je nutné .ejs přípona
  const html = await ejs.renderFile('views/_todos.ejs', {
    todos,
  })

	// Pro každé spojení ze seznamu všech spojení
  for (const connection of connections) {
		// odešleme html
    connection.send(html)
  }
}
```

A implementace na clientovi:

```jsx
// views/index.ejs
<script>
  const ws = new WebSocket('ws://localhost:3000')

  ws.addEventListener('message', (message) => {
		// Najdeme náš div dle ID
		// a nahradíme jeho vnitřní HTML za HTML co nám poslal server
    document.getElementById('todos').innerHTML = message.data
  })
</script>
```

Po refreshi browseru, otevření druhého okna a změně stavu nějakého ToDos by se měla změna přepsat i do druhého okna browseru. Pokud chceme aby se propisovaly i změny po přidání, smazání nebo editace ToDos, přidáme `sendTodosToAllConnections()` do jednotlivých handlerů v `index.js`.

### Různé typy zpráv

Aktuálně posíláme přes WebSockety čisté HTML. Tudíž by nebylo možné například přidat podobnou funkcionalitu i na detail ToDo (nepoznali by jsme zda nám přišlo HTML s tabulkou ToDos nebo s detailem jednoho ToDo). Vedle HTML musíme posílat i dodatečné informace (například typ zprávy). Přes WebSockety lze posílat více-méně pouze text (my chceme posílat objekt) a tak budeme muset využít serializaci do JSONu.

[JSON - Wikipedia](https://en.wikipedia.org/wiki/JSON)

```jsx
// src/websockets.js
export const sendTodosToAllConnections = async () => {
  const todos = await db('todos').select('*')

  const html = await ejs.renderFile('views/_todos.ejs', {
    todos,
  })

  for (const connection of connections) {
    const message = {
      type: 'todos',
      html,
    }

		// JSON je globální objet a tak se nemusí importovat
    const json = JSON.stringify(message)

    connection.send(json)
  }
}
```

```jsx
// views/index.ejs
<script>
  const ws = new WebSocket('ws://localhost:3000')

  ws.addEventListener('message', (message) => {
    const json = JSON.parse(message.data)

    if (json.type === 'todos') {
      document.getElementById('todos').innerHTML = json.html
    }
  })
</script>
```
