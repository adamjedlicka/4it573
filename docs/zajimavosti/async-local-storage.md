# AsyncLocalStorage

Globální proměnné jsou občas užitečné a umí usnadnit práci. Problém s nimi je, že Node.js proces často obsluhuje více uživatelů zároveň (HTTP server), tudíž globální proměnné jsou sdílené mezi uživateli a mohlo by tak dojít například k úniku citlivých informací nebo pomíchání dat mezi uživateli. V PHP tento problém není, jelikož PHP proces vždy obslouží jeden požadavek a končí, takže globální proměnné v PHP jsou vždy jen pro jednoho uživatele (pokud nepoužíváme asynchronní PHP knihovnu, která z PHP udělá dlouhodobý proces, jako je Node.js).

Existuje řešení v podobě třídy `AsyncLocalStorage` z modulu `async_hooks`.

[Async hooks | Node.js Documentation](https://nodejs.org/api/async_hooks.html)

Tato třída nám umožní vytvořit „globální“ kontext, který je ale unikátní mezi HTTP požadavky.

Nejprve vytvoříme instanci třídy `AsyncLocalStorage`:

```jsx
const asyncLocalStorage = new AsyncLocalStorage()
```

Tato instance má dvě hlavní metody: `run` a `getStore`. Metoda `run` bere dva parametry: prvním je *store* a druhým je *callback*. Volání `getStore` funguje pouze uvnitř metody `run` a vrací právě ten store zadaný v prvním parametru metody `run`.

```jsx
import http from 'node:http'
import { AsyncLocalStorage } from 'node:async_hooks'

// Vytvoříme si novou instanci AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorage()

const server = http.createServer((req, res) => {
  // Pro každý požadavek vytvoříme nový store.
  // Tento store je tedy pro každý požadavek unikátní
  // a my jej můžeme použít jako "globální" objekt.
  const store = {}

  // Všechen kód (i asynchronní) v této callback funkci
  // bude mít přístup ke storu pomocí asyncLocalStorage.getStore()
  asyncLocalStorage.run(store, async () => {
    const randomNumber = Math.random()
    addNumberToStore(randomNumber)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    logNumberFromStore()
    res.end()
  })
})

const addNumberToStore = (number) => {
  // Získá store objekt vytvořený pro aktuální požadavek
  const store = asyncLocalStorage.getStore()
  store.number = number
  console.log('Added number to store: ', store.number)
}

const logNumberFromStore = () => {
  const store = asyncLocalStorage.getStore()
  console.log('Number from store: ', store.number)
}

server.listen(3000)

// Provedeme dva testovací dotazy (dva uživatelé přistupující najednou)
http.get('http://localhost:3000')
http.get('http://localhost:3000')
```

Tento kód po spuštění vypíše:

```
Added number to store:  0.7382159043958987
Added number to store:  0.32892541466807756
Number from store:  0.7382159043958987
Number from store:  0.32892541466807756
```

Je tak vidět, že funkce `addNumberToStore` a `logNumberFromStore` přistupují ke „globálnímu“ objektu, ale mezi požadavky se navzájem neovlivňují. Zároveň nevadí `await` promisu mezi přístupy ke storu. Stejně tak by přístup ke storu fungoval uvnitř funkce libovolně zanořené v callbacku, setTimeoutech, asynchronních funkcích atd. Node.js na pozadí sleduje, kdo právě běžící kód „vlastní“, a tak z metody `getStore` vždy vrátí správný objekt.

## Využití

- Do kontextu můžeme ukládat například ID aktuálního požadavku a to využít následně při logování pro identifikaci requestu.
- Globální proměnné unikátní pro jednotlivé požadavky.
