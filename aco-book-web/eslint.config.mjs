import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

const eslintConfig = [
    {languageOptions: { globals: {...globals.browser, ...globals.node} }},
    ...tseslint.configs.recommended,
    pluginReactConfig,
];

export default eslintConfig;
