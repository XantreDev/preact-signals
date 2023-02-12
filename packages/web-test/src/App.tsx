import { withOneRender } from "@one-render/way";
import "./App.css";
import { ComponentsTest } from "./components/ComponentsTest";

const App = withOneRender(() => {
  return (
    <div className="App">
      {/* <SimpleHooks /> */}
      {/* <Bench /> */}
      {/* <Swr /> */}
      {/* <HookScopeResults /> */}
      <ComponentsTest />
      <h1>All is ok</h1>
    </div>
  );
});
App.displayName = "App";

export default App;
