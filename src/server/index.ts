import express from 'express'
import expressWs from 'express-ws'
import ProjectController from './controllers/project'

export default async () => {
  const app = expressWs(express()).app
  const project = new ProjectController
  app.use(express.json())
  app.use((req, res, next) => {
    if (/\/{2}/.test(req.path)) {
      req.url = req.url.replace(req.path, req.path.replace(/\/+/g, '\/'))
    }
    next()
  })
  app.post('/getList', (req, res) => {
    res.send(project.getList())
  })
  app.post('/run', (req, res) => {
    res.send(project.run(req.body.name))
  })
  app.post('/stop', (req, res) => {
    res.send(project.stop(req.body.name))
  })
  app.post('/runBuild', (req, res) => {
    res.send(project.runBuild(req.body.name))
  })
  app.post('/stopBuild', (req, res) => {
    res.send(project.stopBuild(req.body.name))
  })
  app.post('/getBuildFiles', (req, res) => {
    res.send(project.getBuildFiles(req.body.name))
  })
  app.post('/getLastStdout', (req, res) => {
    res.send(project.getLastStdout({
      name: req.body.name,
      length: req.body.length
    }))
  })
  app.post('/removeFile', (req, res) => {
    res.send(project.removeFile(req.body.project, req.body.name))
  })
  app.get('/downloadFile', (req, res) => {
    const fileBuffer = project.getBuildFile(req.query.project, req.query.name)
    if (fileBuffer) {
      res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(req.query.name));
      res.send(fileBuffer)
    } else {
      res.send("文件不存在")
    }
  })
  app.ws('/', (ws, res) => {
    project.onWebsocketConnect(ws)
  })

  app.listen(3000, () => console.log('start...'))
  return app
}