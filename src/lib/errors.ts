export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationFailedError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('ValidationFailed', message, details);
  }
}

export class EntityNotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('EntityNotFound', message, details);
  }
}

export class DuplicateEntityError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DuplicateEntity', message, details);
  }
}

export class RelationshipNotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('RelationshipNotFound', message, details);
  }
}

export class AmbiguousEntityError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AmbiguousEntity', message, details);
  }
}

export class InvalidFieldError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('InvalidField', message, details);
  }
}
