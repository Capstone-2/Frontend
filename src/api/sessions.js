import { request } from "./client";

export const startSession = (roomId) =>
    request("/sessions", {
        method: "POST",
        body: JSON.stringify({ roomId })
    }); 

export const endSession = ( sessionId ) =>
    request(`/sessions/${sessionId}/end`, {
        method: "PATCH",
    });