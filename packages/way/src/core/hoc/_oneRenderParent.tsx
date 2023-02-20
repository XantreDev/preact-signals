export const wrapToOneRender = <Props,>(
    Component: React.FC<HookExecutorProps<Props>>
  ) => {
    const uniqueRenderObjects = new WeakMap<object, object>();
    const propsWrapper = new WeakMap<object, LazyNode>();
    const getPropsWrapper = (uniqueRenderObject: object, props: any) =>
      propsWrapper.get(uniqueRenderObject) ??
      (() => {
        const wrapper = lazyNode(props);
        propsWrapper.set(uniqueRenderObject, wrapper);
  
        return wrapper;
      })();
  
    const getUniqueRenderObject = (props: object) =>
      uniqueRenderObjects.get(props) ??
      /* Really first render */
      (() => {
        const uniqueObject = Object.create(null);
        uniqueRenderObjects.set(props, uniqueObject);
        return uniqueRenderObjects;
      })();
  
    class Wrapper extends React.Component<
      any,
      ExecutorSpecificProps & { propsWrapper: LazyNode }
    > {
      shouldComponentUpdate(newProps: any) {
        this.state.propsWrapper.update(newProps);
  
        return false;
      }
  
      constructor(props: any) {
        const uniqueRenderObject = getUniqueRenderObject(props);
        super(props);
        const propsWrapper = getPropsWrapper(uniqueRenderObject, complex(props));
        this.state = {
          uniqueRenderObject,
          propsWrapper,
        };
      }
  
      render(): React.ReactNode {
        return (
          <Component
            {...this.state}
            props={this.state.propsWrapper.result as any}
          />
        );
      }
    }
  
    Object.assign(Wrapper, {
      displayName: "OneRenderWrapper",
    });
  
    return { Wrapper } as const;
  }