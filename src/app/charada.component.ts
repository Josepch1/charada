import { Component, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { WORDS } from './wordlist';

const wordLenght = 5;
const tries = 6;

const letters = (() => {
  const ret: {[key: string]: boolean} = {};
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

  private targetWordLetterCounts: {[letter: string]: number} = {}

  private currentLetterIndex = 0;

  private submittedTries = 0;

  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
  ];

  message = 'Oi'
  fadeOutMessage = false;

  readonly curLetterStates: {[key: string]: LetterState} = {};
  

  constructor(){
    for(let i = 0; i < tries; i++){
      const letters: Letters[] = [];
      for(let j = 0; j < wordLenght; j++){
        letters.push({text: '', state: LetterState.PENDING})
      }
      this.tries.push({letters})
    }

    const numeroPalavras = WORDS.length;
    while(true) {
      const index = Math.floor(Math.random() * numeroPalavras);
      const word = WORDS[index];

      if(word.length === wordLenght) {
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

  private handleClickKey(key: string) {
    if(letters[key.toLowerCase()]) {
      if(this.currentLetterIndex < (this.submittedTries + 1) * wordLenght){
        this.setLetter(key);
        this.currentLetterIndex++;
      }
    }
    else if(key === 'Backspace'){
      if (this.currentLetterIndex > this.submittedTries * wordLenght){
        this.currentLetterIndex--;
        this.setLetter('');
      }
    }
    else if(key === 'Enter'){
      this.checkTry();
    }
  }
  
  private setLetter(letter: string){
    const indexTry = Math.floor(this.currentLetterIndex / wordLenght);
    const indexLetter = this.currentLetterIndex - indexTry * wordLenght;
    this.tries[indexTry].letters[indexLetter].text = letter;
  }

  private async checkTry() {
    const currentTryIndex = this.tries[this.submittedTries];
    if (currentTryIndex.letters.some(letter => letter.text === '')) {
      this.message = 'Digite uma palavra de 5 letras'
      console.log('Digite uma palavra de 5 letras')
      return;
    }

    if (!WORDS.includes(currentTryIndex.letters.map(letter => letter.text).join(''))) {
      this.message = 'Nao é uma palavra da lista'
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
      } else if (
          this.palavraCerta.includes(got)) {
        state = LetterState.PARTIAL_MATCH;
      }
      states.push(state);
    }
    console.log(states);
    
    const tryContainer = this.tryContainers.get(this.submittedTries)?.nativeElement as HTMLElement;

    const letterEles = tryContainer.querySelector('.letter-container')

    for(let i = 0; i < letterEles.length; i++){
      const curLetterEle = letterEles[i];
      curLetterEle.classList.add('fold');
      // Wait for the fold animation to finish.
      await this.wait(180);
      // Update state. This will also update styles.
      currentTryIndex.letters[i].state = states[i];
      // Unfold.
      curLetterEle.classList.remove('fold');
      await this.wait(180);
    }
  }

  public showMessage(message: string){
    this.message = message
    
      setTimeout(() => {
        this.fadeOutMessage = true
        setTimeout(() => {
          this.message = ''
          this.fadeOutMessage = false
        }, 500)
      }, 2000);
    }
  
    private async wait(ms: number) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      })
    }

}
