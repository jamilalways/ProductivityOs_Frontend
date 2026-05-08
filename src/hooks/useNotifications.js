import { useEffect, useState } from 'react';
import { useTaskStore }  from '../store/taskStore';
import { useGoalStore }  from '../store/goalStore';
import { daysUntil }     from '../utils/dateUtils';

export const useNotifications = () => {
  const { tasks } = useTaskStore();
  const { goals } = useGoalStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const list = [];

    // Overdue tasks
    tasks.forEach((t) => {
      if (t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()) {
        list.push({ id: `task-${t._id}`, type: 'overdue', message: `"${t.title}" is overdue`, priority: 'high' });
      }
    });

    // Goals expiring soon
    goals.forEach((g) => {
      const days = daysUntil(g.deadline);
      if (g.status === 'active' && days >= 0 && days <= 3) {
        list.push({ id: `goal-${g._id}`, type: 'deadline', message: `Goal "${g.title}" due in ${days}d`, priority: 'medium' });
      }
    });

    setNotifications(list);
  }, [tasks, goals]);

  return { notifications, count: notifications.length };
};
