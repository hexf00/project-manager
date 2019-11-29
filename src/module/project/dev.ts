import ChildProcess from "@/module/child-process"
import { ChildProcessWithoutNullStreams } from "child_process"
import Stdout from "@/module/stdout"
import SCallback from "@/module/scallback"
import { getMyIpadress } from "../util"

export default class DevService {
  host: string = ''
  port: string = ''
  devProcess: ChildProcess
  private stdout = new Stdout
  get status() {
    return this.devProcess.status
  }
  callback = {
    stdout: this.stdout.callback,
    status: new SCallback<(data: { host: string, port: string, status: boolean }) => void>()
  }
  fireStatusCallback() { 
    this.callback.status.fire({
      host: this.host,
      port: this.port,
      status: this.status
    })
  }
  constructor({ processGenerate }: { processGenerate: () => ChildProcessWithoutNullStreams }) {
    this.devProcess = new ChildProcess({
      processGenerate: processGenerate,
      stdout: this.stdout,
      callback: {
        message: message => {
          if (message && message.method === 'success') {
            this.host = message.data.host || ''
            if (message.data.host === '0.0.0.0') {
              this.host = getMyIpadress() || message.data.host
            }
            this.port = message.data.port || ''
            this.fireStatusCallback()
          }
        },
        status: status => {
          if (!status) {
            this.host = ''
            this.port = ''
          }
          this.fireStatusCallback()
        }
      }
    })
  }
  getLastStdout(length: number) { 
    return this.stdout.data.slice(-length)
  }
  run() { 
    if (!this.status) {
      this.devProcess.run()
    }
    return this
  }
  kill() { 
    if (this.status) {
      this.devProcess.kill()
    }
    return this
  }
}