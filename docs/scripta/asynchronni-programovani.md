# Funkcionální a asynchronní programování v Node.js

## Spuštění scriptu v Node.js

Vytvoříme soubor `main.mjs` a z příkazové řádky spustíme pomocí příkazu `node main.mjs`

### Proč .mjs?

Node.js pracuje se třemi příponami: .js .mjs a .cjs. Přípona rozhoduje jaky styl importování ostatních zdrojových kódů (z jednoho JS souboru importuju jiný) je použit. .cjs je klasický [CommonJS](https://en.wikipedia.org/wiki/CommonJS) a .mjs je modernější způsob zvaný [Ecma Script Modules](https://nodejs.org/api/esm.html) který budeme používat. .js je univerzální a záleží na nastavení v souboru `package.json` (bude vysvětleno v následujících hodinách).

## Funkcionální programování

V JavaScriptu jsou funkce hodnoty tudíž je můžeme ukládat do proměnných nebo předávat jiným funkcím jako argumenty.

```jsx
function add(a, b) {
	return a + b
}

const subtract = (a, b) => {
	return a - b
}

const secti = add
const odecti = subtract

console.log(secti(1, 2)) // 3
console.log(odecti(4, 2)) // 2
```

```jsx
const binaryOperation = (a, operation, b) => {
	return operation(a, b)
}

const add = (c, d) => {
	return c + d
}

console.log(binaryOperation(1, add, 2)) // 3
```

Funkce také mohou vracet jiné funkce

```jsx
const makeAdd = () => {
	return (a, b) => {
		return a + b
	}
}

const add = makeAdd()
console.log(add(1, 2)) // 3
```

Toto začne být zajímavé pokud vnitřní funkce referencuje proměnnou vnější funkce - **closure**.

```jsx
const makeCounter = () => {
	let i = 0

	return () => {
		i++
		console.log(i)
	}
}

const counter1 = makeCounter()
counter1() // 1
counter1() // 2

const counter2 = makeCounter()
counter2() // 1
counter1() // 3
```

### Array.filter

```jsx
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const evenNumbers = numbers.filter((number) => {
	return number % 2 == 0
})

console.log(evenNumbers) // [2, 4, 6, 8]
```

Alternativní zápis

```jsx
const evenNumbers = numbers.filter(number => number % 2 === 0)
```

Alternativní zápis

```jsx
const isEven = number => number % 2 === 0
const evenNumbers = numbers.filter(isEven)
```

### Array.map

```jsx
const people = [
	{ firstName: 'Franta', lastName: 'Sádlo' },
	{ firstName: 'Jirka', lastName: 'Máslo' },
	{ firstName: 'Pepa', lastName: 'Vomáčka' },
]

const firstNames = people.map((person) => {
	return person.firstName
})

console.log(firstNames) // ['Franta', 'Jirka', 'Pepa']
```

Alternativní zápis

```jsx
const firstNames = people.map(person => person.firstName)
```

```jsx
const numbers = [1, 2, 3, 4, 5, 6]

const filtered = numbers.map((number) => {
  return `Ctverec ${number} je ${number * number}`
})

console.log(filtered)
```

### Array.find

```jsx
const people = [
	{ firstName: 'Franta', lastName: 'Sádlo' },
	{ firstName: 'Jirka', lastName: 'Máslo' },
	{ firstName: 'Pepa', lastName: 'Vomáčka' },
]

const pepaVomacka = people.find((person) => {
	if (person.firstName === 'Pepa' && person.lastName === 'Vomáčka') {
		return true
	} else **{**
		return ****false
	**}**
})

console.log(pepaVomacka) // { firstName: 'Pepa', lastName: 'Vomáčka' }
```

## Asynchronní programování

Program pokračuje dále zatímco nějaký úkol se vykonává na pozadí.

**POZOR:** Nejedná se o paralelní programování.

```jsx
console.log('A')

setTimeout(() => {
	console.log('B')
}, 1000)

console.log('C')
```

### Event loop

![Event loop](/img/event-loop.png)

```jsx
console.log('A1')

setTimeout(() => {
	console.log('B1')

	setTimeout(() => {
		console.log('C1')

		setTimeout(() => {
			console.log('D1')
		}, 1000)
	}, 1000)
}, 1000)

setTimeout(() => {
	console.log('B2')

	setTimeout(() => {
		console.log('C2')
	}, 1000)
}, 1000)
```

Asynchronní funkce nemohou vrátit hodnotu pomocí return

```jsx
const addAfter1s = (a, b, callback) => {
	setTimeout(() => {
		callback(a + b)
	}, 1000)
}

const result = addAfter1s(1, 2, (result) => {
	return result
})

// Neexistuje způsob jak zde získat výsledek po asynchronním sčítání
console.log(result) // undefined
```

Čtení pro pokročilé: [http://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/](http://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)

### Přečtení souboru z disku

```jsx
import fs from 'fs'

fs.readFile('index.html', (err, data) => {
  if (err) {
    console.error(err.message)
  } else {
    console.log(data.toString())
  }
})
```

### Perzistentní counter

```jsx
import fs from 'fs'

const file = 'count'

fs.readFile(file, (err, data) => {
  let count

  if (err) {
    count = 0
  } else {
    count = Number(data.toString())
  }

  console.log(count)

  fs.writeFile(file, String(count + 1), (err) => {
    if (err) {
      console.error(err.message)
    }
  })
})
```

Refaktorovaná verze

```jsx
import fs from 'fs'

const file = 'count'

getCount((count) => {
  console.log(count)

  fs.writeFile(file, String(count + 1), (err) => {
    if (err) {
      console.error(err.message)
    }
  })
})

function getCount(callback) {
  fs.readFile(file, (err, data) => {
    if (err) {
      callback(0)
    } else {
      callback(Number(data.toString()))
    }
  })
}
```
