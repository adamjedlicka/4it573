# Testování

Bezkonkurenčně nejpoužívanější framework pro testování v Node.js je `jest`, který má hromadu funkcionalit a doporučuji ho použít pro větší projekty. Pro jednoduchost, my použijeme `ava`.  

[ava](https://www.npmjs.com/package/ava)

> Velmi populární je také kombinace knihoven `mocha` a `chai`.
> 

Nainstalujeme balíček `ava` jako development dependency (testy spouštíme pouze při vývoji, ne za běhu aplikace).

```jsx
npm install ava
```

V `package.json` upravíme script `test`

```jsx
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "ava"
},
```

Otestujeme, zda vše funguje

```jsx
npm run test // ✖ Couldn’t find any files to test
```

Jelikož nemáme napsané žádné testy, `ava` nemůže žádné spustit. Vytvoříme si adresář `tests` kde budou soubory končíci na příponu `.spec.js` (nebo `.test.js`) kam budeme jednotlivé testy psát.

> `spec` je zkratka pro specification - testy slouží jako specifikace toho jak by se program měl chovat
> 

## Jednotkové testy (unit tests)

[Unit testing - Wikipedia](https://en.wikipedia.org/wiki/Unit_testing)

V dnešní době se jednotkové testy těší velké popularitě. Jednotkové testy netestují celý program ale pouze jeho jednotky (malé kousky). Jednotka může být funkce, třída, nebo skupina funkcí/tříd. Jednotkové testy jsou nejvhodnější pokud testujeme kód který má vstup, výstup a žádné vedlejší efekty (komunikace s databází, webový server, manipulace se soubory, ...). 

Vytvoříme si soubor s jednotkovými testy. Na názvu (kromě `.spec.js` přípony nezaléží) a tak vytvoříme soubor `tests/unit.spec.js`

```jsx
// tests/unit.spec.js
import test from 'ava'

// První parametr funkce je test je název testu.
// Druhý parametr je funkce se samostatným testem.
//   Tato funkce obrží parametr t, pomocí kterého testujeme hodnoy.
test('true is true', (t) => {
	t.is(true, true)
})
```

Pomocí `npm run test` spustíme testy a `ava` nám vrátí informaci, že všechny testy prochází. Zkuste změnit jedno `true` na `false` (nebo jinou hodnotu) a znovu vyzkoušet `npm run test`.

`ava` nabízí několik funkcí na testování hodnot

```jsx
// Tento test projde pouze pokud hodnota bude truthy (`!!hodnota === true`)
t.assert(hodnota, 'Zpráva která bude zobrazena pokud hodnota není truthy')
// Tento test projde pokud hodnoty `a` a `b` jsou identické (`a === b`)
t.is(a, b)
// Tento test projde když objekty/pole `a` a `b` mají stejnou strukturu
// a obsahují stejné hodnoty
t.deepEqual(a, b)
```

### Test driven development

Při psaní jednotkových testů je možné praktikovat TDD - test driven development. Nejprve píšeme testy a pak teprve kód. Vyzkoušíme si to na funkci FizzBuzz.

[Fizz buzz - Wikipedia](https://en.wikipedia.org/wiki/Fizz_buzz)

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

Máme napsaný test a pomocí `npm run test` můžeme vyzkoušet zda naše implementace FizzBuzz je dostatečná.

```jsx
tests/fizzbuzz.spec.js:6

5: test('fizzbuzz returns 1 for input 1', (t) => {
6:   t.is(fizzbuzz(1), 1)                         
7: })                                             

Difference:

- undefined
+ 1
```

Jak můžeme vidět, funkce `fizzbuzz` měla vrátit `1`, ale vrátila `undefined`. To je, jednoduché napravit.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = () => {
	return 1
}
```

Testy prochází a můžeme napsat další test.

```jsx
// tests/fizzbuzz.spec.js
import test from 'ava'
import { fizzbuzz } from '../src/fizzbuzz.js'

test('fizzbuzz returns 1 for input of 1', (t) => {
	t.is(fizzbuzz(1), 1)
})

test('fizzbuzz returns 2 for input of 2', (t) => {
	t.is(fizzbuzz(2), 2)
})
```

Spustíme testy a zjistíme, že `fizzbuzz` měl vrátit `2` ale vrací `1`. Opět jednoduché opravit.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
	return n
}
```

Testy nám opět fungují. Ale tato funkce uričtě neimplementuje FizzBuzz algoritmus. Musíme se tedy zamyslet jaký nejjednodušší a zároveň neprocházející test napsat.

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "fizz" for input of 3', (t) => {
  t.is(fizzbuzz(3), 'fizz')
})
```

Testy neprocházejí a dáme se do opravování.

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

Pokud se zamyslíme, tato podmínka určitě není korektní. Ale TDD nám říká, že neprocházející test máme opravit co nejjednodušším kódem (v rámci mezí), i když víme, že není 100% korektní. Dříve nebo později se ale díky dalším testům ke korektnímu kódu dostaneme. Jdeme tedy psát další test.

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "buzz" for input of 5', (t) => {
  t.is(fizzbuzz(5), 'buzz')
})
```

A opravujeme.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n === 3) {
    return 'fizz'
  } else if (n === 5) {
    return 'buzz'
  } else {
    return n
  }
}
```

A další test.

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "fizz" for input of 6', (t) => {
  t.is(fizzbuzz(6), 'fizz')
})
```

