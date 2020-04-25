import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Vue axios
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

// import L from 'leaflet'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
