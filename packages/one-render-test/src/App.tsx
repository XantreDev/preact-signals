import { withOneRender } from "one-render";
import "./App.css";
import { HookScopeResults } from "./components/HookScopeResults";

const App = withOneRender(() => {
  return (
    <div className="App">
      {/* <SimpleHooks /> */}
      {/* <Bench /> */}
      {/* <Swr /> */}
      <HookScopeResults />
      <h1>All is ok</h1>
    </div>
  );
});

export default App;
