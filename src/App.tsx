import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useAdamConnect } from "./useAdamConnect";
import { Ad4mClient, PerspectiveProxy } from "@perspect3vism/ad4m";
// @ts-ignore
import GraphView from "@fluxapp/graph-view";
import { AgentClient } from "@perspect3vism/ad4m/lib/src/agent/AgentClient";

customElements.define("graph-view", GraphView);

function App() {
  const { client, connect, verificationRequired, verifyCode, isConnected } =
    useAdamConnect();

  if (verificationRequired) {
    return (
      <>
        <input
          type="number"
          onChange={(e) => {
            if (e.target.value.length === 6) {
              verifyCode(e.target.value);
            }
          }}
        />
      </>
    );
  }

  if (isConnected && client) {
    return <Main client={client}></Main>;
  }

  return <button onClick={() => connect()}>Connect</button>;
}

export default App;

function Main({ client }: { client: Ad4mClient }) {
  const [perspectives, setPerspectives] = useState<PerspectiveProxy[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");

  const selectedPerspective = perspectives.find((p) => p.uuid === selectedUuid);

  useEffect(() => {
    client.perspective.all().then(setPerspectives);
  }, []);

  return (
    <>
      <div>
        <h2>Select a perspective</h2>
        {perspectives.map((p) => (
          <button key={p.uuid} onClick={() => setSelectedUuid(p.uuid)}>
            {p.name}
          </button>
        ))}
        {selectedPerspective && (
          <Perspective
            agent={client.agent}
            perspective={selectedPerspective}
          ></Perspective>
        )}
      </div>
    </>
  );
}

function Perspective({
  perspective,
  agent,
}: {
  perspective: PerspectiveProxy;
  agent: AgentClient;
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.perspective = perspective;
      ref.current.agent = agent;
    }
  }, [ref.current, perspective]);

  return <graph-view ref={ref} source="ad4m://self"></graph-view>;
}
