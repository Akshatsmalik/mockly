# rate_limiter.py
import time
import threading
from collections import deque

class RateLimiter:
    """
    Token-bucket rate limiter supporting both requests/min and tokens/min.
    Thread-safe — safe to use across parallel LangChain chains.
    """

    def __init__(self, requests_per_min: int, tokens_per_min: int, provider: str = ""):
        self.rpm = requests_per_min
        self.tpm = tokens_per_min
        self.provider = provider

        # Sliding window queues: store timestamps of recent requests/token events
        self._req_times: deque = deque()
        self._token_events: deque = deque()  # (timestamp, token_count)
        self._lock = threading.Lock()

    def _purge_old(self, window: float = 60.0):
        """Remove entries older than the sliding window."""
        cutoff = time.monotonic() - window
        while self._req_times and self._req_times[0] < cutoff:
            self._req_times.popleft()
        while self._token_events and self._token_events[0][0] < cutoff:
            self._token_events.popleft()

    def _current_token_usage(self) -> int:
        return sum(t for _, t in self._token_events)

    def wait_if_needed(self, estimated_tokens: int = 500):
        """
        Call BEFORE each LLM call.
        Blocks until both request-rate and token-rate limits allow proceeding.
        """
        while True:
            with self._lock:
                self._purge_old()
                req_count = len(self._req_times)
                tok_count = self._current_token_usage()

                req_ok  = req_count  < self.rpm
                tok_ok  = tok_count + estimated_tokens <= self.tpm

                if req_ok and tok_ok:
                    now = time.monotonic()
                    self._req_times.append(now)
                    self._token_events.append((now, estimated_tokens))  # placeholder
                    return  # ✅ proceed

                # Calculate sleep needed
                sleep_for = 0.5  # default small retry
                if not req_ok and self._req_times:
                    sleep_for = max(sleep_for, 60.0 - (time.monotonic() - self._req_times[0]) + 0.1)
                if not tok_ok and self._token_events:
                    sleep_for = max(sleep_for, 60.0 - (time.monotonic() - self._token_events[0][0]) + 0.1)

            print(f"[RateLimiter:{self.provider}] Limit hit (reqs={req_count}/{self.rpm}, "
                  f"tokens~{tok_count}/{self.tpm}). Sleeping {sleep_for:.1f}s...")
            time.sleep(sleep_for)

    def record_actual_tokens(self, actual_tokens: int, estimated_tokens: int = 500):
        """
        Call AFTER the LLM returns, with the real token count from UsageMetadataCallback.
        Corrects the placeholder we added in wait_if_needed.
        """
        with self._lock:
            # Replace the most recent placeholder estimate with the real value
            now = time.monotonic()
            if self._token_events:
                ts, _ = self._token_events[-1]
                self._token_events[-1] = (ts, actual_tokens)