# Hono, EJS & middleware

Základní Node.js HTTP server není vhodný na komplexnější aplikace. Pokud bychom chtěli zobrazovat různý obsah na základě URL a HTTP metody, povede to ke špatně čitelnému a často se opakujícímu kódu:

```jsx
import http from 'http'
import fs from 'fs/promises'

const port = 3000

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      const response = await fs.readFile('index.html')
      res.statusCode = 200 // 200
      res.setHeader('Content-Type', 'text/html')
      res.end(response)
    } else if (req.method === 'POST' && req.url === '/add') {
      // ???
    } else {
      try {
        const response = await fs.readFile('public' + req.url)
        res.statusCode = 200
        // res.setHeader('Content-Type', '???')
        res.end(response)
      } catch {
        res.statusCode = 404 // Not found
        res.setHeader('Content-Type', 'text/plain')
        res.end('404 - Not found')
      }
    }
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end(e.message)
  }
})

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
```

Možností je samozřejmě refaktor do pomocných funkcí, ale vše by jsme si museli napsat sami. Mnohem jednodušší řešení je využít knihovnu `express` [https://www.npmjs.com/package/express](https://www.npmjs.com/package/express) . Express je jedna z nejběžnějších knihoven pro psaní serverů.

## Hono

Hono je knihovna, která nám usnadní práci při psaní serverů

```jsx
npm install hono
```

Hono samo o sobě neumí vystavit server pod Node.js a tak je potřeba doinstalovat dodatečnou knihovnu.

```jsx
npm install @hono/node-server
```

```jsx
import { Hono } from "hono"
import { serve } from "@hono/node-server"

const app = new Hono()

// get - HTTP metoda GET (může být i .post .patch .put .delete nebo univerzální .use)
// / - url pro kterou se zavolá callback
// c - context ve kterém Hono drří request (c.req), response (c.res) a pomocné funkce.
app.get("/", (c) => {
  // c.html funkce vytvoří HTML odpověď
  return c.html("<h1>Hello, World!</h1>")
})

app.get("/json", (c) => {
  // c.json funkce vytvoří JSON odpověď
  return c.json({ firstName: "Franta", lastName: "Sádlo" })
})

// :name reprezentuje dynamický parametr
// /hello/Franta - projde
// /hello/Lojza - projde
// /hello - neprojde
// /hello/Pepa/Zdepa - neprojde
app.get("/hello/:name", (c) => {
  const name = c.req.param("name")

  return c.html(`<h1>Hello, ${name}!</h1>`)
})

// Univerzální handler který zachytí všechny požadavky,
// které nezachytili handlery výše a zobrazí 404
app.use((c) => {
  console.log(`Not found: ${c.req.path}`)
  return c.notFound()
})

serve(app, (info) => {
  console.log(
    `Server listening at http://localhost:${info.port}`
  )
})

```

Pokud chceme vykreslovat dynamické HTML (server vrací personalizovanou odpověď například na základě stavu databáze), je vhodné použít šablonovací knihovnu (něco jako staré PHP které začalo jako šablonovací jazyk). Na NPM šablonovacích knihoven najdeme spousty a zde si ukážeme EJS [https://www.npmjs.com/package/ejs](https://www.npmjs.com/package/ejs)

```jsx
npm install ejs
```

`index.js`

```jsx
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { renderFile } from "ejs"

const app = new Hono()

app.get("/", async (c) => {
  const index = await renderFile("views/index.html")

  return c.html(index)
})

serve(app, (info) => {
  console.log(
    `App started on http://localhost:${info.port}`
  )
})

```

`views/index.html`

```jsx
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```

Jako druhý parametr funkce `renderFile` můžeme poslat objekt k jehož hodnotám bude mít EJS následně přístup.

`index.js`

```jsx
let id = 1

const todos = [
  {
    id: id++,
    text: "Vzít si dovolenou",
    done: false,
  },
  {
    id: id++,
    text: "Koupit Elden Ring",
    done: false,
  },
]

