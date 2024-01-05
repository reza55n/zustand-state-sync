import * as s2 from "./store/storage2.ts"
import * as log from "./store/log.ts"
const divv = {marginTop: "4px", marginBottom: "4px", fontWeight: "bold", color:"rgb(185, 0, 104)"}

const verbose = true
const useLogAdd = (msg) => {
  const [setLog] = log.useStoreSet()
  if (verbose) {
    setTimeout(() => setLog((prev) => [...prev, msg]), 0)
  }
}

const Store2Get = () => {
  useLogAdd("Store2Get (file) rendered")
  const val = s2.useStoreGet();
  return <div style={divv}>{val.map((e, i) => <div key={i}>{e}</div>)}</div>;
}
const Store2Set = () => {
  useLogAdd("Store2Set (file) rendered")
  const [setVal] = s2.useStoreSet()
  return <>
    <button onClick={() => {
      var cts = Math.round(Math.random() * 5) + 1
      var arr = []
      for (var i = 0; i < cts; i++)
        arr.push(s2.phrases[Math.floor(Math.random() * s2.phrases.length)])
      setVal(arr)
    }}>Generate</button>
  </>;
}

export default () => {
  useLogAdd("File rendered")
  return <><Store2Set/><Store2Get/></>
}