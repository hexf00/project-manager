import path from 'path'
export function resolvePath(...paths: string[]) { 
  return path.resolve(__dirname, '../', ...paths)
}