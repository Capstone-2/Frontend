// hooks/useCamera.js — manages the local camera/mic stream.

import { useState } from "react";
import { socket } from "../api/socket";

export function useCamera(){
    // Holds the actual MediaStream object once the camera is on.
    
     const [localStream, setLocalStream] = useState(null);
     const [error, setError] = useState("");

        async function turnOnCamera() {
            try{
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setLocalStream(stream);
                setError("");


                socket.emit("camera-on");

            } catch (err){
                console.log("Could not access camera:", err.message);
                setError("Could not access your camera or microphone.");
            }
        } 

        function turnOffCamera(){
            localStream?.getTracks().forEach((track) => track.stop() );
            setLocalStream(null);
            socket.emit("camera-off");
        }

        return {localStream, error, turnOnCamera, turnOffCamera};
     
}
