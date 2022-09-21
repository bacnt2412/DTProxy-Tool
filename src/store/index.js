import Vue from 'vue';
import Vuex from 'vuex';
const Store = require('electron-store');
const store = new Store();

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        headerField: store.get('headerField') ? store.get('headerField') : ['fname', 'address', 'city', 'state'],
    },
    mutations: {
        setHeaderField(state, data) {
            state.headerField = data;
            store.set('headerField', data);
        },
    },
    actions: {
        setHeaderField({ commit }, data) {
            commit('setHeaderField', data);
        },
    },
    modules: {},
});
