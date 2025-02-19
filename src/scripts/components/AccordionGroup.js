import { Piece } from 'piecesjs';
import A from '@19h47/accordion';

class AccordionGroup extends Piece {
  constructor() {
    super('Accordion');
  }

  mount() {
    this.accordion = new A(this);
    this.accordion.init();
  }
}

customElements.define('c-accordion-group', AccordionGroup);
