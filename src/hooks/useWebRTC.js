// hooks/useWebRTC.js — manages peer-to-peer video connections.
import { useEffect, useRef, useState } from "react";
import { socket } from "../api/socket";

const ICE_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export function useWebRTC(localStream, currentUserId) {
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});

  // Tracks every peer we've heard has their camera on, even if we
  // couldn't connect to them yet (e.g. our own camera wasn't ready).
  // This is what fixes the "wrong order" bug.
  const activePeerIds = useRef(new Set());

  function createPeerConnection(peerUserId) {
    if (peerConnections.current[peerUserId]) {
      return peerConnections.current[peerUserId]; // don't double-connect
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);
    localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", { targetUserId: peerUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [peerUserId]: event.streams[0] }));
    };

    peerConnections.current[peerUserId] = pc;
    return pc;
  }

  async function offerTo(peerUserId) {
    const pc = createPeerConnection(peerUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc-offer", { targetUserId: peerUserId, offer });
  }

  // NEW: whenever OUR OWN camera turns on, retry connecting to anyone
  // we already know has their camera on, instead of only reacting to
  // brand-new announcements.
  useEffect(() => {
    if (!localStream) return;

    activePeerIds.current.forEach((peerUserId) => {
    //   if (peerUserId !== currentUserId && !peerConnections.current[peerUserId]) {
    //     offerTo(peerUserId);
    //   }
  
       // Only initiate if we're the "lower ID" side — prevents both peers
  // from sending an offer at the same time (a collision called "glare").
  // The higher-ID side just waits to receive an offer instead.
  
     
      if (peerUserId !== currentUserId && currentUserId < peerUserId && !peerConnections.current[peerUserId]) {
        offerTo(peerUserId);
      }

     
    });
  }, [localStream]);

  useEffect(() => {
    async function handlePeerCameraOn({ userId }) {
      activePeerIds.current.add(userId); // always remember, regardless of timing
    //   console.log("peer-camera-on:", userId, typeof userId, "| my id:", currentUserId, typeof currentUserId);

    //   if (localStream && userId !== currentUserId && !peerConnections.current[userId]) {
    //     await offerTo(userId);
    //   }

        if (localStream && userId !== currentUserId && currentUserId < userId && !peerConnections.current[userId]) {
        await offerTo(userId);
      }
    }

    async function handleOffer({ fromUserId, targetUserId, offer }) {
        // console.log("received offer, targetUserId:", targetUserId, typeof targetUserId, "| my id:", currentUserId, typeof currentUserId);
      if (targetUserId !== currentUserId) return;

      const pc = createPeerConnection(fromUserId);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { targetUserId: fromUserId, answer });
    }

    async function handleAnswer({ fromUserId, targetUserId, answer }) {
      if (targetUserId !== currentUserId) return;
      await peerConnections.current[fromUserId]?.setRemoteDescription(answer);
    }

    async function handleIceCandidate({ fromUserId, targetUserId, candidate }) {
      if (targetUserId !== currentUserId) return;
      await peerConnections.current[fromUserId]?.addIceCandidate(candidate);
    }

    function handlePeerCameraOff({ userId }) {
      activePeerIds.current.delete(userId);
      peerConnections.current[userId]?.close();
      delete peerConnections.current[userId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }

    socket.on("peer-camera-on", handlePeerCameraOn);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("peer-camera-off", handlePeerCameraOff);

    return () => {
      socket.off("peer-camera-on", handlePeerCameraOn);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("peer-camera-off", handlePeerCameraOff);
    };
  }, [localStream, currentUserId]);

  return { remoteStreams };
}