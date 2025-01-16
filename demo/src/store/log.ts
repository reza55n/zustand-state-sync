import { create } from "zustand"
import { persist, PersistStorage } from "zustand/middleware"
import { shallow } from "zustand/shallow"
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

// https://github.com/reza55n/zustand-state-sync
// Updated on 2025-01-16

// #############################################################################

const name = "log"
// Must be unique in the project to make the broadcast functioning. Will be
// named in localStorage and sessionStorage with some prefixes

const valInit = []

type valType = Array<string>
// Can be primitive or any mixtures of array/object/primitive
// (You can set `any`)

// Also you can find and customize/add/remove the methods `reset`, `increase`
// and `decrease`. !! IMPORTANT: Don't forget to keep `doPost: true` for the
// methods (except for setVal).

const baseStorageDefault = sessionStorage
// It must be `sessionStorage` (default) if sync is `false` and/or data is
// important
// Use case for `localStorage`: User's shopping cart

const sync = false
// `true` (default): Sync across the tabs and persistent on refresh

const verbose = false
// `true`: Logs are displayed. Default: `false`

const secure = true
// `true` (default): In types other than native, sends an empty message shortly
// after it's been received. BTW it may not work when only one tab is open.

// #############################################################################


const log = (msg) => verbose &&
  console.log(`${msg}              ${Date.now() - Math.floor(Date.now() / 10000) * 10000}`)

const debounce = (func, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(this, args) }, timeout)
  }
}

const storeName = `zustand-${name}`

// Always checked from localStorage
const storeModeName = `zustand-${name}-mode`

var baseStorage: Storage

const initBaseStorage = () => {
  if (localStorage[storeModeName] === undefined) {
    baseStorage = baseStorageDefault
  } else if (localStorage[storeModeName] == "localStorage") {
    baseStorage = localStorage
  } else if (localStorage[storeModeName] == "sessionStorage") {
    baseStorage = sessionStorage
  } else {
    console.log(`WARNING: Invalid storeModeName in localStorage (${localStorage[storeModeName]}). Using default.`)
    baseStorage = baseStorageDefault
  }
}

initBaseStorage()


// Channel initialization

if (sync) {
  var channel = new BroadcastChannel(name)
  if (channel.type === "idb") // It's not secure nor efficient
    channel = new BroadcastChannel(name, {type: "localstorage"})
  log (`Broadcast channel '${name}' initialized with type of ${channel.type} and storage of ` +
    (baseStorage == localStorage ? "localStorage" :
      (baseStorage == sessionStorage ? "sessionStorage" : "UNKNOWN"))
  )
  
  const clearMessageDebounced = debounce(() => channel.type !== "native" && secure &&
    channel.postMessage(""), 1000)
  
  const elector = createLeaderElection(channel)
  var imLeader = await elector.hasLeader()
  imLeader = !imLeader
  var waitingForState
  if (imLeader) {
    log("I'm the leader")
    waitingForState = false
  } else {
    log('Another tab and leader exists')
    setTimeout(() => {channel.postMessage("ask_leader_for_state")}, 50);
      // setTimeout to make sure to be initialized when the message received
    waitingForState = true
  }
  elector.awaitLeadership().then(() => {
    log("I'm the leader now")
    imLeader = true
  })

  channel.onmessage = async msg => {
    if (verbose)
      console.log(`### NEW MESSAGE, Am I leader? ` + imLeader + ", message: ", msg)
    
    if (msg) { // To prevent infinite loop
      if (msg === "ask_leader_for_state") {
        if (imLeader) {
          log("Re-sending the values for the new tab.......")
          var states = useStore.getState()
          states.setVal(states.val)
        }
        return
      }
      
      if (msg?.num !== undefined) {
        var msgJ = JSON.parse(msg.num)
        var valll = msgJ?.state?.val
        if (valll !== undefined) {
          waitingForState = false
          useStore.getState().setVal(valll, false)
        }
      }
      clearMessageDebounced()
    }
  }
} else {
  delete baseStorage[storeName]
}


// Zustand definitions

interface BearState {
  val: valType
  doPost: boolean
  setVal: (val: valType | Function, doPost?: boolean) => void
  reset: () => void
}

var initialized = false

const storage: PersistStorage<BearState> = {
  getItem: (key) => {
    const str = baseStorage[key]
    if (!str) return null
    return JSON.parse(str)
  },
  setItem: (key, newValue) => {
    if (sync && waitingForState)
      return
    
    const newValueStr = JSON.stringify(newValue)
    if (initialized && baseStorage[key] === undefined) {
      log("Storage was changed from another tab. Switching baseStorage...")
      initBaseStorage()
    }
    baseStorage[key] = newValueStr
    initialized = true
    if (sync && newValue.state.doPost === true) {
      log("Setter not from broadcast. Posting.......")
      channel.postMessage({num: newValueStr})
    } else
      log("Sync is off or setter from broadcast, not posting.")
  },
  removeItem: (key): void => {
    delete baseStorage[key]
  }
}

export const useStore = create<BearState>()(
  persist(
    (set, get) => ({
      val: valInit,
      doPost: true,
      setVal: (val, doPost = true) => {
        if (typeof val === 'function')
          set({ val: val(get().val), doPost: true })
        else
          set({ val: val, doPost }) // Used in broadcasting
      },
      reset: () => set({ val: valInit, doPost: true }),
    }),
    { name: storeName, storage }
  )
)

export const useStoreSet = () => useStore(
  (state) => [state.setVal, state.reset],
  shallow
)

export const useStoreGet = () => useStore((state) => state.val)

export const switchBaseStorage = (
      target: "localStorage" | "sessionStorage",
      reload: boolean = false) => {
  if (target == "sessionStorage") {
    sessionStorage[storeName] = localStorage[storeName]
    delete localStorage[storeName]
  } else if (target == "localStorage") {
    localStorage[storeName] = sessionStorage[storeName]
    delete sessionStorage[storeName]
  } else {
    throw `Invalid target (${target}) for switchBaseStorage.`
  }
  
  localStorage[storeModeName] = target
  
  if (reload)
    window.location.reload()
}

export const info = {name, storeName, baseStorage}