/**
 * Sliding-window rate limiter for client-side request throttling.
 */
export class RateLimiter {
  private readonly timestamps: number[] = [];

  /**
   * @param maxRequests - Max requests allowed per window
   * @param windowMs - Window size in milliseconds
   */
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  /**
   * @returns True if a new request is allowed now
   */
  isAllowed(): boolean {
    const now = Date.now();
    this.prune(now);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }

  /**
   * @returns Milliseconds until a request may be allowed (0 if allowed now)
   */
  waitTime(): number {
    const now = Date.now();
    this.prune(now);
    if (this.timestamps.length < this.maxRequests) return 0;
    const oldest = this.timestamps[0]!;
    return Math.max(0, oldest + this.windowMs - now);
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0]! <= cutoff) {
      this.timestamps.shift();
    }
  }
}
