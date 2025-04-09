import type { TsToolkitConfig } from '@makerx/ts-toolkit'

const config: TsToolkitConfig = {
  packageConfig: {
    srcDir: 'src',
    outDir: 'dist',
    moduleType: 'module',
    exportTypes: 'module',
    main: 'index.ts',
    exports: {
      '.': 'index.ts',
      './cli': 'cli.ts',
    },
    bin: {
      'openapi-tsrf': 'bin/run-cli.ts',
    },
  },
}
export default config
