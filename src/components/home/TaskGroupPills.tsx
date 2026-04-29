'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { TASK_GROUPS, type GroupKey } from '@/lib/groups';

const GROUP_LABELS: Record<GroupKey, string> = {
  text: 'Тексты',
  visual: 'Визуал',
  work: 'Работа',
  automate: 'Автоматизации',
  nocode: 'Без кода',
};

interface TaskGroupPillsProps {
  onGroupSelect: (group: GroupKey | null) => void;
  selectedGroup?: GroupKey | null;
}

export default function TaskGroupPills({
  onGroupSelect,
  selectedGroup,
}: TaskGroupPillsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [internalSelected, setInternalSelected] = useState<GroupKey | null>(null);

  const activeGroup =
    selectedGroup !== undefined ? selectedGroup : internalSelected;

  function handleClick(key: GroupKey) {
    const next = activeGroup === key ? null : key;
    if (selectedGroup === undefined) {
      setInternalSelected(next);
    }
    onGroupSelect(next);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Фильтр по группам задач">
      {(Object.keys(TASK_GROUPS) as GroupKey[]).map((key) => {
        const isSelected = activeGroup === key;
        return (
          <motion.button
            key={key}
            type="button"
            role="button"
            aria-pressed={isSelected}
            onClick={() => handleClick(key)}
            className="h-9 px-4 rounded-full text-[14px] font-semibold transition-all duration-150 border"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            animate={
              isSelected
                ? {
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 12px rgba(59,130,246,0.35)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    borderColor: 'rgba(255,255,255,0.70)',
                    color: '#1A1A2E',
                    boxShadow: 'none',
                  }
            }
            whileHover={
              isSelected
                ? {}
                : {
                    backgroundColor: 'rgba(255,255,255,0.82)',
                    borderColor: 'rgba(255,255,255,0.90)',
                    y: -1,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                  }
            }
            whileTap={{
              scale: shouldReduceMotion ? 1 : 0.96,
              y: 0,
              backgroundColor: isSelected
                ? '#2563EB'
                : 'rgba(255,255,255,0.45)',
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          >
            {GROUP_LABELS[key]}
          </motion.button>
        );
      })}
    </div>
  );
}
