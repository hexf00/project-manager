import webpackConfig from './config'
import webpack from 'webpack'
import { resolvePath } from './util';
import rm from 'rimraf'

(async () => {
  const outPath = resolvePath('dist/')
  rm(webpackConfig.output!.path || outPath, {}, err => {
    if (err) throw err
    webpack(webpackConfig, (err, stats) => {
      if (err) throw err
      if (stats.hasErrors()) {
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n')
        console.error('Build failed with errors.\n')
      } else {
        console.log('Build Success.')
      }
    })
  })
})()