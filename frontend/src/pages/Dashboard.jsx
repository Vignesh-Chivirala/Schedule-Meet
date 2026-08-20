import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import TaskFilterBar from '../components/TaskFilterBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters, Search, Sort & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 9 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const { data } = await API.get('/tasks/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 9,
        status: statusFilter,
        priority: priorityFilter,
        search: search.trim(),
        sortBy,
        order: sortOrder,
      };
      const { data } = await API.get('/tasks', { params });
      setTasks(data.tasks);
      setPagination({
        total: data.total,
        pages: data.pages,
        limit: data.limit,
      });
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not load tasks. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, search, sortBy, sortOrder]);

  // Debounced search reset page
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  // Submit Handler (Create or Update)
  const handleModalSubmit = async (formData) => {
    try {
      setSaving(true);
      if (currentTask) {
        await API.put(`/tasks/${currentTask._id}`, formData);
      } else {
        await API.post('/tasks', formData);
      }
      handleCloseModal();
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to save task:', err);
      alert(err.response?.data?.message || 'Error saving task');
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Error deleting task');
    }
  };

  // Quick Status Toggle Handler
  const handleToggleStatus = async (task, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
      await API.put(`/tasks/${task._id}`, { status: newStatus });
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchTasks(); // revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Analytics Section */}
        <AnalyticsDashboard analytics={analytics} loading={analyticsLoading} />

        {/* Filter and Search Bar */}
        <TaskFilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onOpenCreateModal={handleOpenCreate}
        />

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-4 mb-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-300 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Grid / Loading / Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center my-6 shadow-xs">
            <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No tasks found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {search || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'You do not have any tasks yet. Create your first task to get started!'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <span>+ Create First Task</span>
            </button>
          </div>
        ) : (
          <>
            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 px-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{pagination.pages}</span> ({pagination.total} tasks total)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                    className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialTask={currentTask}
        loading={saving}
      />
    </div>
  );
};

export default Dashboard;
