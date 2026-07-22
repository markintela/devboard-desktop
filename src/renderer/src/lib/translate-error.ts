import type { AppError } from "@/lib/types";
import type { TFunction } from "@/lib/i18n/context";

export function translateAppError(t: TFunction, error: AppError): string {
  return t(dict => dict.errors[error.code], error.params);
}
