const LOGO_PATH = "notaryday-icon-badge.svg";
const logoRoot = process.env.NEXT_PUBLIC_LOGO_URL?.trim();

export const LOGO_URL = logoRoot
  ? `${logoRoot.replace(/\/+$/, "")}/${LOGO_PATH}`
  : `/${LOGO_PATH}`;
