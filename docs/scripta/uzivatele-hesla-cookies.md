# Uživatelé, hesla & cookies

V této kapitole si zopakujeme vše, co jsme se během semestru naučili. Hodně aplikací na internetu má nějaký způsob registrace a přihlašování, tak přidáme podobnou funkcionalitu do naší ToDos aplikace.

## Uživatelé

Jelikož jsme si ukázali testy a TDD, budeme se této praktiky držet. Vytvoříme si `tests/users.spec.js` s nutným kódem a prvním testem.

```jsx
// tests/users.spec.js
import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db, { createUser } from '../src/db.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial('create new user', async (t) => {
  const user = await createUser('name', 'password')

  t.is(user.name, 'name')
  t.not(user.hash, 'password')
})
```

Do databáze nechceme ukládat hesla v plain textu (kdyby nám někdo ukradl databázi aby se nedostal k heslům uživatelů) a tak v testu můžeme i ověřit že `user.hash` kam budeme ukládat zahashovaná hesla neobsahuje zadané heslo.

Pokud spustíme testy zjistíme, že neexistuje funkce `createUser`. Tak si ji vytvoříme.

```jsx
// src/db.js
export const createUser = async (name, password) => {
}
```

Pro hashování budeme používat knihovnu `crypto` která je součástí Node.js. Nemusíme nic instalovat a můžeme ji rovnou importovat.

```jsx
// src/db.js
import crypto from 'crypto'
```

Co budeme u uživatelů ukládat? `name` a `hash` (hash hesla) je jasné. Dále budeme potřebovat ukládat sůl (další bezpečnostní složka při ukládání hesel do databáze) a token, který bude mít každý uživatel unikátní a po přihlášení ho budou pouýívat místo jména a hesla k autentifikaci. Sůl i token bude náhodně vygenerovaný řetězec. Hash spočítáme.

```jsx
// src/db.js
export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const token = crypto.randomBytes(16).toString('hex')
}
```

`100000` reprezentuje počet iterací kolikrát se hash “přepočítá”. Čím větší číslo, tím je heslo bezpečněji zahashováno, ale zároveň výpočet hashe déle trvá. `64` je délka výsledného hashe. `sha512` algoritmus použitý k výpočtu hashe.

Nyní můžeme všechny údaje uložit do databáze. `.insert` vrací pole s IDčkami záznamů, které byli vytvořeny. My budeme chtít z funkce `createUser` nově vytvořeného uživatele vrátit a tak ho po vytvoření z databáze rovnou vytáhneme.

```jsx
// src/db.js
export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const token = crypto.randomBytes(16).toString('hex')

  const [user] = await db('users').insert({ name, salt, hash, token }).returning('*')

  return user
}
```

Teď nám testy poví, že neexistuje tabulka `users`. Takže přidáme migraci, který tabulku vytvoří.

```jsx
npx knex migrate:make add_users_table
```

Nezapomeneme změnit CommonJS export na ESM (z `exports.up =` na `export const up =`).

```jsx
// migrations/1234_add_users_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id')
    table.string('name').notNullable().unique()
    table.string('salt').notNullable()
    table.string('hash').notNullable()
    table.string('token')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable('users')
}
```

Nyní by testy měli procházet.

Pokud chceme otestovat aplikaci v prohlížeči, nesmíme zapomenout manuálně spustit migrace!

```jsx
npx knex migrate:latest
```

Zároveň si i vytvoříme druhý test pro funkci `getUser`

```jsx
// tests/users.spec.js
import db, { createUser, getUser } from '../src/db.js'

// ...

test.serial('get user by name and password', async (t) => {
  const user = await createUser('name', '1234')

  t.deepEqual(await getUser('name', '1234'), user)
  t.notDeepEqual(await getUser('name', 'bad password'), user)
  t.notDeepEqual(await getUser('bad name', '1234'), user)
})
```

A dáme se do psaní `getUser` funkce.

```jsx
// src/db.js
export const getUser = async (name, password) => {
  const user = await db('users').where({ name }).first()
  if (!user) return null

  const salt = user.salt
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  if (hash !== user.hash) return null

  return user
}
```

`hash` je počítán stejně jako ve funkce `createUser` ale `salt` už není náhodně generován, ale je použit `salt` daného uživatele, který byl zároveň s uživatelem uložen v databázi.

## Registrace

A začneme rovnou testem

```jsx
// tests/users.spec.js
test.serial('GET /register shows registration from', async (t) => {
  const response = await supertest(app).get('/register')

  t.assert(response.text.includes('Registrace'))
})
```

Express nezná cestu GET /register a tak vytvoříme nový handler pro tuto cestu.

```jsx
// src/app.js
app.get('/register', async (req, res) => {
  res.render('register')
})
```

A protože renderujeme nový `register` view, musíme ho vytvořit.

```jsx
// views/register.ejs
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Registrace</h1>
    <form action="/register" method="post">
      <input type="text" name="name" />
      <input type="password" name="password" />
      <button type="submit">Registrovat se</button>
    </form>
  </body>
</html>
```

Formulář se nám již zobrazuje, takže jdeme implementovat jeho odesílání.

