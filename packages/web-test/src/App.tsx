import { withOneRender } from "@one-render/way";
import "./App.css";
import { RenderUIFor } from "./components/RenderUI";

const App = withOneRender(() => {
  return (
    <div className="App">
      {/* <SimpleHooks /> */}
      {/* <Bench /> */}
      {/* <Swr /> */}
      {/* <HookScopeResults /> */}
      {/* <RenderUI /> */}
      <RenderUIFor />
      {/* <ComponentsTest /> */}
      <h1>All is ok</h1>
    </div>
  );
});
App.displayName = "App";

export default App;
