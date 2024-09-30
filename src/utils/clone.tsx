import React, { ComponentProps, ComponentType, FC } from "react";

export function clone<C extends ComponentType<any>, BaseProps extends Partial<ComponentProps<C>>>(
  Component: C,
  baseProps: BaseProps,
): FC<Partial<Omit<ComponentProps<C>, keyof BaseProps>>> {
  const ClonedComponent: FC<Partial<Omit<ComponentProps<C>, keyof BaseProps>>> = (props) => {
    const allProps = { ...baseProps, ...props } as ComponentProps<C>;
    return <Component {...allProps} />;
  };

  return ClonedComponent;
}
