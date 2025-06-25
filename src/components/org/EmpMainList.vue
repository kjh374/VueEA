<template>
  <div class="emp-container">
    <div class="header">
      <div class="count-area">
        <div class="category">
          <span>인사관리</span>
          <span class="title">사원 목록</span>
        </div>
        <div class="count" :class="{ 'status-total': true }">
            <span><i class="icon-total"></i> 조회 결과: {{ totalItems }} 건</span>
        </div>
      </div>
      <div class="filter-area">
          <div class="filter-group">
              <label for="dpt-select">부서</label>
              <select v-model="dptCd" id="dpt-select" aria-label="부서 선택">
                  <option value="">전체</option>
                  <option value="1000">SI사업부</option>
                  <option value="2000">기술연구소</option>
                  <option value="3000">경영기획실</option>
                  <option value="4000">프리랜서</option>
                  <option value="5000">계약직</option>
              </select>
          </div>
          <div class="filter-group">
              <label for="pstn-select">직급</label>
              <select v-model="pstnCd" id="pstn-select" aria-label="직급 선택">
                  <option value="">전체</option>
                  <option value="1000">대표</option>
                  <option value="2000">상무</option>
                  <option value="3000">부장</option>
                  <option value="4000">차장</option>
                  <option value="5000">과장</option>
                  <option value="6000">대리</option>
                  <option value="7000">사원</option>
              </select>
          </div>
          <div class="search-area">
              <img src="@/assets/search.svg" alt="검색 아이콘" class="search-icon" />
              <input 
                  v-model="searchValue"
                  @input="handleInput" 
                  type="text" 
                  placeholder="이름 검색..." 
                  aria-label="이름 검색" 
              />
          </div>
      </div>
      <div class="addBtn">
        <button
          @click="openEmpForm"
          class="btn-primary"
          aria-label="사원 등록"
        >
          등록
        </button>
      </div>
    </div>
    <div class="table-container">
      <table role="grid" aria-describedby="emp-table-desc">
        <caption id="emp-table-desc" class="sr-only">
          사원 목록 테이블
        </caption>
        <thead>
          <tr>
            <th width="5%" scope="col">No.</th>
            <th width="10%" scope="col">부서</th>
            <th width="10%" scope="col">직급</th>
            <th width="10%" scope="col">이름</th>
            <th width="20%" scope="col">연락처</th>
            <th width="10%" scope="col">입사일</th>
            <th width="10%" scope="col">퇴사일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="empList.length === 0">
            <td colspan="7" class="no-data">등록된 사원이 없습니다.</td>
          </tr>
          <tr
            v-for="(emp, index) in paginatedData"
            :key="emp.empCd"
            class="clickable-row"
            @click="openDetail(emp.empCd)"
          >
            <td>{{ totalItems - (currentPage - 1) * itemsPerPage - index }}</td>
            <td>{{ emp.dptNm }}</td>
            <td>{{ emp.pstnNm }}</td>
            <td>{{ emp.empNm }}</td>
            <td>{{ formatPhnNo(emp.phnNo) }}</td>
            <td>{{ emp.hireDate }}</td>
            <td>{{ emp.retireDate || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <VueAwesomePaginate
        v-model="currentPage"
        :total-items="empList.length"
        :items-per-page="itemsPerPage"
        :show-jump-buttons="true"
        class="pagination"
        aria-label="페이지네이션"
      />
    </div>
  </div>
  <div class="modal-overlay" v-if="openOrgFormModal">
    <div class="form-modal" @click.stop>
      <div>
          <EmpFormVue @saved="handleSaved" @edited="handleEdited"/>
      </div>
    </div>
  </div>
  <div class="modal-overlay" v-if="openOrgDetailModal">
    <div class="form-modal" @click.stop>
      <EmpDetailVue />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import EmpFormVue from "./EmpForm.vue";
import EmpDetailVue from "./EmpDetail.vue";
const emit = defineEmits(['openForm', 'openDetail']);
const store = useStore();
const empList = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = ref(0);

const searchValue = ref('');
const dptCd = ref('');
const pstnCd = ref('');
const empCd = computed(() => store.state.selectedEmpCd)

const openOrgFormModal = computed(() => store.state.openOrgFormModal);
const openOrgDetailModal = computed(() => store.state.openOrgDetailModal);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return empList.value.slice(start, end);
});

function handleInput(event) {
  searchValue.value = event.target.value.trim();
}

