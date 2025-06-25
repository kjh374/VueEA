import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import store from './store';
import VueAwesomePaginate from 'vue-awesome-paginate';
import 'vue-awesome-paginate/dist/style.css';
import '@vuepic/vue-datepicker/dist/main.css';
import VueDatePicker from '@vuepic/vue-datepicker';

axios.defaults.baseURL = 'http://localhost:8080';
const app = createApp(App);
app.config.globalProperties.axios = axios;
app.use(store).use(VueAwesomePaginate).mount('#app');