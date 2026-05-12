# Testování

Bezkonkurenčně nejpoužívanějším frameworkem pro testování v Node.js je `jest`, který má hromadu funkcionalit a doporučuji jej použít pro větší projekty. Pro jednoduchost my použijeme `ava`.

[ava](https://www.npmjs.com/package/ava)

> Velmi populární je také kombinace knihoven `mocha` a `chai`.

Nainstalujeme balíček `ava` jako vývojovou závislost (testy spouštíme pouze při vývoji, ne za běhu aplikace):

```jsx
npm install ava
```

V `package.json` upravíme skript `test`:

```jsx
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "ava"
},
```

Otestujeme, zda vše funguje:

```jsx
npm run test // ✖ Couldn’t find any files to test
```

Jelikož nemáme napsané žádné testy, `ava` nemůže žádné spustit. Vytvoříme si adresář `tests`, kde budou soubory končící na příponu `.spec.js` (nebo `.test.js`), kam budeme jednotlivé testy psát.

> `spec` je zkratka pro *specification* – testy slouží jako specifikace toho, jak by se program měl chovat.

## Jednotkové testy (unit tests)

[Unit testing – Wikipedia](https://en.wikipedia.org/wiki/Unit_testing)

V dnešní době se jednotkové testy těší velké popularitě. Netestují celý program, ale pouze jeho jednotky (malé kousky). Jednotka může být funkce, třída nebo skupina funkcí/tříd. Jednotkové testy jsou nejvhodnější, pokud testujeme kód, který má vstup, výstup a žádné vedlejší efekty (komunikace s databází, webový server, manipulace se soubory atd.).

Vytvoříme si soubor `tests/unit.spec.js`:

```jsx
// tests/unit.spec.js
import test from 'ava'

// První parametr funkce test je název testu.
// Druhý parametr je funkce se samostatným testem.
// Tato funkce obdrží parametr t, pomocí kterého testujeme hodnoty.
test('true is true', (t) => {
  t.is(true, true)
})
```

Pomocí `npm run test` spustíme testy a `ava` nám vrátí informaci, že testy procházejí. Zkuste změnit jedno `true` na `false` a znovu vyzkoušet `npm run test`.

`ava` nabízí několik funkcí na testování hodnot:

```jsx
// Tento test projde pouze pokud je hodnota truthy
t.assert(hodnota, 'Zpráva zobrazená při neúspěchu')
// Tento test projde, pokud jsou hodnoty `a` a `b` identické (`a === b`)
t.is(a, b)
// Tento test projde, když objekty/pole `a` a `b` mají stejnou strukturu a hodnoty
t.deepEqual(a, b)
```

### Test Driven Development (TDD)

Při psaní jednotkových testů je možné praktikovat TDD – nejprve píšeme testy a pak teprve kód. Vyzkoušíme si to na funkci FizzBuzz.

[Fizz buzz – Wikipedia](https://en.wikipedia.org/wiki/Fizz_buzz)

```jsx
// src/fizzbuzz.js
export const fizzbuzz = () => {

}
```

```jsx
// tests/fizzbuzz.spec.js
import test from 'ava'
import { fizzbuzz } from '../src/fizzbuzz.js'

test('fizzbuzz returns 1 for input 1', (t) => {
  t.is(fizzbuzz(1), 1)
})
```

Máme napsaný test a pomocí `npm run test` vyzkoušíme, zda implementace stačí. Funkce by měla vrátit `1`, ale vrátí `undefined`. To je jednoduché napravit:

```jsx
// src/fizzbuzz.js
export const fizzbuzz = () => {
  return 1
}
```

Nyní testy procházejí a můžeme napsat další:

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns 2 for input of 2', (t) => {
  t.is(fizzbuzz(2), 2)
})
```

Spustíme testy a zjistíme, že vrací `1` místo `2`. Opravíme:

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  return n
}
```

Testy opět fungují. Ale tato funkce ještě neimplementuje FizzBuzz algoritmus. Napíšeme další test:

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "fizz" for input of 3', (t) => {
  t.is(fizzbuzz(3), 'fizz')
})
```

A opravujeme co nejjednodušším způsobem:

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n === 3) {
    return 'fizz'
  } else {
    return n
  }
}
```

Postupně přidáváme testy pro 5, 6, 10, 15 atd., až se dostaneme ke korektnímu kódu:

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n % 15 === 0) {
    return 'fizzbuzz'
  } else if (n % 3 === 0) {
    return 'fizz'
  } else if (n % 5 === 0) {
    return 'buzz'
  } else {
    return n
  }
}
```

Nyní už nejsme schopni vymyslet žádný test, který by neprocházel, a tak víme, že je funkce korektní.

## Integrační a akceptační testy

I přesto, že jednotkové testování je super, u webových aplikací často nestačí. Většinu věcí, co naše aplikace dělá, jsou vedlejší efekty (databáze, HTTP server), což pro jednotkové testy není vhodné.

Testy by měly testovat veřejné rozhraní aplikace. U naší Todo aplikace jsou to HTTP požadavky na vstupu a HTML na výstupu. K testování celku nám pomůže knihovna `supertest`.

[supertest](https://www.npmjs.com/package/supertest)

```jsx
npm install supertest
```

Abychom mohli aplikaci testovat jako celek, musíme ji extrahovat do samostatného souboru `src/app.js` a oddělit ji od spuštění serveru (`app.listen`).

```jsx
// src/app.js
import express from 'express'
export const app = express()
// ... zbytek definice aplikace bez app.listen
```

`index.js` pak bude vypadat takto:

```jsx
import { app } from './src/app.js'
const port = 3000
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
```

### Testovací databáze

Při testování nechceme ovlivňovat produkční data. Využijeme tedy testovací databázi v paměti (`:memory:`). Upravíme `knexfile.js`:

```jsx
// knexfile.js
export default {
  development: { /* ... */ },
  test: {
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: false,
  },
}
```

V `src/db.js` pak zajistíme výběr správné konfigurace:

```jsx
const db = knex(knexfile[process.env.NODE_ENV || 'development'])
```

### Testování Todos

Vytvoříme si `tests/todos.spec.js`. Pomocí funkcí `beforeEach` a `afterEach` zajistíme čistý stav databáze pro každý test:

```jsx
import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db from '../src/db.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial('GET / lists todos', async (t) => {
  const text = 'Testovací todo!!!'
  await db('todos').insert({ text })

  const response = await supertest(app).get('/')
  t.assert(response.text.includes(text))
})
```

Tímto způsobem testujeme reálné rozhraní aplikace a ověřujeme, že se data správně vypisují do HTML.