app.get("/", async (c) => {
  const index = await renderFile("views/index.html", {
    title: "ToDos!",
    todos,
  })

  return c.html(index)
})
```

`views/index.html`

```jsx
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= title %></h1>

    <table>
      <tr>
        <th>Text</th>
        <th>Hotovo</th>
      </tr>

      <% for (const todo of todos) { %>
      <tr>
        <td><%= todo.text %></td>
        <td><%= todo.done ? 'ano' : 'ne' %></td>
      </tr>
      <% } %>
    </table>
  </body>
</html>
```

EJS interpretuje vše co najde uvnitř speciálních tagů.

`<%= value %>` bezpečně vypíše hodnotu proměnné `value` (odstraní HTML nebezpečné znaky jako většítka a menšítka - chrání tak proti útokům typu XSS)

`<%- value ->` nebezpečně vypíše hodnotu proměnné `value` . Je možné tedy vkládat HTML. Nikdy nepoužívejte pro proměnné jež obsahují uživatelský obsah.

`<% příkaz %>` používá se pro JavaScriptové příkazy jako `for` nebo `if`.

## Middleware

Jedná se o funkce které jsou spuštené při každém požadavku na server a mohou pracovat s `c.req` a `c.res` objekty. Pomocí druhého parametru - funkce `next` také ovládají kdy je požadavek předán dalšímu middlewaru/handle funkci.

```jsx
app.use(async (c, next) => {
  // Tento middleware při každém requestu vypíše do konzole metodu a cestu reqeustu
  console.log(c.req.method, c.req.path)

  // Následně předá exekuci dalšímu middleware/handleru
  await next()

  // Poté co nějaký následující middleware/handler vratí odpověď, vypíšeme status
  console.log(c.res.status)
})

app.use(async (c, next) => {
  // Pokud uživatel nemaá Authorization hlavičku
  if (!c.req.header("Authorization")) {
    // Nastavíme status na 401
    c.status(401)
    // A vrátím hlášku Unauthorized
    return c.html("<h1>Unauthorized</h1>")
  }

  await next()
})
```

Middleware je tak skvělý nástroj pro modifikaci `req` & `res` objektů nebo pro univerzální požadavky (statické soubory)

```jsx
// Tento middleware nepoužívejte, existuje lepší řešení
app.use(async (c, next) => {
  if (c.req.path.startsWith("/public")) {
    // Pokud URL začíná na /public,
    // odešli obsah souboru z public adresáře a nepokračuj dál
    const data = await fs.readFile(
      path.join(process.cwd(), c.req.path)
    )

    return c.newResponse(data)
  } else {
    // Pokud URL nezačíná na /public jedná se o běžný dotaz a tak ho předáme dál
    await next()
  }
})
```

Middleware jsou spoušteny vždy v pořadí jakém jsou definovány

```jsx
app.use(...) // první
app.use(...) // druhý
app.use(...) // třetí
```

Middleware je možné omezit na určitou URL/metodu + kombinace

```jsx
app.use('/hello', (c, next) => {}) // GET, POST, ... na URL /hello
app.get((c, next) => {}) // GET na libovolné URL
```

Hono také nabízí několik zabudovaných middlewarů + hromady na NPM

## Přidání nového ToDo

Do `views/index.html` přidáme formulář pro vytváření nových ToDo

```html
<form action="/todos" method="post">
  <input type="text" name="title" />
  <button type="submit">Přidat todo</button>
