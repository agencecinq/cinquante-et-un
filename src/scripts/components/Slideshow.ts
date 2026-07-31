import { Piece } from 'piecesjs';

class Slideshow extends Piece {
  $previous!: HTMLElement;
  $next!: HTMLElement;
  $slider!: HTMLElement;
  slides!: HTMLElement[];
  $controls: HTMLElement | null;
  buttons: HTMLButtonElement[] | null;
  resizeObserver!: ResizeObserver;
  offset = 0;
  slidesPerPage = 1;
  totalPages: number = 1;
  currentPage: number = 1;

  constructor() {
    super('Slideshow');
  }

  mount() {
    this.$slider = this.domAttr(`slider-${this.cid}`) as HTMLElement;
    this.slides = this.domAttrAll(`slide-${this.cid}`).filter(
      (element) => (element as HTMLElement).clientWidth > 0,
    ) as HTMLElement[];

    if (!this.$slider) {
      throw new Error('Slider element is required');
    }

    this.$previous = this.domAttr(`previous-${this.cid}`) as HTMLElement;
    this.$next = this.domAttr(`next-${this.cid}`) as HTMLElement;
    this.$controls = this.domAttr(`controls-${this.cid}`) as HTMLElement;

    if (this.$controls) {
      this.buttons = Array.from(this.$controls.querySelectorAll('button'));
    }

    this.on('scroll', this.$slider, this.update.bind(this));

    if (this.$previous) {
      this.on('click', this.$previous, this.handleClick.bind(this));
    }

    if (this.$next) {
      this.on('click', this.$next, this.handleClick.bind(this));
    }

    if (this.buttons) {
      this.buttons.forEach(($button) => this.on('click', $button, this.slideToPage.bind(this)));
    }

    this.resizeObserver = new ResizeObserver(() => this.init());
    this.resizeObserver.observe(this.$slider);

    this.init();
  }

  init() {
    this.slides = Array.from(this.slides).filter(
      (element) => (element as HTMLElement).clientWidth > 0,
    ) as HTMLElement[];

    if (this.slides.length < 2) {
      return;
    }

    this.offset = Math.round(this.slides[1].offsetLeft - this.slides[0].offsetLeft);
    this.slidesPerPage = Math.max(1, Math.round(this.$slider.clientWidth / this.offset));
    this.totalPages = this.slides.length - this.slidesPerPage + 1;

    this.update();
  }

  update() {
    const currentSlide = Math.round(this.$slider.scrollLeft / this.offset);
    this.currentPage = Math.max(1, Math.min(currentSlide + 1, this.totalPages));

    // const progress = ((this.currentPage - 1) / (this.totalPages - 1)) * 100;
    const progress = (this.$slider.scrollLeft / (this.$slider.scrollWidth - this.$slider.clientWidth)) * 100;

    this.style.setProperty('--slides-length', `${this.slides.length}`);
    this.style.setProperty('--progress', `${progress}%`);
    this.style.setProperty('--current-page', this.currentPage.toString());
    this.style.setProperty('--current-slide', (currentSlide + 1).toString());
    this.style.setProperty('--total-pages', this.totalPages.toString());
    this.style.setProperty('--slides-per-page', this.slidesPerPage.toString());
    this.style.setProperty('--offset', this.offset.toString());

    if (this.$previous) {
      if (this.isSlideVisible(this.slides[0]) && this.$slider.scrollLeft === 0) {
        this.$previous.setAttribute('disabled', 'disabled');
      } else {
        this.$previous.removeAttribute('disabled');
      }
    }

    if (this.$next) {
      if (this.isSlideVisible(this.slides[this.slides.length - 1])) {
        this.$next.setAttribute('disabled', 'disabled');
      } else {
        this.$next.removeAttribute('disabled');
      }
    }

    if (this.buttons) {
      this.buttons.forEach(($button) => $button.removeAttribute('aria-current'));
      this.buttons[this.currentPage - 1].setAttribute('aria-current', 'true');
    }
  }

  handleClick(event: Event) {
    this.slideToSlide(event);
  }

  isSlideVisible(element: HTMLElement, offset = 0) {
    const lastVisibleSlide = this.$slider.clientWidth + this.$slider.scrollLeft - offset;
    return (
      element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.$slider.scrollLeft
    );
  }

  slideToSlide(event: Event) {
    const target = event.target as HTMLElement;
    const { dom } = target.dataset;
    let left = 0;


    if (dom === `next-${this.cid}`) {
      left = this.$slider.scrollLeft + this.offset;
    }
    if (dom === `previous-${this.cid}`) {
      left = this.$slider.scrollLeft - this.offset;
    }

    // console.log(dom, left, this.$slider.scrollLeft, this.offset);

    this.$slider.scrollTo({ left, behavior: 'smooth' });
  }

  slideToPage(event: Event) {
    event.preventDefault();

    if (!this.buttons) return;
    const targetIndex = this.buttons.indexOf(event.currentTarget as HTMLButtonElement);
    const left = targetIndex * this.offset * this.slidesPerPage;

    this.$slider.scrollTo({
      left,
      behavior: 'smooth',
    });
  }

  unmount() {
    this.off('scroll', this.$slider, this.update.bind(this));

    if (this.$previous) {
      this.off('click', this.$previous, this.handleClick.bind(this));
    }

    if (this.$next) {
      this.off('click', this.$next, this.handleClick.bind(this));
    }

    if (this.buttons) {
      this.buttons.forEach(($button) => this.off('click', $button, this.slideToPage.bind(this)));
    }

    this.resizeObserver.disconnect();
  }
}

customElements.define('c-slideshow', Slideshow);
