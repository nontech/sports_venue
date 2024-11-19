import { useState, useEffect } from "react";

interface GoogleMapsState {
  isLoaded: boolean;
  error: string | null;
}

let isScriptLoaded = false;
let globalApiKey: string | null = null;

export function useGoogleMaps() {
  const [state, setState] = useState<GoogleMapsState>({
    isLoaded: false,
    error: null,
  });

  useEffect(() => {
    if (isScriptLoaded) {
      setState({ isLoaded: true, error: null });
      return;
    }

    async function initializeGoogleMaps() {
      try {
        if (!globalApiKey) {
          const response = await fetch("/api/map-init");
          if (!response.ok)
            throw new Error("Failed to fetch API key");
          const data = await response.json();
          globalApiKey = data.apiKey;
        }

        if (!globalApiKey) {
          throw new Error("Invalid API key");
        }

        // Remove any existing Google Maps scripts
        const existingScripts = document.querySelectorAll(
          'script[src*="maps.googleapis.com"]'
        );
        existingScripts.forEach((script) => script.remove());

        // Load the script
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${globalApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Google Maps script"));
        });

        document.head.appendChild(script);
        await loadPromise;

        isScriptLoaded = true;
        setState({ isLoaded: true, error: null });
      } catch (error) {
        setState({
          isLoaded: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load Google Maps",
        });
      }
    }

    initializeGoogleMaps();

    return () => {
      // Cleanup if component unmounts during loading
      isScriptLoaded = false;
      globalApiKey = null;
    };
  }, []);

  return state;
}
