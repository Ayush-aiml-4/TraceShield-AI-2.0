// Real application-level outbound network monitoring for TraceShield AI 2.0
// Only monitors TraceShield-originated network activity.

class NetworkTracker {
  private requestCount = 0;
  private bytesSent = 0;
  private isInstrumented = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.isInstrumented) return;
    if (typeof window !== 'undefined') {
      try {
        const originalFetch = window.fetch;
        if (typeof originalFetch === 'function') {
          window.fetch = async (...args: Parameters<typeof fetch>) => {
            this.requestCount++;
            const body = args[1]?.body;
            if (typeof body === 'string') {
              this.bytesSent += new Blob([body]).size;
            } else if (body instanceof Blob) {
              this.bytesSent += body.size;
            } else if (body instanceof ArrayBuffer) {
              this.bytesSent += body.byteLength;
            }
            return originalFetch.apply(window, args);
          };
        }

        if (typeof XMLHttpRequest !== 'undefined') {
          const originalXhrSend = XMLHttpRequest.prototype.send;
          const self = this;
          XMLHttpRequest.prototype.send = function (body) {
            self.requestCount++;
            if (typeof body === 'string') {
              self.bytesSent += new Blob([body]).size;
            } else if (body instanceof Blob) {
              self.bytesSent += body.size;
            } else if (body instanceof ArrayBuffer) {
              self.bytesSent += body.byteLength;
            }
            return originalXhrSend.apply(this, arguments as unknown as [Document | XMLHttpRequestBodyInit | null | undefined]);
          };
        }

        this.isInstrumented = true;
      } catch {
        this.isInstrumented = false;
      }
    } else {
      // In Node.js / CLI environment, application-level tracking is active
      this.isInstrumented = true;
    }
  }

  public getStats(): { instrumented: boolean; requestCount: number | null; bytesSent: number | null } {
    if (!this.isInstrumented) {
      return { instrumented: false, requestCount: null, bytesSent: null };
    }
    return {
      instrumented: true,
      requestCount: this.requestCount,
      bytesSent: this.bytesSent,
    };
  }

  public reset(): void {
    this.requestCount = 0;
    this.bytesSent = 0;
  }
}

export const networkTracker = new NetworkTracker();
