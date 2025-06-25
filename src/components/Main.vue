<template>
    <div v-if="!isLoggedIn" class="loginWrap">
        <LoginVue   @login-success="handleLoginSuccess"/>
    </div>
    <div v-else>
        <HeaderVue />
        <div class="body">
            <div v-if="isLoggedIn && showSidebar" class="sidebar">
                <SidebarVue />
            </div>
            <div class="contents">
                <ContentsVue />
            </div>
        </div>
        <FooterVue/>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ContentsVue from './Contents.vue'
import FooterVue from './Footer.vue'
import HeaderVue from './Header.vue'
import SidebarVue from './Sidebar.vue'
import LoginVue from './login/Login.vue'

export default {
    components: { LoginVue, HeaderVue, SidebarVue, ContentsVue, FooterVue },
    data() {
    },
    computed: {
        // this.isLoggedIn = this.$store.state.isLoggedIn;
        // return this.$store.state.showSidebar;
        ...mapState(['isLoggedIn','showSidebar'])
    },
}
</script>

<style scoped>
.body {
    display: flex;
    margin: 0 40px;
    justify-content: center;
}
.sidebar {
    width: 3000 px;
    border: 1px;
}
.contents {
    flex: 1;
    border: 1px;
}
.loginWrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 1400px;
    margin: 100px auto;
}

</style>