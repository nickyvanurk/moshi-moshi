export default class AudioVisualizer {
  constructor({ parentElem, frequencyBarMaxHeight }) {
    this.parentElem = parentElem;
    this.frequencyBarMaxHeight = frequencyBarMaxHeight;

    this.frequencyBarNum = 64;
    this.frequencyBarWidth = 5;

    this.createFrequencyBars();
  }

  init(stream) {
    this.barElements = document.getElementsByClassName('bar');
    const context = new AudioContext();
    this.analyser = context.createAnalyser();

    const src = context.createMediaStreamSource(stream);
    src.connect(this.analyser);
    this.loop();
  }

  loop() {
    window.requestAnimationFrame(this.loop.bind(this));

    const array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);

    for (let i = 0; i < this.frequencyBarNum; ++i) {
      const height = Math.min(array[i + this.frequencyBarNum] * 0.75,
                              this.frequencyBarMaxHeight);

      this.barElements[i].style.minHeight = height + 'px';
      this.barElements[i].style.opacity = 0.008*height;
    }
  }

  createFrequencyBars() {
    for (let i = 0; i < this.frequencyBarNum; ++i) {
      const frequencyBar = document.createElement('div');
      frequencyBar.className = 'bar';
      frequencyBar.style.minWidth = `${this.frequencyBarWidth}px`;
      this.parentElem.appendChild(frequencyBar);
    }
  }
}
