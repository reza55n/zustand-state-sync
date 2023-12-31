import { create } from "zustand"
import { persist, PersistStorage } from "zustand/middleware"
import { shallow } from "zustand/shallow"
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

// https://github.com/reza55n/zustand-state-sync
// Updated on 2023-12-31

// #############################################################################

const name = "log"
// Must be unique in the project to make the broadcast functioning. Will be ...
// ...named in localStorage and sessionStorage with some prefixes

const valInit = []

type valType = Array<string>
// Can be primitive or any mixtures of array/object/primitive
// (You can set `any`)

// Also you can find and customize/add/remove the methods `increase`, ...
// ...`decrease` and `reset`. !! IMPORTANT: Don't forget to keep ...
// ...`doPost: true` for the methods (except for setVal).

const sync = false
// `true` (default): Sync across the tabs and persistent on refresh

const verbose = false
// `true`: Logs are displayed. Default: `false`

const secure = true
// `true` (default): In modes other than native, sends an empty message ...
// shortly after it's been received.

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


// Channel initialization

if (sync) {
  var channel = new BroadcastChannel(name)
  if (channel.type === "idb") // It's not secure nor efficient
    channel = new BroadcastChannel(name, {type: "localstorage"})
  log (`Broadcast channel '${name}' initialized with type of ${channel.type}`)
  
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
    channel.postMessage("ask_leader_for_state")
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
  delete sessionStorage[storeName]
}


// Zustand definitions

interface BearState {
  val: valType
  doPost: boolean
  setVal: (val: valType | Function, doPost?: boolean) => void
  reset: () => void
}

const storage: PersistStorage<BearState> = {
  getItem: (key) => {
    const str = sessionStorage[key]
    if (!str) return null
    return JSON.parse(str)
  },
  setItem: (key, newValue) => {
    if (sync && waitingForState)
      return
    
    const newValueStr = JSON.stringify(newValue)
    sessionStorage[key] = newValueStr
    if (sync && newValue.state.doPost === true) {
      log("Setter not from broadcast. Posting.......")
      channel.postMessage({num: newValueStr})
    } else
      log("Sync is off or setter from broadcast, not posting.")
  },
  removeItem: (key): void => {
    delete sessionStorage[key]
  }
}

export const useStore = create<BearState>()(
  persist(
    (set, get) => ({
      val: valInit,
      doPost: true,
      setVal: (val, doPost = true) => {
        if (typeof val === 'function')
          set({ val: val(get().val), doPost })
        else
          set({ val: val, doPost })
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