import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class ErrorsService {
  error_messages: EventEmitter<string> = new EventEmitter();

  constructor() {}

  fireErrorMessage(message: string): void {
    this.error_messages.emit(message);
  }
}
