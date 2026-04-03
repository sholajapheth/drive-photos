import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom', 'react/jsx-runtime', '@drive-photos/core'],
    output: [
      { file: 'dist/index.mjs', format: 'es', sourcemap: true, banner: "'use client';" },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        banner: "'use client';",
      },
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
