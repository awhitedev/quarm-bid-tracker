// store.js
import { createStore } from "vuex";

export default createStore({
  state: {
    appSettings: {}
  },
  getters: {
    getSettings(state) {
      return state.appSettings || {};
    }
  },
  mutations: {
    updateSettings(state, settings) {
      state.appSettings = settings;
    }
  }
});
