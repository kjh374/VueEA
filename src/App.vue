<template>
  <Main/>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Main from './components/Main.vue'
export default {
  name: 'App',
  components: {
    Main
  },
  data() {
    return {
      connectData: ''
    }
  },
  methods: {
  },
  mounted() {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  user-select: none;
}
a, a:visited, a:hover, a:active {
    color: #000000; /* 원하는 색상 (예: 기본 파란색) */
    text-decoration: none; /* 밑줄 제거 (선택 사항) */
}
</style>