Nyní použijeme už “inteligentní” opravu. Nemá cenu to dále protahovat.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n % 3 === 0) { // zde je změna
    return 'fizz'
  } else if (n === 5) {
    return 'buzz'
  } else {
    return n
  }
}
```

A další test.

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "buzz" for input of 10', (t) => {
  t.is(fizzbuzz(10), 'buzz')
})
```

A podobná oprava jako u trojky.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n % 3 === 0) {
    return 'fizz'
  } else if (n % 5 === 0) { // zde je změna
    return 'buzz'
  } else {
    return n
  }
}
```

A další test.

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "fizzbuzz" for input of 15', (t) => {
  t.is(fizzbuzz(15), 'fizzbuzz')
})
```

Nejprve uděláme opět hloupou opravu.

```jsx
// src/fizzbuzz.js
export const fizzbuzz = (n) => {
  if (n === 15) {
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

A dalším testem se jí pokusíme “zinteligentnít”:

```jsx
// tests/fizzbuzz.spec.js
test('fizzbuzz returns "fizzbuzz" for input of 30', (t) => {
  t.is(fizzbuzz(30), 'fizzbuzz')
})
```

A poslední oprava.

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

Nyní už nejsme schopni vymyslet žádný test který by nejprve neprocházel (a zároveň nebyl nesmyslný) a tak víme, že je funkce `fizzbuzz` korektní.

TDD lze aplikovat i u jiných typů testů než jsou jednotkové, ale u jednotkového testování bývá TDD nejběžnější a nejjednodušší na provedení.

## Užitečné testy (integrační/regresní/akceptační)

I přesto, že jednotkové testování je super, často se stává, že není úplně použitelné. Jak by jsme například pomocí jednotkových testů testovali naši ToDo aplikaci? Rozdělená do funkcí moc není a i kdyby byla tak funkce budou tak jednoduché, že je pomalu nemá cenu testovat. Většinu věcí co naše aplikace dělá jsou vedlejší efekty (komunikace s databází, servírování HTML přes `express`, ...) což není pro jednotkové testy vhodné.

Testy by vždycky měli testovat veřejné rozhraní čehokoliv (funkce, třídy, aplikace). Co je veřejné rozhraní naší ToDos aplikace? Na vstupu HTTP požadavky a HTML jako odpověď. Pojďme tedy naši aplikaci otestovat jako celek. K tomu nám pomůže super knihovna `supertest`.

[supertest](https://www.npmjs.com/package/supertest)

```jsx
npm install supertest
```

Aby jsme mohli testovat naši aplikaci jako celek, musíme provést jeden refaktor. Aktuálně aplikace i její spuštění (`app.listen`) se nachází v jednom souboru. Nemůžeme tedy pracovat s naší aplikací bez toho aby se automaticky spustil HTTP server. Extrahujeme tedy celou aplikaci do souboru `src/app.js`. Upravíme cesty importů, exportujeme express aplikaci `app` a smažeme `port` a kód který vytváří server.

```jsx
// src/app.js
import express from 'express'
import db from './db.js' // upravená cesta importu
import {
  sendDeleteToAllConnections,
  sendTodosToAllConnections,
  sendTodoToAllConnections,
} from './websockets.js' // upravená cesta importu

// Zde smazána konstanta s portem

// Zde přidán export
export const app = express()

// Zbytek souboru stejný, akorát chybí app.listen a volání createWebSocketServer
```

Tento kus kódu z `src/app.js` smažeme:

```jsx
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

