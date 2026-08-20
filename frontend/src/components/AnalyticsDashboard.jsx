import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, AlertTriangle } from 'lucide-react';

const AnalyticsDashboard = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  const {
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    completionPercentage = 0,
    byStatus = { Todo: 0, 'In Progress': 0, Done: 0 },
    byPriority = { Low: 0, Medium: 0, High: 0 },
  } = analytics || {};

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Tasks
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {totalTasks}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <ListTodo className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Completed
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {completedTasks}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {pendingTasks}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Completion Rate
            </p>
            <h3 className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
              {completionPercentage}%
            </h3>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Visual Progress Bar & Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Task Completion Progress
          </h4>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-1.5"></span> Todo: {byStatus.Todo || 0}
            </span>
            <span className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span> In Progress: {byStatus['In Progress'] || 0}
            </span>
            <span className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Done: {byStatus.Done || 0}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 flex overflow-hidden">
          {totalTasks > 0 ? (
            <>
              <div
                style={{ width: `${(byStatus.Done / totalTasks) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Done: ${byStatus.Done}`}
              ></div>
              <div
                style={{ width: `${(byStatus['In Progress'] / totalTasks) * 100}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`In Progress: ${byStatus['In Progress']}`}
              ></div>
              <div
                style={{ width: `${(byStatus.Todo / totalTasks) * 100}%` }}
                className="bg-slate-400 transition-all duration-500"
                title={`Todo: ${byStatus.Todo}`}
              ></div>
            </>
          ) : (
            <div className="w-full bg-gray-200 dark:bg-gray-700"></div>
          )}
        </div>

        {/* Priority Chips */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Priority breakdown:</span>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-medium border border-red-200 dark:border-red-800/40">
              High: {byPriority.High || 0}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/40">
              Medium: {byPriority.Medium || 0}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800/40">
              Low: {byPriority.Low || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
