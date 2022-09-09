import { Component, HostListener } from '@angular/core';
import { timeout } from 'rxjs';
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
  readonly tries: Try[] = [];

  msg = '';
  fadeOutInfoMsg = false;

  private palavraCerta = '';

  private currentLetterIndex = 0;

  private submittedTries = 0;

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

  private checkTry() {
    const currentTryIndex = this.tries[this.submittedTries];
    if (currentTryIndex.letters.some(letter => letter.text === '')) {
      return;
    }
    ///const palavraUsadaCurrentTry = currentTryIndex.letters.map(letter => letter.text).join('').toUpperCase;
    ///if(!WORDS.includes(palavraUsadaCurrentTry)){
    ///  return;
    ///}
  }

  private showMsg(msg: string) {
    this.msg = msg;

    setTimeout(() => {
      this.fadeOutInfoMsg = true;
      setTimeout(() => {
        this.msg = '';
        this.fadeOutInfoMsg = false;
      }, 500);
    }, 3000);
  }

  private setLetter(letter: string){
    const indexTry = Math.floor(this.currentLetterIndex / wordLenght);
    const indexLetter = this.currentLetterIndex - indexTry * wordLenght;
    this.tries[indexTry].letters[indexLetter].text = letter;
  }


}
