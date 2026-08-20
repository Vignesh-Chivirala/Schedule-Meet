import React from 'react';
import { Calendar, Edit3, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const priorityColors = {
  High: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800/50',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  Low: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
};

const statusColors = {
  Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  'In Progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
  Todo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isDone = task.status === 'Done';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Todo') return 'In Progress';
    if (currentStatus === 'In Progress') return 'Done';
    return 'Todo';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
      isDone
        ? 'border-gray-200 dark:border-gray-800 opacity-80'
        : isOverdue
        ? 'border-red-300 dark:border-red-800/70 ring-1 ring-red-500/20'
        : 'border-gray-200 dark:border-gray-700/60'
    }`}>
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-3 gap-2">
          
          {/* Status Badge & Toggle Button */}
          <button
            onClick={() => onToggleStatus(task, getNextStatus(task.status))}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all flex items-center space-x-1.5 cursor-pointer hover:scale-105 ${statusColors[task.status]}`}
            title="Click to advance status"
          >
            {task.status === 'Done' && <CheckCircle className="h-3.5 w-3.5" />}
            {task.status === 'In Progress' && <Clock className="h-3.5 w-3.5" />}
            {task.status === 'Todo' && <div className="w-2 h-2 rounded-full bg-gray-400" />}
            <span>{task.status}</span>
          </button>

          {/* Priority Badge */}
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority} Priority
          </span>
        </div>

        {/* Task Title */}
        <h3 className={`text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Card Footer: Due Date & Actions */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between mt-2 text-xs">
        
        {/* Due Date */}
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {task.dueDate ? (
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold flex items-center gap-1' : ''}>
              {formatDate(task.dueDate)}
              {isOverdue && <AlertCircle className="h-3 w-3 inline" title="Overdue!" />}
            </span>
          ) : (
            <span className="italic text-gray-400">No due date</span>
          )}
        </div>

        {/* Actions: Edit & Delete */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;
