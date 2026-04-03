import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [];

export default [
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: 'dist/index.mjs', format: 'es', sourcemap: true },
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
];
