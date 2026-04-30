import {
  type HTMLAttributes,
  type ReactNode,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type ReactWrapperProps<
  TElement extends HTMLElement,
  TPropertyProps extends object,
  TEventProps extends object,
> = TPropertyProps &
  TEventProps &
  Omit<HTMLAttributes<TElement>, keyof TPropertyProps | keyof TEventProps> & {
    children?: ReactNode;
  };

export function createReactWrapper<
  TElement extends HTMLElement,
  TPropertyProps extends object,
  TEventProps extends object,
>(config: {
  tagName: string;
  propertyKeys: Array<keyof TPropertyProps>;
  eventMap: Record<keyof TEventProps, `mc-${string}`>;
}) {
  type Props = ReactWrapperProps<TElement, TPropertyProps, TEventProps>;
  const { eventMap, propertyKeys, tagName } = config;

  return forwardRef<TElement, Props>(function MurgaReactWrapper(props, forwardedRef) {
    const localRef = useRef<TElement | null>(null);
    const latestProps = useRef(props);
    const propertyKeysRef = useRef(propertyKeys);
    const eventMapRef = useRef(eventMap);

    latestProps.current = props;

    useImperativeHandle(forwardedRef, () => {
      if (!localRef.current) {
        throw new Error(`Unable to resolve ref for ${tagName}`);
      }

      return localRef.current;
    });

    useEffect(() => {
      const element = localRef.current;

      if (!element) {
        return;
      }

      for (const propertyKey of propertyKeysRef.current) {
        const key = propertyKey as string;
        (element as Record<string, unknown>)[key] = (props as Record<string, unknown>)[key];
      }
    }, [props]);

    useEffect(() => {
      const element = localRef.current;

      if (!element) {
        return;
      }

      const cleanups = Object.entries(eventMapRef.current as Record<string, string>).map(
        ([propName, eventName]) => {
          const listener = (event: Event) => {
            const currentProps = latestProps.current as Record<string, unknown>;
            const handler = currentProps[propName];

            if (typeof handler === "function") {
              (handler as (event: Event) => void)(event);
            }
          };

          element.addEventListener(eventName, listener);

          return () => {
            element.removeEventListener(eventName, listener);
          };
        },
      );

      return () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      };
    }, []);

    const propertyKeySet = new Set<string>(propertyKeys.map((key) => key as string));
    const eventKeySet = new Set<string>(Object.keys(eventMap));
    const domProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props as Record<string, unknown>)) {
      if (key === "children" || propertyKeySet.has(key) || eventKeySet.has(key)) {
        continue;
      }

      domProps[key] = value;
    }

    const children = (props as { children?: ReactNode }).children;

    return createElement(tagName, { ...domProps, ref: localRef }, children);
  });
}
