<template>
    <ApplicationVue v-if="showForm"/>
    <ApprovalListVue v-if="showList"/>
    <ApprovalDetailVue v-if="showDetail"/>
</template>
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ApplicationVue from './ApplicationForm.vue';
import ApprovalListVue from './ApprovalList.vue';
import ApprovalDetailVue from './ApprovalDetail.vue';

const store = useStore();

const showForm = computed(() => store.state.showForm);
const showList = computed(() => store.state.showList);
const showDetail = computed(() => store.state.showDetail);

</script>
<style>

</style>