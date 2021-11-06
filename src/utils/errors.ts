const captureStackTrace = (target: object, constructorOpt?: Function): void => {
  if (!Error.captureStackTrace) return;
  Error.captureStackTrace(target, constructorOpt);
};

class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    captureStackTrace(this, this.constructor);
  }
}

export class FaceParsingException extends GenericError {}

export class ColorParsingException extends GenericError {}

export class SolutionGenerationError extends GenericError {}
