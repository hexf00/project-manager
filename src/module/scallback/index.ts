export default class SCallback<T extends (...args: any[]) => any> { 
  private callbacks: T[] = []
  constructor(callback?: T) { 
    if (callback) {
      this.add(callback)
    }
  }
  set(callback: T) { 
    this.clear().add(callback)
    return this
  }
  clear() { 
    this.callbacks.splice(0, this.callbacks.length)
    return this
  }
  add(callback: T) { 
    this.callbacks.push(callback)
    return this
  }
  bind(callback: T) { 
    this.callbacks.push(callback)
    return () => {
      this.unbind(callback)
      callback = null!
    }
  }
  unbind(callback: T) {
    return this.remove(callback)
  }
  remove(callback: T) {
    const index = this.callbacks.findIndex(fn => fn === callback)
    if (index > -1) this.callbacks.splice(index, 1)
    return this
  }
  fire(...args: Parameters<T>) {
    this.callbacks.forEach(callback => {
      callback.apply(null, args)
    })
    return this
  }
}

export class Callbacks<T extends Record<string, SCallback<any>>> { 
  map: T
  constructor(map: T) {
    this.map = map
  }
  key(key: keyof T) { 
    return this.map[key]
  }
}