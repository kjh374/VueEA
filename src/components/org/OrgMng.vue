<template>
    <div class="empWrap">
        <EmpMainListVue v-if="showList" @setEmpCd="setEmpCd"/>
        <!-- <EmpDetailVue v-if="showDetail" @setEmpCd="setEmpCd"  :empCd="selectedEmpCd"/> -->
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import EmpFormVue from './EmpForm.vue';
import EmpMainListVue from './EmpMainList.vue';
import EmpDetailVue from './EmpDetail.vue';
import { useStore } from 'vuex';

const store = useStore();

const showList = computed(() => store.state.showList);
const showDetail = computed(() => store.state.showDetail);

const selectedEmpCd = ref(null);

function setEmpCd(empCd) {
    selectedEmpCd.value = empCd;
}
</script>

<style>

</style>