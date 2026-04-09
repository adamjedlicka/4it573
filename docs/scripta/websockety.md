# WebSockety

Browsery mají zabudovanou podporu pro WebSockety. Hono nabízí podporu pro WebSockety přes balíček `@hono/node-ws`.

[WebSocket - Wikipedia](https://en.wikipedia.org/wiki/WebSocket)

```jsx
npm install @hono/node-ws
```

## Vytvoření WebSocket serveru

Z `@hono/node-ws` importneme funkci `createNodeWebSocket` a z `hono/ws` typ `WSContext` (pro JSDoc nápovědu editoru).

```jsx
// index.js
import { createNodeWebSocket } from '@hono/node-ws'
import { WSContext } from 'hono/ws'
```

`createNodeWebSocket` potřebuje znát naši Hono aplikaci, předáme ji tedy jako parametr. Vrátí nám dvě funkce:

- `upgradeWebSocket` — použijeme ji jako handler na routě kam se klienti budou připojovat
- `injectWebSocket` — propojí WebSocket podporu s HTTP serverem (zavoláme ji po `serve()`)

```jsx
// index.js
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
```

Přidáme routu `/ws` která bude obsluhovat WebSocket spojení. `upgradeWebSocket` přijímá callback který vrací objekt s handlery pro jednotlivé WebSocket události.

```jsx
// index.js
app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      console.log('Nové spojení')
    },
    onMessage: (evt, ws) => {
      console.log('Zpráva:', evt.data)
    },
    onClose: (evt, ws) => {
      console.log('Spojení ukončeno')
    },
  })),
)
```

Po `serve()` zavoláme `injectWebSocket(server)` aby Hono vědělo na jakém HTTP serveru má WebSockety zprovoznit.

```jsx
// index.js
const server = serve(app, (info) => {
  console.log(`Server started on http://localhost:${info.port}`)
})

injectWebSocket(server)
```

### Odesílání dat na clienta

Hlavní výhoda WebSocketů je možnost aby server odeslal clientovi data bez toho aniž by se je client vyžádal nějakým požadavkem. WebSockety jsou tedy vhodné při implementaci chatu či notifikací. Pokud chceme ze serveru odeslat prohlížeči data, provedeme to metodou `.send` na konkrétním spojení `ws`.

```jsx
// index.js
app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      // Každych 1000ms (1s) spusť kód uvnitř callbacku
      setInterval(() => {
        ws.send('Hello from server!')
      }, 1000)
    },
  })),
)
```

Tento kód zatím nic nedělá protože prohlížeč musí nejdříve požádat o otevření WebSocket spojení. Upravíme tedy `views/index.html` a před `</body>` přidáme script tag.

```jsx
// views/index.html
    ...
    <script>
      // místo protokolu http použijeme ws
      // adresa, port a cesta musí souhlasit s routou na serveru
      const ws = new WebSocket('ws://localhost:3000/ws')

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
// views/index.html
<script>
  const ws = new WebSocket('ws://localhost:3000/ws')

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
// index.js
app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      setInterval(() => {
        ws.send('Hello from server!')
      }, 1000)
    },
    onMessage: (evt, ws) => {
      console.log(evt.data)
    },
  })),
)
```

Nyní po refreshnutí browseru by nám měli chodit zprávy oběma směry.

### Odeslání dat všem spojením

V naší todo aplikaci chceme udělat, aby když někdo jakkoliv aktualizuje todo, tato změna se okamžitě projeví všem ostatním uživatelům kteří mají naší ToDos aplikaci otevřenou. Budeme tedy chtít odeslat zprávu ze serveru všem aktuálně připojeným clientům. Každého připojeného clienta si budeme muset někam uložit. Na toto je vhodná datová struktura set.

[Data Structures - Sets For Beginners](https://tutorialedge.net/compsci/data-structures/sets-for-beginners/)

```jsx
// index.js
/**
 * @type {Set<WSContext<WebSocket>>}
 */
