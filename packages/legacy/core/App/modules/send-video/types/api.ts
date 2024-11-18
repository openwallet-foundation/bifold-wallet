export type Prompt = {
  id: string
  text: string
}

export type Session = {
  id: string
  prompts: Prompt[]
}
