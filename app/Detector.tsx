"use client";

import React, { useEffect, useState } from "react";
import { PitchDetector } from "pitchy";
import Button from "@/components/Button";

const Detector = () => {
  const [pitch, setPitch] = useState<number>(0);
  const [clarity, setClarity] = useState<number>(0);
  const [smoothedPitch, setSmoothedPitch] = useState<number>(0);

  const [currentNote, setCurrentNote] = useState<{
    noteName: string;
    octave: number;
    cents: number;
    freq: number;
  }>({
    noteName: "A",
    octave: 4,
    cents: 0,
    freq: 440,
  });

  // Define pitch and clarity thresholds
  const pitchThreshold = 5; // Adjust as needed
  const clarityThreshold = 50; // Adjust as needed

  useEffect(() => {
    const audioContext = new window.AudioContext();
    const analyserNode = audioContext.createAnalyser();

    // Update the current note state every time the pitch changes

    // Check if the 'resume-button' element exists in the DOM before adding the event listener
    const resumeButton = document.getElementById("resume-button");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => audioContext.resume());
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioContext.createMediaStreamSource(stream).connect(analyserNode);
      const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
      const input = new Float32Array(detector.inputLength);

      const updatePitch = () => {
        analyserNode.getFloatTimeDomainData(input);
        const [newPitch, newClarity] = detector.findPitch(
          input,
          audioContext.sampleRate
        );

        // Apply moving average smoothing
        const smoothingFactor = 0.2; // Adjust as needed
        const smoothed =
          smoothedPitch + smoothingFactor * (newPitch - smoothedPitch);

        // Set the smoothed pitch value
        setSmoothedPitch(Math.round(smoothed * 100) / 100);

        setPitch(Math.round(newPitch * 100) / 100);
        setClarity(Math.round(newClarity * 100));

        window.setTimeout(updatePitch, 400);
      };

      updatePitch();
    });

    // Clean up and disconnect audio context when the component unmounts
    return () => {
      audioContext.close().then(() => console.log("AudioContext closed."));
    };
  }, []);

  useEffect(() => {
    const A = 440;
    const SEMITONE = 69;
    const noteStrings = [
      "C",
      "C♯",
      "D",
      "D♯",
      "E",
      "F",
      "F♯",
      "G",
      "G♯",
      "A",
      "A♯",
      "B",
    ];

    const getNote = (freq: number) => {
      return Math.round(12 * (Math.log(freq / A) / Math.log(2))) + SEMITONE;
    };

    const getCents = (freq: number, note: number) => {
      return Math.floor(
        (1200 * Math.log(freq / (A * Math.pow(2, (note - SEMITONE) / 12)))) /
          Math.log(2)
      );
    };

    const getFrequency = (note: number) => {
      return A * Math.pow(2, (note - SEMITONE) / 12);
    };

    const getNoteName = (note: number) => {
      return noteStrings[note % 12];
    };

    const getOctave = (note: number) => {
      return Math.floor(note / 12) - 1;
    };

    const getNoteInfo = (freq: number) => {
      const note = getNote(freq);
      const cents = getCents(freq, note);
      const noteName = getNoteName(note);
      const octave = getOctave(note);
      return {
        noteName,
        octave,
        cents,
        freq,
      };
    };

    setCurrentNote({
      ...getNoteInfo(pitch),
    });
  }, [pitch]);

  return (
    <div>
      <p className="text-3xl font-bold">
        {currentNote.noteName} {currentNote.octave}
      </p>
      <p className="text-3xl font-bold">{currentNote.cents} cents</p>
      <p className="text-3xl font-bold">{currentNote.freq} Hz</p>

      <p
        className="text-3xl font-bold"
        style={{ color: clarity > 0 ? "green" : "red" }}>
        Clarity: {clarity} %
      </p>
      <Button id="resume-button">Resume Audio</Button>
    </div>
  );
};

export default Detector;
