import Vue from 'vue'
import App from './App.vue'
import './assets/sass/draggable.scss'
import '@bboysokol/vue-drag-n-drop'

Vue.config.productionTip = false

new Vue({
	render: function(h) {
		return h(App)
	},
}).$mount('#app')