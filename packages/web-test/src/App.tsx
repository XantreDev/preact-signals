import { withOneRender } from "@one-render/core";
import "./App.css";
import { Swr } from "./components/Swr";

const App = withOneRender(() => {
  return (
    <div className="App">
      {/* <SimpleHooks /> */}
      {/* <Bench /> */}
      <Swr />
      {/* <HookScopeResults /> */}
      <h1>All is ok</h1>
    </div>
  );
});

export default App;
