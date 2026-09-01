interface Window {
  gtag: (
    command: "config" | "event" | "js",
    target: string | Date,
    params?: Record<string, any>,
  ) => void;
}
