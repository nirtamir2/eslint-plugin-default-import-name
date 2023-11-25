module.exports = {
  extends: [
    "nirtamir2",
    "nirtamir2/recommended",
    "nirtamir2/typescript",
    "plugin:eslint-plugin/all",
  ],
  rules: {
    /**
     * TypeError [ERR_INVALID_ARG_TYPE]: Error while loading rule 'import/no-unused-modules':
     * The "path" argument must be of type string. Received an instance of Array
     * Occurred while linting
     */
    "import/no-unused-modules": "off",
    "import/no-cycle": "off",
    "import/no-named-as-default": "off",
  },
};
