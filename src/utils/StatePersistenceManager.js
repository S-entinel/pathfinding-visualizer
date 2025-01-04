class StatePersistenceManager {
  constructor() {
    this.storageKey = 'pathfinder_state';
  }

  saveState(state) {
    const serializedState = this.serializeState(state);
    localStorage.setItem(this.storageKey, serializedState);
  }

  loadState() {
    const serializedState = localStorage.getItem(this.storageKey);
    return serializedState ? this.deserializeState(serializedState) : null;
  }

  exportState(state) {
    const serializedState = this.serializeState(state);
    const blob = new Blob([serializedState], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  async importState(file) {
    try {
      const text = await file.text();
      return this.deserializeState(text);
    } catch (error) {
      console.error('State import failed:', error);
      return null;
    }
  }

  // Helper methods without 'private' modifier
  serializeState(state) {
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      grid: state.grid,
      settings: state.settings,
      metrics: state.metrics
    });
  }

  deserializeState(serializedState) {
    const state = JSON.parse(serializedState);
    if (state.version !== '1.0') {
      throw new Error('Incompatible state version');
    }
    return state;
  }
}