let webSockets = new Set()
```

`/** @type {Set<WSContext<WebSocket>>} */` je komentář, který JavaScript ignoruje ale editor z něj pozná datový typ konstanty `webSockets` a to konkrétně že se jedná o `Set` `WSContext`ů. Editor pak při psaní kódu s `webSockets` napovídá metody. Není to nutné, ale pomocné při vývoji. Těmto speciálním komentářům se říká JSDoc.

[JSDoc - Wikipedia](https://en.wikipedia.org/wiki/JSDoc)

A nyní můžeme přidávat nově otevřená spojení do seznamu a odebírat uzavřená.

```jsx
// index.js
app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      webSockets.add(ws)
      console.log('open web sockets:', webSockets.size)
    },
    onClose: (evt, ws) => {
      webSockets.delete(ws)
      console.log('close')
    },
  })),
)
```

Po změně stavu budeme chtít odesílat informaci o změně všem spojením. Připravíme si tedy funkci `sendTodosToAllWebsockets`.

```jsx
// index.js
const sendTodosToAllWebsockets = async () => {

}
```

A zavoláme ji v handlerech kde dochází ke změnám, například v `/toggle-todo/:id`:

```jsx
// index.js
app.get('/toggle-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const todo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()

  await db.update(todosTable).set({ done: !todo.done }).where(eq(todosTable.id, id))

  // Zde informujeme všechna spojení o změně
  // I přesto že funkce je asynchronní, nechceme ji awaitovat
  // protože čekat až všechna spojení se dozví o změně a teprve pak
  // poslat odpověď uživatelovi, který změnu inicioval.
  // Tím že zde není await stále informujeme všechny uživatele o změne,
  // ale nečekáme na a rovnou jdeme dál.
  sendTodosToAllWebsockets()

  return redirectBack(c, '/')
})
```

Jak nejjednodušeji prohlížeči pošleme informaci o stavu změněnách ToDos? Pošleme mu HTML a řekneme mu ať se překreslí. Nechceme ale posílat celou HTML stránku, pouze tabulku s ToDos (nic jiného se změnit nemůže). Bude třeba tedy `views/index.html` rozdělit a tabulku s todos dát do samostatného souboru - takzvaný fragment. Tento fragment si dle konvence pojmenuju s podtržítkem - `views/_todos.html`

```jsx
// views/_todos.html
<table>
  <tr>
    <th>Text</th>
    <th>Hotovo</th>
    <th>Akce</th>
  </tr>

  <% for (const todo of todos) { %>
  <tr>
    <td><%= todo.title %></td>
    <td><%= todo.done ? 'ano' : 'ne' %></td>
    <td>
      <a href="/todo/<%= todo.id %>">Detail</a>
      <% if (todo.done) { %>
      <a href="/toggle-todo/<%= todo.id %>">Nehotovo</a>
      <a href="/remove-todo/<%= todo.id %>">Odstranit</a>
      <% } else { %>
      <a href="/toggle-todo/<%= todo.id %>">Hotovo</a>
      <% } %>
    </td>
  </tr>
  <% } %>
</table>
```

Uvnitř `views/index.html` tabulku kterou jsme přesunuli do fragmentu smažeme a nahradíme příkazem `include`.

```jsx
// views/index.html
<%- include('_todos') %>
```

Pokud se nyní podíváme do prohlížeče, nic by se nemělo změnit a výpis ToDos by měl zůstat identický. Aby jsme mohli jednoduše starou tabulku nahradit za novou, obalíme ji ještě do `div` tagu s id pomocí kterého ji bude JavaScript hledat.

```jsx
// views/index.html
<div id="todos">
  <%- include('_todos') %>
</div>
```

Nyní můžeme implementovat `sendTodosToAllWebsockets`.

```jsx
// index.js
const sendTodosToAllWebsockets = async () => {
  try {
    // Z databáze vybereme všechny todos
    // (fragment je potřebuje na vykreslení tabulky)
    const todos = await db.select().from(todosTable).all()

    // pomocí ejs vykreslíme fragment do HTML
    // (pozor zde je nutná přípona .html)
    const html = await ejs.renderFile('views/_todos.html', {
      todos,
      utils,
    })

    // Pro každé spojení ze seznamu všech spojení odešleme html
    for (const webSocket of webSockets) {
      webSocket.send(html)
    }
  } catch (e) {
    console.error(e)
  }
}
```

A implementace na clientovi:

```jsx
// views/index.html
<script>
  const ws = new WebSocket('ws://localhost:3000/ws')

  ws.addEventListener('message', (message) => {
    // Najdeme náš div dle ID
    // a nahradíme jeho vnitřní HTML za HTML co nám poslal server
    document.getElementById('todos').innerHTML = message.data
  })
</script>
```

Po refreshi browseru, otevření druhého okna a změně stavu nějakého ToDo by se měla změna přepsat i do druhého okna browseru. Pokud chceme aby se propisovaly i změny po přidání nebo smazání ToDo, přidáme `sendTodosToAllWebsockets()` do jednotlivých handlerů v `index.js`.

### Různé typy zpráv

Aktuálně posíláme přes WebSockety čisté HTML. Tudíž by nebylo možné například přidat podobnou funkcionalitu i na detail ToDo (nepoznali by jsme zda nám přišlo HTML s tabulkou ToDos nebo s detailem jednoho ToDo). Vedle HTML musíme posílat i dodatečné informace (například typ zprávy). Přes WebSockety lze posílat více-méně pouze text (my chceme posílat objekt) a tak budeme muset využít serializaci do JSONu.

[JSON - Wikipedia](https://en.wikipedia.org/wiki/JSON)

```jsx
// index.js
const sendTodosToAllWebsockets = async () => {
  try {
    const todos = await db.select().from(todosTable).all()

    const html = await ejs.renderFile('views/_todos.html', {
      todos,
      utils,
    })

    for (const webSocket of webSockets) {
      // JSON je globální objekt a tak se nemusí importovat
      webSocket.send(
        JSON.stringify({
          type: 'todos',
          html,
        }),
      )
    }
  } catch (e) {
    console.error(e)
  }
}
```

```jsx
// views/index.html
<script>
  const ws = new WebSocket('ws://localhost:3000/ws')

  ws.addEventListener('message', (message) => {
    const json = JSON.parse(message.data)

    if (json.type === 'todos') {
      document.getElementById('todos').innerHTML = json.html
    }
  })
</script>
```
