"use strict";

const js = require("@eslint/js");
const stylisticJs = require("@stylistic/eslint-plugin-js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        ignores: ["coverage/"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: globals.node
        },

        plugins: {
            "@stylistic/js": stylisticJs
        },

        rules: {
            "@stylistic/js/brace-style": ["error", "1tbs", { allowSingleLine: true }],
            camelcase: ["error", { properties: "never" }],
            "@stylistic/js/comma-spacing": [
                "error",
                {
                    "before": false,
                    "after": true
                }
            ],
            "@stylistic/js/comma-style": ["error", "last"],
            curly: ["error", "all"],
            "@stylistic/js/eol-last": ["error", "always"],
            "@stylistic/js/indent": ["error", 4, { SwitchCase: 1 }],
            "@stylistic/js/key-spacing": [
                "error",
                {
                    "beforeColon": false,
                    "afterColon": true,
                    "mode": "minimum"
                }
            ],
            "@stylistic/js/keyword-spacing": "error",
            "@stylistic/js/linebreak-style": ["error", "unix"],
            "@stylistic/js/max-len": ["error", { code: 100 }],
            "no-console": "off",
            "no-multi-str": "error",
            "@stylistic/js/no-trailing-spaces": "error",
            "no-with": "error",
            "@stylistic/js/padded-blocks": ["error", "never"],
            "@stylistic/js/padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
                { blankLine: "any",    prev: ["const", "let", "var"], next: ["const", "let", "var"]}
            ],
            "@stylistic/js/semi": ["error", "always"],
            "@stylistic/js/semi-spacing": [
                "error",
                {
                    "before": false,
                    "after": true
                }
            ],
            "@stylistic/js/space-before-blocks": ["error", "always"],
            "@stylistic/js/space-before-function-paren": [
                "error",
                {
                    "anonymous": "ignore",
                    "named": "never",
                    "asyncArrow": "always"
                }
            ],
            "@stylistic/js/wrap-iife": ["error", "any"],
        }
    }
];
