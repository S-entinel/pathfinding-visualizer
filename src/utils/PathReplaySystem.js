class PathReplaySystem {
    constructor(initialState, updateCallback) {
      this.states = [initialState];
      this.currentIndex = 0;
      this.updateCallback = updateCallback;
    }
  
    recordState(state) {
      this.states.push(structuredClone(state));
    }
  
    async replay(speed = 1) {
      for (let i = 0; i <= this.states.length - 1; i++) {
        this.currentIndex = i;
        this.updateCallback(this.states[i]);
        await new Promise(resolve => setTimeout(resolve, 50 / speed));
      }
    }
  
    jumpTo(index) {
      this.currentIndex = Math.min(Math.max(0, index), this.states.length - 1);
      this.updateCallback(this.states[this.currentIndex]);
    }
  
    getCurrentState() {
      return this.states[this.currentIndex];
    }
  
    clear() {
      this.states = [this.states[0]];
      this.currentIndex = 0;
    }
  }