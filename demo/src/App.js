import { React } from 'react';

import './App.css';

import * as s1 from "./store/storage1.ts"
import * as s2 from "./store/storage2.ts"
import * as log from "./store/log.ts"

import Comp from './Comp.jsx'

const divv = {marginTop: "4px", marginBottom: "4px", fontWeight: "bold", color:"rgb(0, 75, 185)"}

const verbose = true
const useLogAdd = (msg) => {
  const [setLog] = log.useStoreSet()
  if (verbose) {
    setLog((prev) => [...prev, msg])
  }
}

const LogBody = () => {
  const logs = log.useStoreGet()
  return <pre style={{fontSize: "80%"}}>{logs.map((e, i) => <div key={i}>{e}</div>)}</pre>
}

const Store1Get = () => {
  useLogAdd("Store1Get rendered")
  const count = s1.useStoreGet();
  return <div style={divv}>{count}</div>;
}
const Store2Get = () => {
  useLogAdd("Store2Get rendered")
  const val = s2.useStoreGet();
  return <div style={divv}>{val.map((e, i) => <div key={i}>{e}</div>)}</div>;
}
const Store2Set = () => {
  useLogAdd("Store2Set rendered")
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

function App() {
  const [setVal, increase, decrease] = s1.useStoreSet()
  const [setLog, resetLog] = log.useStoreSet()
  useLogAdd("App rendered")
  return (
    <>
      <h1>Zustand State Sync - Demo</h1>
      <div id="container">
        <div className="App">
          <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}>
            <a className="button" target="_blank" href="https://github.com/reza55n/zustand-state-sync">GitHub</a>
            <button style={{fontSize: "82%"}} className="button" onClick={() => {
              window.open(".", "_blank")
            }}>+ New tab</button>
          </div>
          <hr/>
          <h2>storage1 (number)</h2>
          <button style={{fontSize: "80%"}} onClick={async () => {
            for (var i = 0; i < 100; i++) {
              increase()
            }
          }}>+= 100 separate posts</button><br/>
          <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}>
            <button onClick={decrease}>-</button>{" "}
            <Store1Get/>
            <button onClick={increase}>+</button><br/>
          </div>
          <button style={{fontSize: "80%"}} onClick={async () => {
            for (var i = 0; i < 100; i++) {
              decrease()
            }
          }}>-= 100 separate posts</button><br/>
          <button style={{fontSize: "92%"}} onClick={() => {
              var val = parseInt(prompt("Enter value"))
              if (!isNaN(val))
                setVal((prev) => prev + val)
            }}>+= custom value</button>
          <hr/>
          <h2>storage2 (array of string)</h2>
          <p style={{fontSize: "85%"}}>Phrases from <a target="_blank" href="https://randomwordgenerator.com/phrase.php">here</a></p>
          <Store2Set/>
          <Store2Get/>
          <h3>From another file:</h3>
          <Comp/>
        </div>
        <div id="log">
          <h2>
            <span>log </span>
            <button onClick={() => {
                resetLog()
              }}>Clear</button>
          </h2>
          <p style={{fontSize: "85%", color: "green", fontWeight: "bold"}}>(The log is stored separately for each tab)</p>
          <LogBody/>
        </div>
      </div>
    </>
  );
}

export default App;
