import child_process, { ChildProcessWithoutNullStreams } from 'child_process'
import BuildService from './build'
import DevService from './dev'
import SCallback from '../scallback'

type options = {
  name: string
  path: string
  command: {
    dev: string
    build: string
  }
  context: string
}

type statusResult = {
  name: string
  dev: {
    status: boolean
    host: string
    port: string
  }
  build: {
    status: boolean
  }
}

export default class Project {
  name: string
  path: string
  command: {
    dev: string
    build: string
  }
  context: string
  devService: DevService
  buildService: BuildService
  callback = {
    status: new SCallback<(data: statusResult) => void>()
  }
  fireStatusEvent() { 
    this.callback.status.fire({
      name: this.name,
      dev: {
        status: this.devService.status,
        host: this.devService.host,
        port: this.devService.port
      },
      build: {
        status: this.buildService.status
      }
    })
  }
  constructor({ name, path, command, context }: options) { 
    this.name = name
    this.path = path
    this.command = command
    this.context = context
    this.devService = new DevService({
      processGenerate: () => {
        const args = this.command.dev.split(' ')
        return child_process.spawn(args[0], args.slice(1), { cwd: this.context, stdio: ['ipc', 'pipe', 'pipe'] }) as ChildProcessWithoutNullStreams
      }
    })
    this.devService.callback.status.add(() => {
      this.fireStatusEvent()
    })
    this.buildService = new BuildService({
      name: this.name,
      processGenerate: () => {
        const args = this.command.build.split(' ')
        return child_process.spawn(args[0], args.slice(1), { cwd: this.context, stdio: ['ipc', 'pipe', 'pipe'] }) as ChildProcessWithoutNullStreams
      }
    })
    this.buildService.callback.status.add(() => {
      this.fireStatusEvent()
    })
  }
}