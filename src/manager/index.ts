import Project from "@/module/project";

const Manager = Object.freeze<{
  projects: Project[]
  config: {
    zipPath: string
  }
}>({
  projects: [],
  config: {
    zipPath: ''
  }
})

export default Manager