createWebSocketServer(server)
```

A `index.js` nyní vypadá takto:

```jsx
import { app } from './src/app.js'
import { createWebSocketServer } from './src/websockets.js'

const port = 3000

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

createWebSocketServer(server)
```

### Testovací databáze

Jelikož testujeme celou aplikaci, testy budou šahat do databáze. Nechceme ale aby nám testy ovlivňovali naši databázi (nebo naopak stav databáze ovlivnil testy). Budeme potřebovat tedy databázi speciálně pro testování.

Upravíme `knexfile.js`

```jsx
// knexfile.js
export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './mydb.sqlite',
    },
    useNullAsDefault: false,
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: false,
  },
}
```

Uvnitř `knexfile.js` máme nyní dvě konfigurace. Jednu pro vývoj (`development`) a druhou pro testování (`test`). Jelikož chceme aby testy byli rychlé stav databáze nás přímo nezajímá, můžeme pomocí `:memory:` SQLite říct aby nevytvářela soubor na disku ale data ukládala pouze do paměti.

Musíme ještě upravit `src/db.js` a knexu předat správny objekt s konfigurací databáze (teď neví zda vybrat `development` nebo `test`).

```jsx
// src/db.js
import knex from 'knex'
import knexfile from '../knexfile.js'

const db = knex(knexfile[process.env.NODE_ENV || 'development'])
```

`process.env.NODE_ENV` je speciální proměnná která obsahuje prostředí ve kterém Node.js běží. Pokud spustíme testy, bude obsahovat hodnotu `test`. Pro jistotu přidáme ještě `|| 'development`' což způsobí, že pokud `process.env.NODE_ENV` je prázdný, použije se hodnota `development` (`||` je nebo).

Nyní můžeme začít psát testy.

### Testování ToDos

Vytvoříme si `tests/todos.spec.js` . Ještě než se spustí nějaký test musíme dostat databázi do správného stavu. Na to využijeme migrace a `beforeEach` a `afterEach` funkce které poskytuje `ava`.

```jsx
// tests/todos.spec.js
import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db from '../src/db.js'

// test.beforeEach spustí callback před každým testem
test.beforeEach(async () => {
	// Před každým testem spustíme migrace
  await db.migrate.latest()
})

// test.afterEach spustí callback po každém testu
test.afterEach(async () => {
	// Po každém testu migrace rollbackneme
	// a databázi tak uklidíme pro použití v dalším testu.
	// Aby toto fungovalo je třeba mít implementované down funkce v migracích.
  await db.migrate.rollback()
})
```

A můžeme začít prást první test.

```jsx
// tests/todos.js

// Ava by-default pouští všechny testy zároveň (paralelně).
// Jelikož používáme databázi, musíme je pouštet po sobě (sériově)
// aby si navzájem nešahali na data v databázi.
test.serial('GET / lists todos', async (t) => {
	
})
```

Nejprve musíme do databáze vložit nějaké ToDo.

```jsx
// tests/todos.js
test.serial('GET / lists todos', async (t) => {
  const text = 'Testovací todo!!!'

  await db('todos').insert({ text })
})
```

Nyní uděláme dotaz na `/` a podíváme se, zda v HTML, které jsme dostali ze serveru najdeme text `Testovací todo!!!` .

```jsx
// tests/todos.js
test.serial('GET / lists todos', async (t) => {
  const text = 'Testovací todo!!!'

  await db('todos').insert({ text })

  const response = await supertest(app).get('/')

  t.assert(response.text.includes(text), 'response does not include ToDo text')
})
```

Nyní můžeme vyzkoušet, že například odebráním `<td><%= todo.text %></td>` z `views/_todos.ejs` test rozbijeme.

Nejedná se sice o dokonalý test, ale 1) testujeme reálné veřejné rozhraní aplikace 2) ověřujeme, že ToDos se tak nějak vypisují do HTML, což nám ke spokojenosti stačí.

Můžeme si napsat i druhý test na vytváření ToDos.

```jsx
test.serial('POST /add creates todo', async (t) => {
  const text = 'Testovací todo!!!'

  const response = await supertest(app)
		.post('/add') // aplikace používá POST /add jako endpoint na tvorbu todo
		.type('form') // v views/index.ejs odesíláme formulář
		.send({ text }) // součástí formuláře je input text
		.redirects(1) // POST /add handler končí redirectem.
									// .redirects udělá druhý dotaz na URL kam nás /add přesměruje

  t.assert(response.text.includes(text), 'response does not include ToDo text')
})
```
