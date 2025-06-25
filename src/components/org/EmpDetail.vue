<template>
  <div class="emp-detail-modal">
    <div class="header">
      <div class="category">
        <span class="title">사원 정보</span>
      </div>
    </div>
    <div v-if="isLoading" class="loading">로딩 중...</div>
    <div v-else class="infoArea">
      <div class="info-card">
        <div class="info-row profile">
          <img :src="emp.previewUrl || defaultImg" class="profile-img" >
        </div>
        <div class="info-row">
          <label>이름</label>
          <span>{{ emp.empNm || '-' }}</span>
        </div>
        <div class="info-row">
          <label>로그인 ID</label>
          <span>{{ emp.loginId || '-' }}</span>
        </div>
        <div class="info-row">
          <label>부서</label>
          <span>{{ emp.dptNm || '-' }}</span>
        </div>
        <div class="info-row">
          <label>직급</label>
          <span>{{ emp.pstnNm || '-' }}</span>
        </div>
        <div class="info-row">
          <label>연락처</label>
          <span>{{ formatPhnNo(emp.phnNo) || '-' }}</span>
        </div>
        <div class="info-row">
          <label>생년월일</label>
          <span>{{ emp.birthDate || '-' }}</span>
        </div>
        <div class="info-row">
          <label>입사일</label>
          <span>{{ emp.hireDate || '-' }}</span>
        </div>
      </div>
    </div>
    <div class="btnArea">
        <button class="btn-primary" @click="openForm(emp.empCd)" aria-label="사원 수정">
            수정
        </button>
        <button v-if="emp.active" class="btn-danger" @click="deleteEmp" aria-label="퇴사">
            퇴사
        </button>
        <button class="btn-secondary" @click="closeDetail" aria-label="목록으로 돌아가기">
            닫기
        </button>
    </div>
  </div>    
</template>

<script setup>
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import defaultImg from '@/assets/default.png';

const store = useStore();
const emit = defineEmits(['openForm', 'closeDetail']);
const selectedEmpCd = computed(() => store.state.selectedEmpCd);
const isLoading = ref(false);

const emp = reactive({
  empCd: '',
  empNm: '',
  loginId: '',
  dptNm: '',
  pstnNm: '',
  phnNo: '',
  birthDate: '',
  previewUrl: '',
  active: true
});

onMounted(() => {
  fetchEmpDetail();
});

function openForm(empCd) {
    store.commit('setSelectedEmpCd', empCd);
    store.commit('setOpenOrgDetailModal', false);
    store.commit('setOpenOrgFormModal', true);
}

function closeDetail() {
    store.commit('setSelectedEmpCd', '');
    store.commit('setOpenOrgDetailModal', false);
}

function fetchEmpDetail() {
  if (!selectedEmpCd.value) return;
  isLoading.value = true;
  axios
    .get(`/emp/detail/${selectedEmpCd.value}`)
    .then((res) => {
      console.log('사원 상세 응답:', res.data);
      Object.assign(emp, res.data);
    })
    .catch((error) => {
      console.error('상세 조회 실패:', error);
      alert('사원 정보를 불러오지 못했습니다.');
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function formatPhnNo(phnNo) {
  if (phnNo) {
    if (phnNo.length === 11) {
      return `${phnNo.slice(0, 3)}-${phnNo.slice(3, 7)}-${phnNo.slice(7)}`;
    } else if (phnNo.length === 10) {
      return `${phnNo.slice(0, 3)}-${phnNo.slice(3, 6)}-${phnNo.slice(6)}`;
    } else {
      return phnNo;
    }
  }
  return '-';
}

function deleteEmp() {
  if (window.confirm('정말 퇴사 처리하시겠습니까?')) {
    axios
      .delete(`/emp/${selectedEmpCd.value}`)
      .then(() => {
        alert('정상적으로 퇴사 처리되었습니다.');
        closeDetail();
      })
      .catch((error) => {
        console.error('삭제 실패:', error);
        alert(`삭제 실패: ${error.response?.data?.message || '서버 오류'}`);
      });
  }
}
</script>

<style scoped>
.emp-detail-modal {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.category span:first-child {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  letter-spacing: -0.2px;
}

.category .title {
  vertical-align: text-bottom;
  font-size: 16px;
  font-weight: 400;
  color: #6c757d;
}

.btnArea {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

.btn-primary,
.btn-danger,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
}

.btn-danger:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #fff;
  color: #495057;
  border: 1px solid #d1d3e2;
}

.btn-secondary:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.infoArea {
  padding: 10px 0;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row label {
  flex: 0 0 100px;
  font-size: 13px;
  font-weight: 600;
  color: #343a40;
  padding-right: 15px;
}

.info-row span {
  flex: 1;
  font-size: 13px;
  color: #495057;
}

.loading {
  text-align: center;
  padding: 15px;
  color: #6c757d;
  font-size: 14px;
}

.profile {
  justify-content: center;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
}

@media (max-width: 768px) {
  .emp-detail-modal {
    padding: 15px;
    max-width: 90vw;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btnArea {
    width: 100%;
    flex-direction: column;
    gap: 6px;
  }

  .btn-primary,
  .btn-danger,
  .btn-secondary {
    width: 100%;
    padding: 10px;
    font-size: 13px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 0;
  }

  .info-row label {
    text-align: left;
    padding-right: 0;
    flex: none;
    font-size: 12px;
  }

  .info-row span {
    font-size: 12px;
  }
}
</style>