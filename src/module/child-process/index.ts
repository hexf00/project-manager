import { ChildProcessWithoutNullStreams } from "child_process"
import SCallback from "@/module/scallback"
import Stdout from "@/module/stdout"

export default class ChildProcess {
  callback = {
    status: new SCallback<(status: boolean) => void>(),
    message: new SCallback<(message: any) => void>()
  }
  stdout: Stdout
  process?: ChildProcessWithoutNullStreams
  get status() { 
    return !!this.process
  }
  private processGenerate: () => ChildProcessWithoutNullStreams
  constructor({ processGenerate, callback = {}, stdout = new Stdout }: {
    processGenerate: () => ChildProcessWithoutNullStreams
    stdout?: Stdout
    callback?: {
      message?: (message: any) => void
      status?: (status: boolean) => void
    }
  }) {
    this.stdout = stdout
    this.processGenerate = processGenerate
    callback.message && this.callback.message.add(callback.message)
    callback.status && this.callback.status.add(callback.status)
  }
  getLastStdout(length: number) { 
    return this.stdout.data.slice(-length)
  }
  run() { 
    if (this.process) return 
    
    this.stdout.pushLog(`Process started`)
    this.process = this.processGenerate()
    this.callback.status.fire(this.status)
    this.process.on('error', err => {
        this.stdout.pushError(err.message)
      })
      .on('message', message => {
        this.callback.message.fire(message)
      })
      .on('exit', code => {
        this.stdout.pushLog(`Process finished with exit code ${code}`)
        this.process = undefined
        this.callback.status.fire(this.status)
      })
    this.process.stdout.on('data', data => {
      this.stdout.pushLog(data.toString())
    })
    this.process.stderr.on('data', data => {
      this.stdout.pushError(data.toString())
    })
  }
  kill() { 
    if (!this.process) return

    this.process.kill()
  }
}