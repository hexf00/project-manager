import config from '../config'
import server from './server'
import Manager from './manager'
import Project from '@/module/project'
import nestStart from './nest'

Manager.config.zipPath = config.zipPath
Manager.projects.push(
  ...config.projects.map(option => new Project(option))
)
server()
