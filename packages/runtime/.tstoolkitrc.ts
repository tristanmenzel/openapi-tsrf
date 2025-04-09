import type { TsToolkitConfig } from '@makerx/ts-toolkit'

const config: TsToolkitConfig = {
  packageConfig: {
    srcDir: 'src',
    outDir: 'dist',
    moduleType: 'commonjs',
    exports: {
      '.': './index.ts',
    },
    main: 'index.ts',
    exportTypes: 'both',
  },
}
export default config
