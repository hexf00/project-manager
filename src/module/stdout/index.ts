import SCallback from "@/module/scallback"

enum type {
  'log',
  'error'
}
type message = {
  type: type
  content: string
}
export default class Stdout {
  callback = new SCallback<(data: message) => void>()
  data: message[] = []
  clear() { 
    this.data = []
  }
  pushLog(content: string) { 
    const message = {
      type: type.log,
      content
    }
    this.data.push(message)
    this.callback.fire(message)
  }
  pushError(content: string) { 
    const message = {
      type: type.error,
      content
    }
    this.data.push(message)
    this.callback.fire(message)
  }
}