import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getTask } from '../api/tasks';

// Shows one task. The id comes from the URL, e.g. /tasks/3 -> id === "3".
export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);

  // Fetch whenever the id in the URL changes. The `active` flag ignores a
  // response that arrives after we've already navigated away.
  useEffect(() => {
    let active = true;
    getTask(id)
      .then((data) => active && setTask(data))
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className='text-red-500'>{error}</p>;
  if (!task) return <p>Loading…</p>; // no task yet = still loading

  return (
    <section>
      <Link to='/tasks' className='text-sm text-(--accent)'>
        ← Back to tasks
      </Link>
      <h1 className='mt-4 text-3xl font-semibold text-(--text-h)'>
        {task.title}
      </h1>
      <p className='mt-2'>{task.description || 'No description.'}</p>
      <p className='mt-4 text-sm'>
        Status: {task.completed ? '✅ Done' : '⬜ Not done'}
      </p>
    </section>
  );
}
