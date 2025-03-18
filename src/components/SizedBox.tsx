import React, { HTMLAttributes } from "react";
interface SizedBoxProps extends HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}
const SizedBox: React.FunctionComponent<SizedBoxProps> = ({ width, height, style, ...rest }) => (
  <div style={{ width, height, display: "flex", flex: "0 0 auto", ...style }} {...rest} />
);

export default SizedBox;
