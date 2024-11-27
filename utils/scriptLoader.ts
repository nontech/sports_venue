type ScriptStatus = "loading" | "loaded" | "error";

class ScriptLoader {
  private static instance: ScriptLoader;
  private scripts: Map<string, ScriptStatus>;
  private callbacks: Map<string, Array<(error?: Error) => void>>;

  private constructor() {
    this.scripts = new Map();
    this.callbacks = new Map();
  }

  public static getInstance(): ScriptLoader {
    if (!ScriptLoader.instance) {
      ScriptLoader.instance = new ScriptLoader();
    }
    return ScriptLoader.instance;
  }

  public loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const status = this.scripts.get(src);

      if (status === "loaded") {
        resolve();
        return;
      }

      if (status === "loading") {
        this.addCallback(src, resolve, reject);
        return;
      }

      this.scripts.set(src, "loading");
      this.callbacks.set(src, []);
      this.addCallback(src, resolve, reject);

      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = () => {
        this.scripts.set(src, "loaded");
        this.executeCallbacks(src);
      };

      script.onerror = (event: Event | string) => {
        this.scripts.set(src, "error");
        const error = new Error(
          typeof event === "string"
            ? event
            : `Failed to load script: ${src}`
        );
        this.executeCallbacks(src, error);
      };

      document.head.appendChild(script);
    });
  }

  private addCallback(
    src: string,
    resolve: () => void,
    reject: (error: Error) => void
  ) {
    const callbacks = this.callbacks.get(src) || [];
    callbacks.push((error?: Error) => {
      if (error) reject(error);
      else resolve();
    });
    this.callbacks.set(src, callbacks);
  }

  private executeCallbacks(src: string, error?: Error) {
    const callbacks = this.callbacks.get(src) || [];
    callbacks.forEach((callback) => callback(error));
    this.callbacks.delete(src);
  }
}

export const scriptLoader = ScriptLoader.getInstance();

export const loadGoogleMapsScript = () => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  return new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject();
  });
};
