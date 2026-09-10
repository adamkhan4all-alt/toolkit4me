import { useCallback, useRef, useState } from "react";

export type WorkflowState =
  | "empty"
  | "selected"
  | "uploading"
  | "processing"
  | "completed"
  | "error"
  | "expired";

interface UseMockProcessingResult {
  state: WorkflowState;
  uploadPercent: number;
  outputFileName: string | null;
  errorMessage: string | null;
  setFiles: (hasFiles: boolean) => void;
  start: (outputName: string) => void;
  cancel: () => void;
  reset: () => void;
  forceError: (message: string) => void;
  simulateExpired: () => void;
}

/**
 * Drives the mock front-end processing pipeline described in the Phase 2
 * spec (Section 5.2): Empty -> Selected -> Uploading -> Processing ->
 * Completed | Error | Expired. There is no real backend yet — this
 * simulates timing with randomized, believable delays so the UI/UX can be
 * fully exercised and later swapped for real network calls without
 * changing any component contracts.
 */
export function useMockProcessing(): UseMockProcessingResult {
  const [state, setState] = useState<WorkflowState>("empty");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [outputFileName, setOutputFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const setFiles = useCallback((hasFiles: boolean) => {
    clearTimers();
    setState(hasFiles ? "selected" : "empty");
    setErrorMessage(null);
  }, []);

  const start = useCallback((outputName: string) => {
    clearTimers();
    setState("uploading");
    setUploadPercent(0);

    let pct = 0;
    const uploadInterval = window.setInterval(() => {
      pct = Math.min(100, pct + Math.random() * 25 + 10);
      setUploadPercent(Math.round(pct));
      if (pct >= 100) {
        window.clearInterval(uploadInterval);
        setState("processing");

        const processingDelay = 1400 + Math.random() * 1600;
        const t = window.setTimeout(() => {
          // Simulate an occasional failure for realism / to exercise the Error state.
          const shouldFail = Math.random() < 0.08;
          if (shouldFail) {
            setErrorMessage(
              "This file appears to be corrupted and can't be processed. Try a different file."
            );
            setState("error");
          } else {
            setOutputFileName(outputName);
            setState("completed");
          }
        }, processingDelay);
        timers.current.push(t);
      }
    }, 220);
    timers.current.push(uploadInterval as unknown as number);
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    setState("selected");
    setUploadPercent(0);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState("empty");
    setUploadPercent(0);
    setOutputFileName(null);
    setErrorMessage(null);
  }, []);

  const forceError = useCallback((message: string) => {
    clearTimers();
    setErrorMessage(message);
    setState("error");
  }, []);

  const simulateExpired = useCallback(() => {
    clearTimers();
    setState("expired");
  }, []);

  return {
    state,
    uploadPercent,
    outputFileName,
    errorMessage,
    setFiles,
    start,
    cancel,
    reset,
    forceError,
    simulateExpired,
  };
}
