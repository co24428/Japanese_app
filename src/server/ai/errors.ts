import { ApiError } from "../api";

/**
 * An AI failure with a message that is safe and useful to show to the user.
 * It extends ApiError, so API routes do not need to catch it: the `api()`
 * wrapper turns it into a JSON error response with the given status.
 */
export class AiError extends ApiError {
  constructor(message: string, status = 502) {
    super(status, message);
  }
}
