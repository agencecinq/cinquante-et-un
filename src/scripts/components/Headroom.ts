import { Piece } from 'piecesjs';

class Headroom extends Piece {
  private ticking: boolean;
  private lastScrollY: number;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    super('Headroom');

    this.ticking = false;
    this.lastScrollY = window.scrollY;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);
    this.updateHeaderHeight = this.updateHeaderHeight.bind(this);
  }

  mount(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);

    this.resizeObserver = new ResizeObserver(this.updateHeaderHeight);
    this.resizeObserver.observe(this);

    this.updateHeaderHeight();
    this.update();
  }

  /**
   * Measure the floating header chrome so page content can clear it.
   */
  updateHeaderHeight(): void {
    const header = this.querySelector('header');
    const styles = getComputedStyle(this);
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const height = paddingTop + (header?.getBoundingClientRect().height ?? 0);

    document.documentElement.style.setProperty('--header-height', `${height}px`);
  }

  /**
   * Update headroom state
   *
   * @returns {void}
   */
  update(): void {
    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const innerHeight = window.innerHeight;

    document.documentElement.classList.toggle('is-on-top', scrollY === 0);
    document.documentElement.classList.toggle('is-on-bottom', scrollY + innerHeight >= scrollHeight - 1);

    if (scrollY > this.lastScrollY) {
      document.documentElement.classList.add('scroll-to-bottom');
    } else if (scrollY < this.lastScrollY) {
      document.documentElement.classList.add('scroll-to-top');
      document.documentElement.classList.remove('scroll-to-bottom');
    }

    this.lastScrollY = scrollY;
    this.ticking = false;
  }

  onResize(): void {
    this.updateHeaderHeight();
    this.update();
  }

  onScroll(): void {
    if (!this.ticking) {
      window.requestAnimationFrame(this.update);
      this.ticking = true;
    }
  }

  unmount(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}

customElements.define('c-headroom', Headroom);
