import ChildProcess from "@/module/child-process";
import Stdout from "@/module/stdout";
import SCallback from "@/module/scallback";
import child_process, { ChildProcessWithoutNullStreams } from "child_process";
import Manager from "@/manager";
import fs from 'fs'
import { formatDate } from "../util";
import zipLocal from 'zip-local'

export default class BuildService {
  private buildProcess: ChildProcess
  private zipProcess: ChildProcess
  private zipStatus: boolean = false
  get status() {
    return this.zipStatus || this.buildProcess.status || this.zipProcess.status
  }
  stdout = new Stdout
  callback = {
    stdout: this.stdout.callback,
    status: new SCallback<(status: boolean) => void>(),
    build: new SCallback<(success: boolean) => void>()
  }
  name: string
  private fileFolder: string
  constructor({ processGenerate, name }: { name: string, processGenerate: () => ChildProcessWithoutNullStreams }) {
    let outPath = ''
    this.name = name
    this.fileFolder = Manager.config.zipPath + '\\' + name
    this.buildProcess = new ChildProcess({
      processGenerate: processGenerate,
      stdout: this.stdout,
      callback: {
        status: () => {
          this.callback.status.fire(this.status)
        },
        message: message => {
          if (message && message.method && message.method === 'success' && message.data && message.data.outPath) {
            outPath = message.data.outPath
            this.zipStatus = true
            try {
              if (!fs.existsSync(this.fileFolder)) {
                fs.mkdirSync(this.fileFolder)
              }
            } catch (e) {
              this.stdout.pushError(e.message)
            }
            this.buildProcess.stdout.pushLog('ziping...')
            zipLocal.sync.zip(outPath).compress().save(this.fileFolder + '\\' + name + formatDate(new Date(), 'yyyyMMddhhmmss.zip'))
            this.buildProcess.stdout.pushLog('zip success')
            this.zipStatus = false
          }
        }
      }
    })
    this.zipProcess = new ChildProcess({
      processGenerate: () => {
        try {
          if (!fs.existsSync(this.fileFolder)) {
            fs.mkdirSync(this.fileFolder)
          }
        } catch (e) {
          this.stdout.pushError(e.message)
        }
        const script = `
          console.log('ziping...');
          require('zip-local').sync.zip('${outPath.replace(/\\/gm, '\\\\')}').compress().save('${this.fileFolder.replace(/\\/gm, '\\\\')}\\\\${name}${formatDate(new Date(), 'yyyyMMddhhmmss')}.zip');
          console.log('zip success');
          process.send({ method: 'success' });
        `
        return child_process.spawn('node', ['-e', script], { stdio: ['ipc', 'pipe', 'pipe'] }) as ChildProcessWithoutNullStreams
      },
      callback: {
        message: message => {

        },
        status: () => {
          this.callback.status.fire(this.status)
        }
      },
      stdout: this.stdout
    })
  }
  getFile(name: string) {
    const path = this.fileFolder + '\\' + name.replace(/(\\|\/)/, '')
    return fs.readFileSync(path)
  }
  getFiles() { 
    if (!fs.existsSync(this.fileFolder)) {
      return []
    }
    return fs.readdirSync(this.fileFolder).filter(path => /\.zip$/.test(path)).reverse()
  }
  removeFile(name: string) { 
    const path = this.fileFolder + '\\' + name.replace(/(\\|\/)/, '')
    if (!fs.existsSync(path)) {
      return true
    }
    fs.unlinkSync(path)
    return true
  }
  getLastStdout(length: number) {
    return this.stdout.data.slice(-length)
  }
  run() {
    if (!this.status) {
      this.buildProcess.run()
    }
    return this
  }
  kill() {
    if (this.zipProcess.status) {
      this.zipProcess.kill()
    }
    if (this.buildProcess.status) {
      this.buildProcess.kill()
    }
    return this
  }
}