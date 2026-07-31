import { request } from "./client";

const authHeader = (token) =>
  token ? {Authorization: `Bearer ${token}`}: {};

export const getRooms = () =>
  request("/rooms");

export const getRoom = (roomId, token) =>
  request(`/rooms/${roomId}`, {
    headers: authHeader(token),
  });

export const getRoomMessages = (roomId, token) =>
  request(`/rooms/${roomId}/messages`, {
    headers: authHeader(token),
  });

export const createRoom = (token, roomData) =>
  request("/rooms", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(roomData),
  });

export const updateRoom = (token, roomId, updates) =>
  request(`/rooms/${roomId}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(updates),
  });

export const deleteRoom = (token, roomId) =>
  request(`/rooms/${roomId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });