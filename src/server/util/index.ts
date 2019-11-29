export function ajaxSuccess<T>(info: T) { 
  return {
    status: 1,
    info
  }
}
export function ajaxFail(msg: string) { 
  return {
    status: 0,
    msg
  }
}

export function wsSuccess(info: any){ 
  try {
    return JSON.stringify(ajaxSuccess(info))
  } catch (e) {
    return wsFail('返回值错误')
  }
}
export function wsFail(msg: string) { 
  return JSON.stringify(ajaxFail('返回值错误'))
}