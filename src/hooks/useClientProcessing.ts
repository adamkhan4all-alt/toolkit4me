import { useCallback, useRef, useState } from "react";
import type { ClientProcessOutput, ClientProcessor, ClientProcessorOptions } from "../lib/processing/clientProcessors";
import { ImageProcessingError } from "../lib/processing/imageProcessing";

export type ClientWorkflowState = "empty" | "selected" | "processing" | "completed" | "error";

interface UseClientProcessingResult {
  state: ClientWorkflowState;
  results: ClientProcessOutput[];
  errorMessage: string | null;
  setHasFiles: (hasFiles: boolean) => void;
  run: (files: File[], options: ClientProcessorOptions) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Drives the real (non-mocked) client-side processing pipeline: Empty ->
 * Selected -> Processing -> Completed | Error. Unlike useMockProcessing
 * there is no simulated "Uploading" phase — nothing is uploaded — and
 * failures are real: a corrupted image, an unsupported browser feature,
 * or an out-of-memory canvas operation surface as an actual Error caught
 * here, not a randomized simulation.
 */
export function useClientProcessing(processor: ClientProcessor): UseClientProcessingResult {
  const [state, setState] = useState<ClientWorkflowState>("empty");
  const [results, setResults] = useState<ClientProcessOutput[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const runToken = useRef(0);

  const setHasFiles = useCallback((hasFiles: boolean) => {
    setState(hasFiles ? "selected" : "empty");
    setErrorMessage(null);
  }, []);

  const run = useCallback(
    async (files: File[], options: ClientProcessorOptions) => {
      const token = ++runToken.current;
      setState("processing");
      setErrorMessage(null);
      try {
        const output = await processor(files, options);
        if (runToken.current !== token) return; // superseded by cancel/reset
        setResults(output);
        setState("completed");
      } catch (err) {
        if (runToken.current !== token) return;
        const message =
          err instanceof ImageProcessingError
            ? err.message
            : "Something went wrong while processing your file. Try a different file or try again.";
        setErrorMessage(message);
        setState("error");
      }
    },
    [processor]
  );

  const cancel = useCallback(() => {
    runToken.current++;
    setState("selected");
  }, []);

  const reset = useCallback(() => {
    runToken.current++;
    setState("empty");
    setResults([]);
    setErrorMessage(null);
  }, []);

  return { state, results, errorMessage, setHasFiles, run, cancel, reset };
}
