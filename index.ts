// Import stylesheets
import {
  BehaviorSubject,
  scan,
  switchMapTo,
  takeWhile,
  tap,
  timer,
  last,
  Observable,
  of,
  combineLatest,
} from 'rxjs';
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

export interface UnaryFunction<T, R> {
  (source: T): R;
}
export interface OperatorFunction<T, R>
  extends UnaryFunction<Observable<T>, Observable<R>> {}
export declare type FactoryOrValue<T> = T | (() => T);
export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

export function attemptsGuardFactory(maxAttempts: number) {
  return (attemptsCount: number) => {
    if (attemptsCount > maxAttempts) {
      throw new Error(
        'Exceeded maximum attempts (' + maxAttempts + ') for polling.'
      );
    }
  };
}

const listPollingActive = <T>(res: T[]): boolean => res.length > 0;

export function pollWhile<T>(
  isPollingActive: (res: T) => boolean,
  isListPollingActive: (res: T[]) => boolean = listPollingActive,
  pollInterval = 30000,
  maxAttempts = 30,
  emitOnlyLast = true
): MonoTypeOperatorFunction<T> {
  return (source$) => {
    const poll$ = timer(0, pollInterval).pipe(
      scan((attempts) => ++attempts, 0),
      tap(attemptsGuardFactory(maxAttempts)),
      switchMapTo(source$),
      takeWhile(isPollingActive, true)
    );

    return emitOnlyLast ? poll$.pipe(last()) : poll$;
  };
}

const input = [of({ id: '1' }), of({ id: '2' }, of({ id: '3' }))];

combineLatest(input).pipe(pollWhile());
