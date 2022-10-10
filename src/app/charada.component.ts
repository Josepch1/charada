import {
  Component,
  HostListener,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';

import { WORDS } from './wordlist';

const wordLenght = 5;
const tries = 6;

const letters = (() => {
  const ret: { [key: string]: boolean } = {};
  for (let charCode = 97; charCode < 97 + 26; charCode++) {
    ret[String.fromCharCode(charCode)] = true;
  }
  return ret;
})();

interface Try {
  letters: Letters[];
}

interface Letters {
  text: string;
  state: LetterState;
}

enum LetterState {
  WRONG,
  PARTIAL_MATCH,
  FULL_MATCH,
  PENDING,
}

@Component({
  selector: 'charada',
  templateUrl: './charada.component.html',
  styleUrls: ['./charada.component.css'],
})
export class Charada {
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;

  readonly tries: Try[] = [];

  private palavraCerta = '';

  private currentLetterIndex = 0;

  readonly LetterState = LetterState;

  private submittedTries = 0;

  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
  ];

  message = '';
  fadeOutMessage = false;

  readonly curLetterStates: { [key: string]: LetterState } = {};

  private ganhou = false;

  constructor() {
    for (let i = 0; i < tries; i++) {
      const letters: Letters[] = [];
      for (let j = 0; j < wordLenght; j++) {
        letters.push({ text: '', state: LetterState.PENDING });
      }
      this.tries.push({ letters });
    }

    const numeroPalavras = WORDS.length;
    while (true) {
      const index = Math.floor(Math.random() * numeroPalavras);
      const word = WORDS[index];

      if (word.length === wordLenght) {
        this.palavraCerta = word.toLowerCase();
        break;
      }
    }
    console.log('PALAVRA CERTA: ', this.palavraCerta);
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  getKeyClass(key: string): string {
    const state = this.curLetterStates[key.toLowerCase()];
    switch (state) {
      case LetterState.FULL_MATCH:
        return 'certo';
      case LetterState.PARTIAL_MATCH:
        return 'meio-certo';
      case LetterState.WRONG:
        return 'errado';
      default:
        return 'key';
    }
  }

  public handleClickKey(key: string) {
    if (this.ganhou) {
      return;
    }
    if (letters[key.toLowerCase()]) {
      if (this.currentLetterIndex < (this.submittedTries + 1) * wordLenght) {
        this.setLetter(key.toLowerCase());
        this.currentLetterIndex++;
      }
    } else if (key === 'Backspace') {
      if (this.currentLetterIndex > this.submittedTries * wordLenght) {
        this.currentLetterIndex--;
        this.setLetter('');
      }
    } else if (key === 'Enter') {
      this.checkTry();
    }
  }

  private setLetter(letter: string) {
    const indexTry = Math.floor(this.currentLetterIndex / wordLenght);
    const indexLetter = this.currentLetterIndex - indexTry * wordLenght;
    this.tries[indexTry].letters[indexLetter].text = letter;
  }

  private async checkTry() {
    const currentTryIndex = this.tries[this.submittedTries];
    if (currentTryIndex.letters.some((letter) => letter.text === '')) {
      this.message = 'Digite uma palavra de 5 letras';
      console.log(this.message);
      return;
    }
    const wordFromCurTry = currentTryIndex.letters.map(letter => letter.text).join('');
    if (!WORDS.includes(wordFromCurTry)) {
      this.message = 'Nao é uma palavra da lista';
      console.log(this.message);
      return;
    }
    const states: LetterState[] = [];
    for (let i = 0; i < wordLenght; i++) {
      const expected = this.palavraCerta[i];
      const curLetter = currentTryIndex.letters[i];
      const got = curLetter.text.toLowerCase();
      let state = LetterState.WRONG;

      if (expected === got) {
        state = LetterState.FULL_MATCH;
      } else if (this.palavraCerta.includes(got)) {
        state = LetterState.PARTIAL_MATCH;
      }
      states.push(state);
    }
    console.log(states);

    const tryContainer = this.tryContainers.get(this.submittedTries)
      ?.nativeElement as HTMLElement;
    const letterEles = tryContainer.querySelectorAll('.letter-container');
    for (let i = 0; i < letterEles.length; i++) {
      const curLetterEle = letterEles[i];
      curLetterEle.classList.add('fold');
      currentTryIndex.letters[i].state = states[i];
      curLetterEle.classList.remove('fold');
    }

    for (let i = 0; i < wordLenght; i++) {
      const curLetter = currentTryIndex.letters[i];
      const got = curLetter.text.toLowerCase();
      const curStoredState = this.curLetterStates[got];
      const targetState = states[i];
      if (curStoredState == null || targetState > curStoredState) {
        this.curLetterStates[got] = targetState;
      }
    }

    this.submittedTries++;

    if (states.every((state) => state === LetterState.FULL_MATCH)) {
      this.message = 'Nice';
      console.log(this.message);
      this.ganhou = true;

      return;
    }

    if (this.submittedTries === tries) {
      this.showMessage(this.palavraCerta.toUpperCase(), false);
    }
  }

  public showMessage(message: string, hide = true) {
    this.message = message;

    if (hide) {
      setTimeout(() => {
        this.fadeOutMessage = true;
        setTimeout(() => {
          this.message = '';
          this.fadeOutMessage = false;
        }, 500);
      }, 2000);
    }
  }
}