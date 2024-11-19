/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  VITE_FEATURE_TOGGLE_CLIENT_KEY: string | undefined;
  VITE_BRANCH_NAME: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}