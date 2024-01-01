# 🐻 Zustand State Sync

### Have a single-source-of-truth (or multiple sources) across different tabs and files

**[Live demo](https://www.alvandsoft.com/en/zustand-state-sync/)**

This script uses [broadcast-channel](https://github.com/pubkey/broadcast-channel) and [zustand ](https://github.com/pmndrs/zustand)'s `PersistStorage` to create a persist storage that communicates with the browser's other tabs to keep the state up-to-date.

**While another tab exists, the new tabs get their initial state from the existing one (i,e from the leader tab).**

It has been tested with a `for` loop to easily handle more than 100 communications across multiple tabs, in Chrome and Firefox for Windows and Android.

**Known issue:** For older versions of Firefox Android which don't support `BroadcastChannel`, it uses `localStorage` and new tabs don't get the initial state from the other ones.



## Steps to implement
1. Install `zustand` and `broadcast-channel`


2. Copy the file `storage1.ts` somewhere inside your project (such as `store/cart.ts`)\
   You can also make more copies for extra storages such as `store/chat.ts`, `store/token.ts`, etc

4. Customize its related parts (especially `name`, `valInit` and `valType`)



## Steps to use
1. Import the file(s) anywhere into your script(s):

``` Javascript
import { useStoreGet, useStoreSet } from "./store/cart.ts"

// Or if you have multiple storages:
import * as cart from "./store/cart.ts"
```


2. Get a value from inside any hook/component and make it render the hook/component after every related state update:

``` Javascript
const data = useStoreGet()
// Or:
const data = cart.useStoreGet()

return <div>Cart data is: {data}</div>
```


3. Set a value from inside any hook/component without rendering it:

``` Javascript
const [setVal, reset, increase, decrease] = useStoreSet()
// Or:
const [setVal, reset, increase, decrease] = cart.useStoreSet()

// To use only the main setter:
const [setVal] = useStoreSet()
// Or:
const [setVal] = cart.useStoreSet()

return <button onClick={() => setVal(parseInt(prompt("Enter new value:")))}>Enter</button>
```


You can also use a setter function, again without rendering the parent hook/component:

``` Javascript
return <button onClick={() => setVal((prev) => prev + 5)}>Increase by 5</button>
```