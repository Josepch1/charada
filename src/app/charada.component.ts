import { Component, HostListener } from '@angular/core';

const wordLenght = 5;
const tries = 6;

const letters = (() => {
  const ret: {[key: string]:boolean} = {}

  //for(let )
});

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

  constructor(){
    for(let i = 0; i < tries; i++){
      const letters: Letters[] = [];
      for(let j = 0; j < wordLenght; j++){
        letters.push({text: '', state: LetterState.PENDING})
      }
      this.tries.push({letters})
    }
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  private handleClickKey(key: string) {

  }
}
