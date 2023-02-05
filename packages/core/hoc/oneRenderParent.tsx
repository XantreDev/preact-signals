import React from "react";
import { beforeUnmountActions } from "../globals";
import { ExecutorSpecificProps, HookExecutorProps } from "./types";

export const wrapToOneRender = <Props,>(
  Component: React.FC<HookExecutorProps<Props>>
) => {
  const uniqueRenderObjects = new WeakMap<object, object>();
  const getUniqueRenderObject = (props: object) =>
    uniqueRenderObjects.get(props) ??
    /* Really first render */
    (() => {
      const uniqueObject = Object.create(null);
      uniqueRenderObjects.set(props, uniqueObject);
      return uniqueRenderObjects;
    })();

  class Wrapper extends React.Component<any, ExecutorSpecificProps> {
    shouldComponentUpdate(): // nextProps: Readonly<{}>,
    // nextState: Readonly<{}>,
    // nextContext: any
    boolean {
      return false;
    }

    constructor(props: any) {
      super(props);
      const uniqueRenderObject = getUniqueRenderObject(props);
      this.state = {
        uniqueRenderObject,
      };
      if (!beforeUnmountActions.get(uniqueRenderObject)) {
        beforeUnmountActions.set(uniqueRenderObject, []);
      }
    }
    componentWillUnmount(): void {
      beforeUnmountActions
        .get(this.state.uniqueRenderObject)
        ?.forEach((unmountAction) => unmountAction());
    }

    render(): React.ReactNode {
      return <Component {...this.state} props={this.props} />;
    }
  }

  return { Wrapper } as const;
};
