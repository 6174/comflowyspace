import { ModelDownloadChannelEvents } from "../types/model.types";

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

export class SlotEvent<T = void> implements IDisposable {
  private emitting = false;
  private callbacks: ((v: T) => any)[] = [];
  private disposables: IDisposable[] = [];

  static fromEvent<N extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    eventName: N
  ): SlotEvent<HTMLElementEventMap[N]> {
    const slot = new SlotEvent<HTMLElementEventMap[N]>();
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

  filter(testFun: (v: T) => boolean): SlotEvent<T> {
    const result = new SlotEvent<T>();
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

  onEvent(event: string, callback: (v: T) => any): IDisposable {
    return this.on((ev) => {
      if (ev && (ev as any).type === event) {
        callback(ev);
      }
    });
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

  pipe(that: SlotEvent<T>): SlotEvent<T> {
    this.callbacks.push((v) => that.emit(v));
    return this;
  }

  dispose() {
    flattenDisposable(this.disposables).dispose();
    this.callbacks.length = 0;
  }

  toDispose(disposables: IDisposable[]): SlotEvent<T> {
    disposables.push(this);
    return this;
  }
}

export enum GlobalEvents {
  on_select_model = "on_select_model",
  on_close_model_selector = "on_close_model_selector",
  execution_interrupted = "execution_interrupted",
  restart_comfyui = "restart_comfyui",
  restart_comfyui_success = 'restart_comfyui_success',
  initial_launch = "initial_launch",
  comfyui_process_error = "comfyui_process_error",
  show_missing_widgets_modal = "show_missing_widgets_modal",
  install_missing_widget = 'install_missing_widget',
  show_comfyprocess_manager = 'show_comfyprocess_manager',
  open_image_editor = 'open_image_editor',
  active_panel_changed = 'active_panel_changed',
  close_pannels = 'close_pannels',
  open_pannels = 'open_pannels',
  toggle_panel_container = 'toggle_panel_container',
  show_notification_modal = 'show_notification_modal',
  start_comfyui_execute = 'start_comfyui_execute',
  show_execution_error = 'show_execution_error',
  import_workflow = 'import_workflow'
}

export type GlobalEventKeys = (keyof typeof GlobalEvents) | keyof typeof ModelDownloadChannelEvents;

export const SlotGlobalEvent = new SlotEvent<{
  type: GlobalEventKeys,
  data?: any
}>();

