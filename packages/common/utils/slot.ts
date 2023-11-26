
export interface IDisposable {
  dispose(): void;
}

export function flattenDisposable(a: IDisposable[]): IDisposable {
  return {
    dispose: () => {
      a.forEach(d => {
        try {
          d.dispose();
        } catch (err) {
          console.error(err);
        }
      });
      a.length = 0;
    }
  };
}


export class Slot<T = void> implements IDisposable {
  private emitting = false;
  private callbacks: ((v: T) => any)[] = [];
  private disposables: IDisposable[] = [];

  static fromEvent<N extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    eventName: N
  ): Slot<HTMLElementEventMap[N]> {
    const slot = new Slot<HTMLElementEventMap[N]>();
    const handler = (ev: HTMLElementEventMap[N]) => {
      slot.emit(ev);
    };
    element.addEventListener(eventName, handler);
    slot.disposables.push({
      dispose: () => {
        element.removeEventListener(eventName, handler);
      },
    });
    return slot;
  }

  filter(testFun: (v: T) => boolean): Slot<T> {
    const result = new Slot<T>();
    // if the result disposed, dispose this too.
    result.disposables.push({ dispose: () => this.dispose() });

    this.on((v: T) => {
      if (testFun(v)) {
        result.emit(v);
      }
    });

    return result;
  }

  on(callback: (v: T) => any): IDisposable {
    if (this.emitting) {
      const newCallback = [...this.callbacks, callback];
      this.callbacks = newCallback;
    } else {
      this.callbacks.push(callback);
    }
    return {
      dispose: () => {
        if (this.emitting) {
          this.callbacks = this.callbacks.filter((v) => v !== callback);
        } else {
          const index = this.callbacks.indexOf(callback);
          if (index > -1) {
            this.callbacks.splice(index, 1); // 2nd parameter means remove one item only
          }
        }
      },
    };
  }

  unshift(callback: (v: T) => any): IDisposable {
    if (this.emitting) {
      const newCallback = [callback, ...this.callbacks];
      this.callbacks = newCallback;
    } else {
      this.callbacks.unshift(callback);
    }
    return {
      dispose: () => {
        if (this.emitting) {
          this.callbacks = this.callbacks.filter((v) => v !== callback);
        } else {
          const index = this.callbacks.indexOf(callback);
          if (index > -1) {
            this.callbacks.splice(index, 1); // 2nd parameter means remove one item only
          }
        }
      },
    };
  }

  emit(v: T) {
    const prevEmitting = this.emitting;
    this.emitting = true;
    this.callbacks.forEach((f) => {
      try {
        f(v);
      } catch (err) {
        console.error(err);
      }
    });
    this.emitting = prevEmitting;
  }

  pipe(that: Slot<T>): Slot<T> {
    this.callbacks.push((v) => that.emit(v));
    return this;
  }

  dispose() {
    flattenDisposable(this.disposables).dispose();
    this.callbacks.length = 0;
  }

  toDispose(disposables: IDisposable[]): Slot<T> {
    disposables.push(this);
    return this;
  }
}

export const GlobalSlot = new Slot<{
  type: string,
  data: any
}>();
