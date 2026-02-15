# Promises & async/await

Problém: asynchronní funkce vracející hodnoty přes callback nemohou vrátit hodnoty normálním způsobem:

```jsx
function asyncAdd(a, b, callback) {
	setTimeout(() => {
		callback(a + b)
  }, 1000)
}

const result = asyncAdd(1, 2, (result) => {
	return result
})

console.log(result) // undefined
```

To vede k callback-hell a špatně čitelnému kódu

## Promise

Pomise je hodnota která bude vyhodnocena někdy v budoucnosti. Při vytváření potřebuje funkci které se říká handler. První argument promise handleru je funkce (obvykle pojmenovaná resolve) pomocí které vracíme finální hodnotu. 

```jsx
function asyncAdd(a, b) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(a + b)
		}, 1000)
	})
}

const result = asyncAdd(1, 2)

console.log(result) // Promise { <pending> }

result.then((value) => {
	console.log(value) // 3
})
```

Volání `then` se dá řetězit

```jsx
asyncAdd(1, 2)
	.then((value) => {
		console.log(value) // 3

		return asyncAdd(value, value)
	})
	.then((value) => {
		console.log(value) // 6

		return asyncAdd(value, 100)
	})
	.then((value) => {
		console.log(value) // 106
	})
```

Nebo uložit vždy do pomocné proměnné

```jsx
const result1 = asyncAdd(1, 2)

const result2 = result1.then((value) => {
	console.log(value) // 3

	return asyncAdd(value, value)
})

const result3 = result2.then((value) => {
	console.log(value) // 6

	return asyncAdd(value, 100)
})

result3.then((value) => {
	console.log(value) // 106
})
```

Návratová hodnota then nemusí být `Promise`

```jsx
zasyncAdd(1, 2)
	.then((value) => {
		console.log(value) // 3

		return 4
	})
	.then((value) => {
		console.log(value) // 4
	})
```

### Chyby v promisech

Druhý parametr promise handleru je opět funkce (tentokrát ale s typickám nazvem reject) pomocí které můžeme promise zamítnout a vrátit chybu. Ta je následně zachycena pomocí `catch`. Pokud chceme provést kus kódu nezávisle zda promise vrátil chybu či ne, použijeme `finally`

```jsx
function asyncDivide (a, b) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (b === 0) {
				reject("nelze dělit nulou")
			} else {
				resolve(a / b)
			}
		}, 1000)
	})
}

asyncDivide(10, 0)
	.then((result) => {
		console.log(`Výsledek je: ${result}`)
	})
	.catch((error) => {
		console.error(`Chyba: ${error}`)
	})
	.finally(() => {
		console.log('Děkujeme, že používate naši asynchronní kalkulačku')
	})
```

Pokud je `Promise` rejectnut ale nemá na sobě `catch` metodu, Node.js proces se ukončí. Na toto chování pozor u dlouhodobě běžících programů (servery).

```jsx
function asyncDivide (a, b) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (b === 0) {
				reject("nelze dělit nulou")
			} else {
				resolve(a / b)
			}
		}, 1000)
	})
}

asyncDivide(10, 0)
```

### Čtení & zápis souborů pomocí promisů

```jsx
import fs from 'fs'

function readFile (path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

function writeFile (path, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

writeFile('hello.txt', 'Hello, World')
	.then(() => {
		const promise = readFile('hello.txt')

		console.log('file written')

		return promise
	})
	.then((data) => {
		console.log(data.toString())
	})
	.catch((err) => {
		console.error(err)
	})
```

Node má funkci `promisify` v balíčku `util` která nam z callback-style funkcí udělá promise-style funkce

```jsx
import fs from 'fs'
import util from 'util'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
```

Nebo můžeme vyuřít balíček `fs/promises`

