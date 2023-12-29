# 🐻 Zustand State Sync

### Have a single-source-of-truth (or multiple sources) across different tabs and files

**[Live demo](https://www.alvandsoft.com/en/zustand-state-sync/)**

This script uses [broadcast-channel](https://github.com/pubkey/broadcast-channel) and [zustand ](https://github.com/pmndrs/zustand)'s `PersistStorage` to create a persist storage that communicates with the browser's other tabs to keep the state up-to-date.

**While another tab exists, the new tabs get their initial state from the existing one (i,e from the leader tab).**

It has been tested with a `for` loop to easily handle more than 100 communications across multiple tabs, in Chrome and Firefox for Windows and Android.

**Known issue:** For older versions of Firefox Android which don't support `BroadcastChannel`, it uses `localStorage` and new tabs don't get the initial state from the other ones.



## Steps to implement
1. Install `zustand` and `broadcast-channel`


2. Copy the file somewhere inside your project (such as `store/storage1.ts`)

3. Customize its related parts (especially `valInit`, `valType` and `name`)



## Steps to use
1. Import the file(s) anywhere into your script(s):

``` Javascript
import { useStoreGet, useStoreSet } from "./store/storage1.ts"
```


2. Get a value from inside any hook/component and make it render the hook/component after every state update:

``` Javascript
const count = useStoreGet()

return <div>Count is: {count}</div>
```


3. Set a value from inside any hook/component without rendering it:

``` Javascript
const [setVal, increase, decrease, reset] = useStoreSet()

// To use only the main setter:
const [setVal] = useStoreSet()

return <button onClick={() => setVal(parseInt(prompt("Enter new value:")))}>Enter</button>
```
