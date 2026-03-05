# Thenable

Jelikož klíčové slovo `await` na pozadí volá funkci `then()`, je možné za `await` dát i něco co není přímo `Promise`. Díky tomu je možné mít kód jako tento:

```javascript
const users = await db.from('users').select('*').where('age', '>', 18)
```

Pokud chceme mít něco s čím `await` korektně funguje, musí to něco mít funkci `then`:

```javascript
const thenable = {
  then: (resolve) => {
    console.log('then called')
    
    resolve('hello from thenable')
  }
}

const message = await thenable // then called

console.log(message) // hello from thenable
```

To můžeme využít v reálu u návrhového vzoru builder:

```javascript
const get = (resource) => {
  // URLSearchparams je třída která nám pomůže vygenerovat tu část URL za otazníkem
  const searchParams = new URLSearchParams();

  const builder = {
    select: (select) => {
      searchParams.set("select", select.join(","));

      // Vracíme builder (sami sebe) aby se funkce dali na sebe řetězit
      return builder;
    },
    limit: (limit) => {
      searchParams.set("limit", limit);

      return builder;
    },
    sort: (by, order) => {
      searchParams.set("sortBy", by);
      searchParams.set("order", order);

      return builder;
    },
    // Někdo tyto dva parametry nazývá onFulfilled a onRejected, ja je pojmenoval resolve a reject protože fungují stejně jako v Promise
    then: (resolve, reject) => {
      const query = searchParams.toString();
      const url = `https://dummyjson.com/${resource}?${query}`;

      console.log(`Fetching data from ${url}`);

      fetch(url)
        .then((response) => response.json())
        .then((json) => resolve(json[resource]))
        .catch((err) => reject(err));
    },
  };

  return builder;
};

const users = await get("users")
  .select(["id", "firstName", "lastName", "age"])
  .limit(10)
  .sort("lastName", "asc");

console.log(users);

```
