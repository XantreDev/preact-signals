import { TestCounterMacro } from "./TestMacro";
import { TestFor } from "./TestFor";
import { TestQuery } from "./TestQuery";
import { TestResource } from "./TestResource";
import { TestShow } from "./TestShow";
import { TestSwitch } from "./TestSwitch";
import { TextUncachedJSXBindings } from "./TestUncached";

import {
  Link,
  Outlet,
  RootRoute,
  Route,
  Router,
  RouterProvider,
  createHashHistory,
} from "@tanstack/router";

const rootRoute = new RootRoute({
  component: () => (
    <>
      <nav className="contents">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
          <li>
            <Link to="/test-show">test show</Link>
          </li>
          <li>
            <Link to="/test-counter-macros">test counter macros</Link>
          </li>
          <li>
            <Link to="/test-switch">test switch</Link>
          </li>
          <li>
            <Link to="/test-resource">test resource</Link>
          </li>
          <li>
            <Link to="/test-query">test query</Link>
          </li>
          <li>
            <Link to="/test-for">test for</Link>
          </li>
          <li>
            <Link to="/test-uncached-jsx-bindings">
              test uncached jsx bindings
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  ),
});

const testShowRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-show",
  component: TestShow,
});

const testSwitchRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-switch",
  component: TestSwitch,
});

const testResourceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-resource",
  component: TestResource,
});

const testQueryRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-query",
  component: TestQuery,
});

const testForRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-for",
  component: TestFor,
});

const testUncachedJSXBindingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-uncached-jsx-bindings",
  component: TextUncachedJSXBindings,
});

const testCounterMacrosRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/test-counter-macros",
  component: TestCounterMacro,
});

const router = new Router({
  routeTree: rootRoute.addChildren([
    testShowRoute,
    testSwitchRoute,
    testResourceRoute,
    testQueryRoute,
    testUncachedJSXBindingsRoute,
    testForRoute,
    testCounterMacrosRoute,
  ]),
  history: createHashHistory(),
});

export const Test = (): JSX.Element => <RouterProvider router={router} />;

declare module "@tanstack/router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}
