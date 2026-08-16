const LOGO_PATH = "notaryday-icon-badge.svg";
const FOOTER_LOGO_PATH = "notaryday-white-text.svg";
const logoRoot = process.env.NEXT_PUBLIC_LOGO_URL?.trim();

export const LOGO_URL = logoRoot
  ? `${logoRoot.replace(/\/+$/, "")}/${LOGO_PATH}`
  : `/${LOGO_PATH}`;

export const FOOTER_LOGO_URL = logoRoot
  ? `${logoRoot.replace(/\/+$/, "")}/${FOOTER_LOGO_PATH}`
  : `/${FOOTER_LOGO_PATH}`;
