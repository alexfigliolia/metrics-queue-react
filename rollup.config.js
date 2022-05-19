import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const extensions = [".ts"];
const noDeclarationFiles = { compilerOptions: { declaration: false } };

const babelRuntimeVersion = pkg.dependencies["@babel/runtime"].replace(/^[^0-9]*/, "");

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].map(
  (name) => RegExp(`^${name}($|/)`)
);

// eslint-disable-next-line import/no-default-export
export default defineConfig([
  // CommonJS
  {
    input: "src/index.ts",
    output: { file: "lib/metrics-queue-react.js", format: "cjs", indent: false },
    external,
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfig: "tsconfig.build.json",
        useTsconfigDeclarationDir: true,
      }),
      babel({
        extensions,
        plugins: [["@babel/plugin-transform-runtime", { version: babelRuntimeVersion }]],
        babelHelpers: "runtime",
      }),
    ],
  },

  // ES
  {
    input: "src/index.ts",
    output: { file: "es/metrics-queue-react.js", format: "es", indent: false },
    external,
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: noDeclarationFiles,
      }),
      babel({
        extensions,
        plugins: [["@babel/plugin-transform-runtime", { version: babelRuntimeVersion, useESModules: true }]],
        babelHelpers: "runtime",
      }),
    ],
  },

  // ES for Browsers
  {
    input: "src/index.ts",
    output: { file: "es/metrics-queue-react.mjs", format: "es", indent: false },
    plugins: [
      nodeResolve({
        extensions,
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: noDeclarationFiles,
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: "src/index.ts",
    output: {
      file: "dist/metrics-queue-react.js",
      format: "umd",
      name: "metrics-queue-react",
      indent: false
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: noDeclarationFiles,
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
    ],
  },

  // UMD Production
  {
    input: "src/index.ts",
    output: {
      file: "dist/metrics-queue-react.min.js",
      format: "umd",
      name: "metrics-queue-react",
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: noDeclarationFiles,
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  },
]);
