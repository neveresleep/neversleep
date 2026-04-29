export const TASK_GROUPS = {
  text: {
    id: 'text',
    labelKey: 'groups.text',
    tasks: ['social-media-post', 'article', 'email', 'copywriting', 'translation'],
  },
  visual: {
    id: 'visual',
    labelKey: 'groups.visual',
    tasks: ['generate-image', 'create-video', 'presentation', 'design', 'photo-edit'],
  },
  work: {
    id: 'work',
    labelKey: 'groups.work',
    tasks: ['research', 'transcribe', 'analyze-doc', 'summary'],
  },
  automate: {
    id: 'automate',
    labelKey: 'groups.automate',
    tasks: ['chatbot', 'workflow', 'scraper', 'notification'],
  },
  nocode: {
    id: 'nocode',
    labelKey: 'groups.nocode',
    tasks: ['landing', 'web-app', 'internal-tool'],
  },
} as const;

export type GroupKey = keyof typeof TASK_GROUPS;
