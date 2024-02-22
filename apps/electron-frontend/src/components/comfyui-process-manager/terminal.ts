import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { ImageAddon } from "xterm-addon-image";
import { SearchAddon } from "xterm-addon-search";
import { SerializeAddon } from "xterm-addon-serialize";
import { Unicode11Addon } from "xterm-addon-unicode11";

export class ComflowyTerminal {
  term: Terminal;
  _fitAddon: FitAddon;
  execute: (command: string) => void;
  _input = 0;
  constructor(execute: (command: string) => void) {
    this.execute = execute;
    const term = this.term = new Terminal();
    this.term.onKey((e) => this._onKeyHandler(e));
    this.term.onData((e) => this._onDataHandler(e));

    const fitAddon = this._fitAddon = new FitAddon();
    const imageAddon = new ImageAddon();
    const searchAddon = new SearchAddon();
    const serializeAddon = new SerializeAddon();
    const unicode11Addon = new Unicode11Addon();
    term.loadAddon(fitAddon);
    term.loadAddon(imageAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(serializeAddon);
  }

  open(element: HTMLElement) {
    this.term.open(element);
    this.fit();
  }

  fit() {
    this._fitAddon.fit();
  }

  write(message: string) {
    this.term.write(message);
  }

  _onKeyHandler(e: { key: string; domEvent: KeyboardEvent }) {
    const printable: boolean = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;

    if (e.domEvent.key === 'Enter') {
      this._enter();
    } else if (e.domEvent.key === 'Backspace') {
      this._backSpace();
    } else if (e.domEvent.key === 'ArrowRight') {
      this._moveRight();
    } else if (e.domEvent.key === 'ArrowLeft') {
      this._moveLeft();
    } else if (printable) {
      this._input++;
    }
  }

  _onDataHandler(e: string) {
    this.execute(e);
  }

  _enter() {
    this._input = 0;
  }

  _backSpace() {
    if (this.term.buffer.active.cursorX >= 10) {
      this.term.write('\x1B[0J');
      this._input--;
    }
  }

  _moveRight() {
    const isEnd: boolean = this.term.buffer.active.cursorX - 10 <= this._input;
    if (!isEnd) {
      this.term.write('\x1B[C');
    }
  }

  _moveLeft() {
    const isStart: boolean = this.term.buffer.active.cursorX >= 10;
    if (!isStart) {
      this.term.write('\x1B[D');
    }
  }
}