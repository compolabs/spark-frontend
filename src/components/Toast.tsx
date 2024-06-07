import React from "react";

import { getExplorerLinkByAddress, getExplorerLinkByHash } from "@src/utils/getExplorerLink";

import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

interface IProps {
  text: string;
  linkText?: string;
  hash?: string;
  address?: string;
  url?: string;
}

const Toast: React.FC<IProps> = ({ text, linkText = "Open In Explorer", hash, address, url }) => {
  let link;
  if (hash) {
    link = getExplorerLinkByHash(hash);
  } else if (address) {
    link = getExplorerLinkByAddress(address);
  } else if (url) {
    link = url;
  }

  return (
    <SmartFlex gap="8px" column>
      <span>{text}</span>
      {link && (
        <a href={link} rel="noreferrer noopener" target="_blank">
          <Text type={TEXT_TYPES.BODY} secondary>
            {linkText}
          </Text>
        </a>
      )}
    </SmartFlex>
  );
};

export function createToast(props: IProps) {
  return <Toast {...props} />;
}

export default Toast;
