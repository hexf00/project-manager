import * as webpack from 'webpack'
import { resolvePath } from './util'

const webpackConfig: webpack.Configuration = {
  mode: 'production',
  target: 'node',
  output: {
    path: resolvePath('dist/'),
    publicPath: './',
    filename: '[name].js'
  },
  entry: resolvePath('src/index.ts'),
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
    alias: {
      '@': resolvePath('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
}
export default webpackConfig