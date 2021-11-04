const captureStackTrace = (target: object, constructorOpt?: Function): void => {
  if (!Error.captureStackTrace) return;
  Error.captureStackTrace(target, constructorOpt);
};

export class FaceParsingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    captureStackTrace(this, this.constructor);
  }
}

export class ColorParsingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    captureStackTrace(this, this.constructor);
  }
}
