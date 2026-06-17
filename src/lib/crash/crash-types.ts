export type CrashSeverity = 'fatal' | 'error' | 'warning' | 'info';

export type SafeCrashContextKey =
  | 'screenName'
  | 'universeId'
  | 'sagaId'
  | 'chapterId'
  | 'questCategory'
  | 'questSource'
  | 'level'
  | 'feature'
  | 'action'
  | 'reason';

export type CrashContext = Partial<Record<SafeCrashContextKey, string | number | boolean>>;

export interface CrashReporter {
  setCollectionEnabled(enabled: boolean): Promise<void>;
  recordError(error: Error, attributes?: Record<string, string>): Promise<void>;
  log(message: string): Promise<void>;
  setAttribute(name: string, value: string): Promise<void>;
  setAttributes(attributes: Record<string, string>): Promise<void>;
  crash(): Promise<void>;
}