```jsx
import fs from 'fs/promises'

fs.writeFile('hello.txt', 'Hello, World')
	.then(() => {
		const promise = fs.readFile('hello.txt')

		console.log('file written')

		return promise
	})
	.then((data) => {
		console.log(data.toString())
	})
	.catch((err) => {
		console.error(err)
	})
```

## Async/await

I přesto, že promisy jsou mnohem lepší než callbacky, stále to není ono. JavaScript má tedy dvě klíčová slovíčka, která nam pomohou psát čitelnější kód.

### await

Klíčové slovo `await` nám pomůže extrahovat promise do proměnné bez nutnosti použití `then`.

```jsx
import fs from 'fs/promises'

await fs.writeFile('hello.txt', 'Hello, World')

const data = await fs.readFile('hello.txt')

console.log(data.toString())
```

> **POZOR:** pokud zapomeneme `await` místo žádané hodnoty dostaneme `Promise`
> 

### async

Klíčové slovo `async` označuje funkce které vrací `Promise`. Nemusíme ho tedy vracet manuálně, ale JavaScript to udělá za nás. Zároveň je nutné označit `async` kařdou funkce která využívá `await`u.

```jsx
import fs from 'fs/promises'

async function writeAndReadFile(path, text) {
	await fs.writeFile(path, text)

	const data = await fs.readFile(path)

	return data.toString()
}

console.log(await writeAndReadFile('hello.txt', 'Hello, World'))
```

Async arrow funkce

```jsx
const writeAndReadFile = async (path, text) => {
	// ...
}
```

### Chyby u async/await

Chyby se řeší klasicky pomocí try/catch. Blok `finally` je opět nepovinný.

```jsx
import fs from 'fs/promises'

try {
	const data = await fs.readFile('neexistujici')

	console.log(data)
} catch (err) {
	console.error(err)
} finally {
	console.log('Tak snad to zafungovalo :)')
}
```

## Sleep - await v cyklu

Await zastaví spuštění kódu (ale neblokuje) a tak můžeme vykonávat asynchronní úkoly sériově

```jsx
import util from 'util'

const sleep = util.promisify(setTimeout)

for (let i = 0; i < 10; i++) {
	console.log(i)
	await sleep(1000)
}

console.log('done')
```

Pro “paralelizaci” použijeme `Promise`

```jsx
import util from 'util'

const sleep = util.promisify(setTimeout)

for (let i = 0; i < 10; i++) {
	sleep(1000).then(() => {
		console.log(i)
	})
}

console.log('done')
```

## Perzistentní čítač pomocí async/await

```jsx
import fs from 'fs/promises'

let count

try {
	const data = await fs.readFile('counter.txt')
	
	count = Number(data.toString()) 
} catch {
	count = 0
}

console.log(count)

await fs.writeFile('counter.txt', String(count + 1))
```

## Pro pokročilé

Více promisů zároveň

```jsx
import fs from 'fs/promises'

const [data1, data2, data3] = await Promise.all([
	fs.readFile('file1.txt'),
	fs.readFile('file2.txt'),
	fs.readFile('file3.txt'),
])

console.log(data1.toString())
console.log(data2.toString())
console.log(data3.toString())
```

Čtení souboru s timeoutem

```jsx
import fs from 'fs'

const readFile = (path, timeout = 1000) => new Promise((resolve, reject) => {
	const currentTimeout = setTimeout(() => {
		reject('operation timed out')
	}, timeout)

	fs.readFile(path, (err, data) => {
    clearTimeout(currentTimeout)

		if (err) {
			reject(err)
		} else {
			resolve(data)
		}
	})
})

try {
  const data = await readFile('large.txt', 1)

  console.log(data.toString())
} catch (err) {
  console.error(err)
}
```

Awaitovat je možné i objekt s then metodou (thenable)

```jsx
const thenable = {
	then(callback) {
		setTimeout(() => {
			callback('Hello, World')
		}, 1000)
	}
}

const msg = await thenable

console.log(msg)
```
