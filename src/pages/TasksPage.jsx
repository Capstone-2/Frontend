import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

// This page shows the full CRUD loop against the backend:
// read the list, create a task, toggle it done, and delete it.
export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState(''); // controlled input for the new-task form

  // Load the tasks once, when the page first appears.
  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create a task on the server, then add the returned row to the list on screen.
  async function handleCreate(e) {
    e.preventDefault(); // stop the browser from reloading on submit
    if (!title.trim()) return;

    try {
      const newTask = await createTask({ title });
      setTasks([newTask, ...tasks]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    }
  }

  // Flip completed on/off, then replace just that one task in the list.
  async function handleToggle(task) {
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete on the server, then remove it from the list.
  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading tasks…</p>;

  return (
    <section>
      <h1 className='mb-6 text-3xl font-semibold text-(--text-h)'>Tasks</h1>

      {/* Show any error instead of failing silently. */}
      {error && (
        <p className='mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500'>
          {error}
        </p>
      )}

      {/* Add-a-task form */}
      <form onSubmit={handleCreate} className='mb-6 flex gap-2'>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='New task title…'
          className='flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2'
        />
        <button
          type='submit'
          className='rounded-md bg-(--accent) px-4 py-2 font-medium text-white'
        >
          Add
        </button>
      </form>

      {/* Empty state vs. the list */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {tasks.map((task) => (
            <li
              key={task.id}
              className='flex items-center gap-3 rounded-md border border-(--border) px-4 py-3'
            >
              <input
                type='checkbox'
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              {/* Click the title to open the detail page for that task. */}
              <Link
                to={`/tasks/${task.id}`}
                className={
                  task.completed ? 'flex-1 line-through opacity-60' : 'flex-1'
                }
              >
                {task.title}
              </Link>
              <button
                onClick={() => handleDelete(task.id)}
                className='text-sm text-red-500 hover:underline'
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
