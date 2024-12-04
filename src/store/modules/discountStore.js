export default {
    state: {
      cards: []
    },
    mutations: {
      setCards(state, cards) {
        state.cards = cards;
      }
    },
    actions: {
      async fetchCards({ commit }) {
        try {
          const response = await fetch('./StoreInfo.json');
          const data = await response.json();
          commit('setCards', data.stores);
        } catch (error) {
          console.error('Error fetching cards:', error);
        }
      }
    },
    getters: {
      getCardById: (state) => (id) => {
        return state.cards.find(card => card.id === id);
      }
    }
  };