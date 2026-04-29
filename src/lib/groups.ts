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

// ---------------------------------------------------------------------------
// Pre-built reverse index: taskId → GroupKey
// Built once at module load so repeated calls are O(1).
// ---------------------------------------------------------------------------

const TASK_TO_GROUP: ReadonlyMap<string, GroupKey> = (() => {
  const map = new Map<string, GroupKey>();
  for (const [key, group] of Object.entries(TASK_GROUPS) as [GroupKey, (typeof TASK_GROUPS)[GroupKey]][]) {
    for (const task of group.tasks) {
      map.set(task, key);
    }
  }
  return map;
})();

/**
 * Returns the GroupKey that contains the given taskId, or `undefined` when
 * the task does not belong to any known group.
 */
export function getGroupByTask(taskId: string): GroupKey | undefined {
  return TASK_TO_GROUP.get(taskId);
}

/**
 * Returns the array of task IDs belonging to the given group.
 */
export function getGroupTasks(groupKey: GroupKey): string[] {
  return [...TASK_GROUPS[groupKey].tasks];
}