</form>
```

A do `index.js` přidáme nový route handler

```jsx
// /todos koresponduje s action="/todos" z formuláře
// .post koresponduje s method="post" z formuláře
app.post('/todos', async (c) => {
  // Formulář uživatele poslal na URL /todos
	// Na této URL ovšem nechceme nic zobrazovat
	// (mohli by jsme zobrazit notifikaci o úspěchu/neúspěchu)
	// a tak uživatele přesměrujeme zpět na index
	return c.redirect('/')
})
```

Nyní se potřebujeme dostat k hodnotě z inputu text. Hodnoty z formuláře jsou odesílány v nepřívětivém formátu a tak použijeme funkci `c.req.formData()` která nám vrátí obsah formuláře který použijeme při vytvoření nového todo.

```jsx
app.post("/todos", async (c) => {
  const form = await c.req.formData()

  todos.push({
    id: todos.length + 1,
    title: form.get("title"),
    done: false,
  })

  return c.redirect("/")
})
```

Pro kontrolu celý `index.js`

```jsx
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { logger } from "hono/logger"
import { serveStatic } from "@hono/node-server/serve-static"
import { renderFile } from "ejs"

const todos = [
  {
    id: 1,
    title: "Zajit na pivo",
    done: false,
  },
  {
    id: 2,
    title: "Doplnit skripty",
    done: false,
  },
]

const app = new Hono()

app.use(logger())
app.use(serveStatic({ root: "public" }))

app.get("/", async (c) => {
  const index = await renderFile("views/index.html", {
    title: "My todo app",
    todos,
  })

  return c.html(index)
})

app.post("/todos", async (c) => {
  const form = await c.req.formData()

  todos.push({
    id: todos.length + 1,
    title: form.get("title"),
    done: false,
  })

  return c.redirect("/")
})

serve(app, (info) => {
  console.log(
    `App started on http://localhost:${info.port}`
  )
})
```

a `views/index.html`

```jsx
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Document</title>
  </head>
  <body>
    <h1><%= title.toUpperCase() %></h1>

    <ul>
      <% for (const todo of todos) { %>
      <li>
        <%= todo.title %>
      </li>
      <% } %>
    </ul>

    <form method="post" action="/todos">
      <input name="title" />
      <button type="submit">Přidat todo</button>
    </form>
  </body>
</html>

```

## Editace jednotlivých ToDos

Upravíme seznam a přidáme odkazy s akcemi

```html
<ul>
  <% for (const todo of todos) { %>
  <li>
    <a href="/todos/<%= todo.id %>"><%= todo.title %></a>
    -
    <% if (todo.done) { %>
	    <a href="/todos/<%= todo.id %>/toggle">dokončeno</a>
	    <a href="/todos/<%= todo.id %>/remove">odebrat</a>
    <% } else { %>
	    <a href="/todos/<%= todo.id %>/toggle">nedokončeno</a>
    <% } %>
  </li>
  <% } %>
</ul>
```

Odkazy z `a` tagů nyní vedou na URL jako `/todos/1/toggle`, `/todos/2/toggle` nebo `/todos/3/remove`. Jedná se tedy o dynamické URL. Proto v Hono použijeme v cestě dynamické parametry. `a` po kliknutí odesílá GET requesty a tak použijeme metodu `.get`

```jsx
app.get("/todos/:id/toggle", async (c) => {
  // Ujistíme se že id je číslo
  const id = Number(c.req.param("id"))

  // Najdeme todo podle id
  const todo = todos.find((todo) => todo.id === id)

  // Pokud sme todo nenašli, vrátíme 404 not found
  if (!todo) return c.notFound()

  // Pokud jsme našli změnime status done
  todo.done = !todo.done

  // Přesměrujeme uživatele zpět na výpis todos
  return c.redirect("/")
})

app.get("/todos/:id/remove", async (c) => {
  const id = Number(c.req.param("id"))

  // Pokud chceme smazat prvek v poli musíme najít jeho index (pozici v poli)
  const index = todos.findIndex((todo) => todo.id === id)

  // funkce .findIndex vrací -1 pokud element v poli nenašla (0 je první prvek)
  // vrátíme 404 not found
  if (index === -1) return c.notFound()

  // .splice(a, b) odstraní b elementů od indexu a
  todos.splice(index, 1)

  return c.redirect("/")
})
```
