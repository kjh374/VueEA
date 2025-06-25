<template>
    <div class="leaveWrap">
        <LeaveListVue v-if="showList" @openForm="openForm" @openDetail="openDetail"/>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LeaveListVue from './LeaveList.vue';

const showList = ref(true);
const showForm = ref(false);
const showDetail = ref(false);

const selectedEmpCd = ref(null);

function openForm(empCd) {
    showForm.value = true;
    showList.value = false;
    showDetail.value = false;
    selectedEmpCd.value = empCd;
}

function openDetail(empCd) {
    console.log('openDetail', empCd);
    showDetail.value = true;
    showList.value = false;
    selectedEmpCd.value = empCd;
}

function saved() {
    console.log('saved');
    showForm.value = false;
    showList.value = true;
}

function cancelForm(empCd) {
    console.log('closed', empCd);
    if(!empCd) {
        console.log('111')
        showForm.value = false;
        showList.value = true;
    } else {
        console.log('222')
        showForm.value = false;
        showDetail.value = true;
        selectedEmpCd.value = empCd;
    }
}

function closeDetail() {
    console.log('closed');
    showDetail.value = false;
    showList.value = true;
}
</script>

<style>

</style>