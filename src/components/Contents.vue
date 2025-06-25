<template>
    <LoginVue v-if="!isLoggedIn" @login-success="handleLoginSuccess"/>
    <div v-else class="container">
        <div>
            <OrgMngVue v-if="showOrgMng"/>
            <DocApproval v-if="showDocApproval"/>
            <LeaveMngVue v-if="showLeaveMng"/>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LoginVue from './login/Login.vue'
import OrgMngVue from './org/OrgMng.vue';
import { useStore } from 'vuex'
import LeaveMngVue from './leave/LeaveMng.vue'
import DocApproval from './approval/DocApproval.vue'

const store = useStore();
const props = defineProps({
    'menu' : String
})
const isLoggedIn = computed(() => store.state.isLoggedIn);
const showOrgMng = computed(() => store.state.showOrgMng);
const showLeaveMng = computed(() => store.state.showLeaveMng);
const showDocApproval = computed(() => store.state.showDocApproval);
const componentMap = {
    orgMng: OrgMngVue,
    leaveMng: LeaveMngVue,
}
const activeComponent = computed(() => {
    const activeKey = store.state.activeComponent;
    return componentMap[activeKey] || null;
})
function handleLoginSuccess() {
        isLoggedIn.value = true;
        // showApplication.value = true;
    }
</script>
<style scoped>
.container {
    display: grid;
    flex: 1;
}
.subHeader {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid gainsboro;
    padding-bottom: 5px;
    font-size: 12px;
    align-items: baseline;
}
</style>