```jsx
// tests/users.spec.js
test.serial('POST /register will create new user', async (t) => {
  await supertest(app).post('/register').type('form').send({ name: 'adam', password: '1234' })

  t.not(await getUser('adam', '1234'), null)
})
```

Handler (nezapomenout impor `createUser` funkce)

```jsx
// src/app.js
import db, { createUser } from './db.js'

app.post('/register', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  await createUser(name, password)

  res.redirect('/')
})
```

Po lepší ovládání přídáme odkaz na `index.ejs`

```jsx
// views/index.ejs
<a href="/register">Registrace</a>

<hr />
```

## Cookies

Chtěli bychom, aby registrace nás zároveň přihlásila a aby na domovské obrazovce bylo zobrazeno jméno aktuálně přihlášeného uživatele. Jelikož HTTP je bezstavové, využijeme cookies k uložení tokenu uživatele do prohlížeče. Prohlížeč s každým požadavkem odesílá zároveň i cookies ze kterých vyčteme token a tak poznáme o jakého uživatele se jedná.

Pokud chceme aby si supertest pamatoval cookies mezi requesty, tak jako prohlížeč, potřebujeme instanci agenta kam si cookie ukládá.

```jsx
// tests/users.spec.js
test.serial('after registration and redirect user name is visible', async (t) => {
  const agent = supertest.agent(app)

  const response = await agent.post('/register').type('form').send({ name: 'adam', password: '1234' }).redirects(1)

  t.assert(response.text.includes('adam'))
})
```

Dříve express obsahoval middleware pro zpracování cookies, dnes ho musíme nainstalovat jako extra knihovnu.

```jsx
npm install cookie-parser
```

A přidáme mezi seznam middlewarů.

```jsx
// src/app.js
import express from 'express'
import cookieParser from 'cookie-parser'
// ...
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
```

Nyní můžeme po registraci uložit prohlížeči mezi cookies nové cookie s tokenem.

```jsx
// src/app.js
app.post('/register', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  const user = await createUser(name, password)

  res.cookie('token', user.token)

  res.redirect('/')
})
```

Jelikož uživatel je přihlášen “na všech stránkách”, budeme chtít logiku ziskání přihlášeného uživatele mít na jednom místě pro všechny handlery. Využijeme tedy univerzální middleware který přidáme před všechny handlery.

```jsx
// src/app.js
import db, { createUser, getUserByToken } from './db.js'
// ...
app.use(cookieParser())

app.use(async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    res.locals.user = await getUserByToken(token)
  } else {
    res.locals.user = null
  }

  next()
})

app.get('/', async (req, res) => {
// ...
```

Do `src/db.js` doplníme `getUserByToken`.

```jsx
// src/db.js
export const getUserByToken = async (token) => {
  const user = await db('users').where({ token }).first()

  return user
}
```

A jako poslední přidáme vykreslení jména uživatele do view.

```jsx
// views/index.ejs
<% if (user) { %>
  <%= user.name %>
<% } else { %>
  <a href="/register">Registrace</a>
<% } %>

<hr />
```

## Schování cesty nepřihlášeným uživatelům

Představme si, že nechceme aby nepřihlášení uživatelé viděli naši aplikace. Po pokusu zobrazení seznamu ToDos na / chceme nepřihlášené uživatele přesměrovat na formulář s registrací/přihlášením. Podobnou funkcionalitu budeme chtít i u ostatních cest (přidání nového ToDo, úprava existujícího ToDo, ...). Budeme tedy chtít mít nějakou univerzální ochranu request handlerů. Middleware je zde ideální volba.

Tento middleware se podívá zda existuje user (např zda existuje `req.cookie.token` nebo zda existuje `res.locals.user`, který jsme nastavili dříve) a pokud ano, pomocí `next` funkce spustí následující middleware v pořadí (nejspíše finální route handler) a pokud ne, přesměruje uživatele na registrační formulář.

```jsx
// src/app.js
const auth = (req, res, next) => {
  if (res.locals.user) {
    next()
  } else {
    res.redirect('/register')
  }
}
```

Jelikož budeme tento middleware využívat na více místech, uložíme si ho do proměnné.

Nyní pokud chceme tímto middlewarem “ochránit” nějakou cestu, přidáme ji před daný route handler.

```jsx
// src/app.js
app.get('/', auth, async (req, res, next) => {
  const query = db('todos').select('*')
	// ...
```

`app.get` má nyní tři parametry. První je stále cesta na které poslouchá, ale druhý je nyní náš nový middleware. Původní route handler je nyní třetí parametr. Tzn funkce `next` v `auth` middlewaru po zavolání předává řízení právě do route handleru.

Tato úprava nám rozbije testy. To není špatně. Změnili jsme veřejné rozhraní aplikace (nově nejde používat když nejsme přihlášeni) a tak nás na to neprocházející testy upozorní.

## Samostatné cvičení

Jako samostatné cvičení si zkuste udělat formulář pro přihlášení již registrovaných uživatelů, tlačítko pro odhlášení a popř i schování aplikace za autentifikaci.
