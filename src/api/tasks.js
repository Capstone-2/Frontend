// api/tasks.js — every call for the "tasks" resource, in one file.
// Copy this file for your own resources (posts, users, ...) and swap the paths.

import { request } from './client';

export const getTasks = () => request('/api/tasks');

export const getTask = (id) => request(`/api/tasks/${id}`);

export const createTask = (data) =>
  request('/api/tasks', { method: 'POST', body: JSON.stringify(data) });

// PATCH updates only the fields you send (e.g. just { completed: true }).
export const updateTask = (id, data) =>
  request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' });
