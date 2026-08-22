const LOGO_PATH = "notaryday-icon-badge.svg";
const FOOTER_LOGO_PATH = "notaryday-white-text.svg";

const rawLogoRoot = process.env.NEXT_PUBLIC_LOGO_URL?.trim();
const logoRoot = rawLogoRoot
  ? (
      /^https?:\/\//i.test(rawLogoRoot)
        ? rawLogoRoot
        : `https://${rawLogoRoot.replace(/^\/+/, "")}`
    ).replace(/\/+$/, "")
  : "";

export const LOGO_URL = logoRoot
  ? `${logoRoot}/${LOGO_PATH}`
  : `/icons/${LOGO_PATH}`;

export const FOOTER_LOGO_URL = logoRoot
  ? `${logoRoot}/${FOOTER_LOGO_PATH}`
  : `/icons/${FOOTER_LOGO_PATH}`;
