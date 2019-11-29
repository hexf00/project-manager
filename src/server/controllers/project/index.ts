import ProjectsService from "../../services/projects";
import { ajaxSuccess, ajaxFail, wsSuccess, wsFail } from "../../util";
import * as WebSocket from 'ws';

export default class ProjectController {
  private projectService = new ProjectsService
  private find(name: string) {
    return this.projectService.data.find(item => item.name === name)
  }
  getList() {
    return ajaxSuccess(this.projectService.data.map((project) => ({
      name: project.name,
      status: project.devService.status,
      dev: {
        host: project.devService.host,
        port: project.devService.port
      }
    })))
  }
  getLastStdout({ name, length }: { name: string, length: number }) {
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.devService.getLastStdout(length))
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  run(name: string) {
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.devService.run().status)
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  stop(name: string) {
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.devService.kill().status)
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  runBuild(name: string) {
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.buildService.run().status)
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  stopBuild(name: string) {
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.buildService.kill().status)
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  getBuildFiles(name: string) { 
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.buildService.getFiles())
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  getBuildFile(name: string, path: string) {
    const project = this.find(name)
    if (project) {
      return project.buildService.getFile(path)
    } else {
      return null
    }
  }
  removeFile(name: string, path: string) { 
    const project = this.find(name)
    if (project) {
      return ajaxSuccess(project.buildService.removeFile(path))
    } else {
      return ajaxFail(`${name}项目不存在`)
    }
  }
  onWebsocketConnect(ws: WebSocket) {
    const closeCallback: Function[] = []
    ws.on('message', message => {
      try {
        if (!message) {
          return //心跳包
        }
        let action: {
          method: 'dev' | 'build',
          params: {
            name: string
          }
        } | {
          method: 'unknown'
        } | {
          method: 'status'
        }
        try {
          action = JSON.parse(message.toString())
        } catch (e) {
          action = { method: 'unknown' }
        }
        switch (action.method) {
          case "status":
            closeCallback.push(...this.projectService.data.map(project => {
              const unbind = project.callback.status.bind(data => {
                ws.send(JSON.stringify(data))
              })
              project.fireStatusEvent()
              return unbind
            }))
            break;
          case "dev":
          case "build":
            const p = this.find(action.params.name)
            if (p) {
              let unbind: Function = () => { }
              if (action.method === 'dev') {
                unbind = p.devService.callback.stdout.bind(data => {
                  ws.send(JSON.stringify(data))
                })
              } else if (action.method === 'build') {
                unbind = p.buildService.callback.stdout.bind(data => {
                  ws.send(JSON.stringify(data))
                })
              }
              closeCallback.push(unbind)
            } else {
              ws.send(wsFail('项目未找到'))
              ws.close()
            }
            break;
          default:
            ws.send(wsFail('不支持的消息类型'))
        }
      } catch (e) {
        console.log(e)
        ws.close()
      }
    })
    ws.on('close', () => {
      closeCallback.forEach(callback => {
        try {
          callback.call(null)
        } catch (e) { console.error(e) }
      })
    })
  }
}