function openEmpForm() {
  store.commit('setOpenOrgFormModal', true);
}

function openDetail(selectedEmpCd) {
  store.commit('setSelectedEmpCd', selectedEmpCd);
  store.commit('setOpenOrgDetailModal', true);
}

function formatPhnNo(phnNo) {
  if (phnNo) {
    if (phnNo.length === 11) {
      return phnNo.slice(0, 3) + '-' + phnNo.slice(3, 7) + '-' + phnNo.slice(7);
    } else if (phnNo.length === 10) {
      return phnNo.slice(0, 3) + '-' + phnNo.slice(3, 6) + '-' + phnNo.slice(6);
    } else {
      return phnNo.slice(0, 2) + '-' + phnNo.slice(2, 6) + '-' + phnNo.slice(6);
    }
  }
  return '';
}

function handleSaved() {
  alert('정상적으로 등록되었습니다.');
  fetchEmpList();
}
function handleEdited() {
  alert('정상적으로 수정되었습니다.');
  store.commit('setOpenOrgDetailModal', true);
}

onMounted(() => {
  fetchEmpList();
});

watch(
  () => [searchValue.value, dptCd.value, pstnCd.value, empCd.value],
  () => fetchEmpList()
)

function fetchEmpList() {
  axios.get('/emp/list',{
    params: {
      searchValue: searchValue.value,
      dptCd: dptCd.value,
      pstnCd: pstnCd.value
    }
  }).then((res) => {
    empList.value = res.data.list || res.data;
    totalItems.value = empList.value.length;
    console.log(empList);
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 모달이 다른 요소 위에 표시되도록 */
}

/* 모달 콘텐츠 */
.form-modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  max-width: 600px; /* 모달 최대 너비 */
  max-height: 90vh; /* 모달 최대 높이 */
  overflow-y: auto; /* 내용이 길 경우 스크롤 */
}

.emp-container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa; /* 전자결재 배경 */
  padding: 20px;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.count-area {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
}

.count {
    padding: 8px 12px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #e1e3e8;
    font-size: 14px;
    color: #495057;
}

.category span:first-child {
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
  letter-spacing: -0.2px;
}

.category .title {
  vertical-align: text-bottom;
  font-size: 18px;
  font-weight: 400;
  color: #6c757d;
  position: relative;
  padding-left: 16px;
}

.filter-area {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    margin-left: auto;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-group span {
    font-size: 14px;
    color: #495057;
}

.filter-group select {
    padding: 8px;
    border: 1px solid #d1d3e2;
    border-radius: 6px;
    font-size: 14px;
    background-color: #fff;
    cursor: pointer;
    transition: border-color 0.2s;
}

.filter-group select:focus {
    outline: none;
    border-color: #007bff;
}

.search-area {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #d1d3e2;
    border-radius: 6px;
    padding: 7px 10px;
    width: 250px;
    margin-left: auto;
}

.search-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

.search-area input {
    border: none;
    outline: none;
    font-size: 14px;
    width: 100%;
    background: transparent;
}

.addBtn {
    margin-right: 20px;
}

.btn-primary {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #6B7280; /* 전자결재 블루 */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
    background-color: #343a40;
}

.btn-detail {
  padding: 6px 12px;
  font-size: 14px;
  color: #495057;
  background: #fff;
  border: 1px solid #d1d3e2;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-detail:hover {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.table-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  background-color: #f1f3f5;
  padding: 12px;
  text-align: center;
  color: #343a40;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

tr:hover {
  background-color: #f8f9fa;
}

.clickable-row {
    cursor: pointer;
    transition: background 0.2s ease;
}

.no-data {
  padding: 20px;
  color: #6c757d;
  font-size: 15px;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.paginate-buttons) {
  display: flex;
  gap: 5px;
}

:deep(.paginate-button) {
  padding: 8px 12px;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  background-color: #fff;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.paginate-button:hover) {
  background-color: #2C3E50;
  color: #fff;
  border-color: #2C3E50;
}

:deep(.active-page) {
  background-color: #dce3eb;
  color: #495057;
  border-color: #d1d3e2;
}

.page-info {
  text-align: center;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  margin-top: 10px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .emp-container {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .addBtn {
    margin-left: 0;
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    padding: 12px;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  th,
  td {
    font-size: 12px;
    padding: 10px;
  }

  .btn-detail {
    padding: 5px 10px;
    font-size: 12px;
  }

  .page-info {
    font-size: 12px;
  }
}
</style>