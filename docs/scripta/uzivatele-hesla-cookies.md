# Uživatelé, hesla & cookies

V této kapitole si zopakujeme vše, co jsme se během semestru naučili. Většina aplikací vyžaduje registraci a přihlašování, tak přidáme tuto funkcionalitu do naší Todo aplikace.

## Uživatelé

Budeme se držet praktik TDD. Vytvoříme si `tests/users.spec.js` s prvním testem. Do databáze nechceme ukládat hesla v čitelné podobě, proto budeme ukládat jejich hash.

```jsx
// tests/users.spec.js
test.serial('create new user', async (t) => {
  const user = await createUser('name', 'password')

  t.is(user.name, 'name')
  t.not(user.hash, 'password') // heslo nesmí být v databázi čitelné
})
```

Pro hashování použijeme vestavěný modul `crypto`. U uživatele budeme ukládat `name`, `hash`, `salt` (bezpečnostní složka) a `token` (pro autentifikaci po přihlášení).

```jsx
// src/db.js
import crypto from 'crypto'

export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const token = crypto.randomBytes(16).toString('hex')

  const [user] = await db('users').insert({ name, salt, hash, token }).returning('*')
  return user
}
```

Nezapomeňte vytvořit migraci pro tabulku `users` pomocí `npx knex migrate:make add_users_table`.

```jsx
// migrations/..._add_users_table.js
export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id')
    table.string('name').notNullable().unique()
    table.string('salt').notNullable()
    table.string('hash').notNullable()
    table.string('token')
  })
}
```

## Registrace

Vytvoříme formulář pro registraci a handler pro jeho zpracování.

```jsx
// src/app.js
app.post('/register', async (req, res) => {
  const { name, password } = req.body
  await createUser(name, password)
  res.redirect('/')
})
```

## Cookies

Aby si prohlížeč pamatoval, že jsme přihlášeni, využijeme cookies k uložení tokenu. Nainstalujeme `cookie-parser`:

```bash
npm install cookie-parser
```

A přidáme jej do aplikace:

```jsx
import cookieParser from 'cookie-parser'
app.use(cookieParser())
```

Při registraci (nebo přihlášení) nastavíme cookie:

```jsx
res.cookie('token', user.token)
```

Pro zjištění přihlášeného uživatele u každého požadavku vytvoříme middleware:

```jsx
app.use(async (req, res, next) => {
  const token = req.cookies.token
  res.locals.user = token ? await getUserByToken(token) : null
  next()
})
```

## Ochrana cest (Authentication)

Aby k některým částem aplikace měli přístup pouze přihlášení uživatelé, vytvoříme middleware `auth`:

```jsx
const auth = (req, res, next) => {
  if (res.locals.user) {
    next()
  } else {
    res.redirect('/register')
  }
}
```

Tento middleware pak přidáme k cestám, které chceme chránit:

```jsx
app.get('/', auth, async (req, res) => {
  // ...
})
```

Tímto jsme zabezpečili naši aplikaci a umožnili uživatelům se registrovat a bezpečně přihlašovat.
