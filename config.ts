import path from 'path'
import fs from 'fs'
const root = path.resolve('D:\\desktop\\wform\\project')
const projects = fs.readdirSync(root).map(name => ({ path: root + '\\' + name + '\\config.js', name })).filter(({ path }) => {
  return fs.existsSync(path)
}).map(({ path, name }) => {
  const config: { title?: string } = eval('require')(path)
  return {
    context: 'D:\\desktop\\wform',
    name: config.title || name,
    path,
    command: {
      dev: 'node build/dev.js ' + name,
      build: 'node build/build.js ' + name
    }
  }
})
const config = {
  projects,
  zipPath: 'D:\\项目历史包'
}
export default config