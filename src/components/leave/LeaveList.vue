<template>
  <div class="leave-container">
    <div class="header">
      <div class="count-area">
        <div class="category">
          <span>연차관리</span>
          <span class="title">연차 목록</span>
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
          @click="save"
          class="btn-primary"
          aria-label="연차 정보 저장"
        >
          저장
        </button>
      </div>
    </div>
    <div class="table-container">
      <table role="grid" aria-describedby="leave-table-desc">
        <caption id="leave-table-desc" class="sr-only">
          사원별 연차 관리 테이블
        </caption>
        <thead>
          <tr>
            <th width="5%" scope="col">No.</th>
            <th width="15%" scope="col">부서</th>
            <th width="15%" scope="col">직급</th>
            <th width="15%" scope="col">이름</th>
            <th width="10%" scope="col">총연차</th>
            <th width="10%" scope="col">사용연차</th>
            <th width="10%" scope="col">잔여연차</th>
            <th width="15%" scope="col">입사일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="8" class="no-data">등록된 사원이 없습니다.</td>
          </tr>
          <tr
            v-for="(emp, index) in paginatedData"
            :key="emp.empCd"
            class="clickable-row"
          >
            <td>{{ totalItems - (currentPage - 1) * itemsPerPage - index }}</td>
            <td>{{ emp.dptNm }}</td>
            <td>{{ emp.pstnNm }}</td>
            <td>{{ emp.empNm }}</td>
            <td>{{ emp.totalVac }}</td>
            <td>
              <input
                v-model="emp.useVac"
                @input="restrictToFloat($event, emp)"
                type="text"
                :aria-label="`사용 연차 입력, 사원 ${emp.empNm}`"
                :aria-invalid="emp.useVac > emp.totalVac"
                class="vac-input"
              />
              <span
                v-if="emp.useVac > emp.totalVac"
                class="error-message"
                role="alert"
                >총연차 초과</span
              >
            </td>
            <td>{{ emp.totalVac - emp.useVac }}</td>
            <td>{{ emp.hireDate }}</td>
          </tr>
        </tbody>
      </table>
      <VueAwesomePaginate
        v-model="currentPage"
        :total-items="empList.length"
        :items-per-page="itemsPerPage"
        class="pagination"
        aria-label="페이지네이션"
      />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const emit = defineEmits(['openForm', 'openDetail']);
const store = useStore();
const empList = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = ref(0);


const searchValue = ref('');
const dptCd = ref('');
const pstnCd = ref('');

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return empList.value.slice(start, end);
});

function handleInput(event) {
  searchValue.value = event.target.value.trim();
}

onMounted(() => {
  fetchEmpList();
});

function save() {
  axios.post('/leave', paginatedData.value).then((res) => {
    if (res.status === 200) {
      alert("저장되었습니다.");
    }
  });
}

function restrictToFloat(event, emp) {
  const filtered = event.target.value
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*?)\./g, '$1');
  if (Number(filtered) > emp.totalVac) {
    emp.useVac = emp.totalVac;
  } else {
    emp.useVac = filtered;
  }
}

watch(
  () => [searchValue.value, dptCd.value, pstnCd.value],
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
.leave-container {
  padding: 20px;
  background: #f8f9fa; /* 전자결재 배경 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
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
  margin-right: 20px;
}

.btn-primary:hover {
    background-color: #343a40;
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

.no-data {
  padding: 20px;
  color: #6c757d;
  font-size: 15px;
  text-align: center;
}

.vac-input {
  width: 80px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  outline: none;
  text-align: center;
  transition: border-color 0.2s;
}

.vac-input:focus {
  border-color: #007bff;
}

.vac-input[aria-invalid="true"] {
  border-color: #e74c3c; /* 반려 색상 */
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
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
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

:deep(.active-page) {
  background-color: #dce3eb;
  color: #000;
  border-color: #000;
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
  .leave-container {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
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

  .vac-input {
    width: 60px;
    padding: 6px;
    font-size: 12px;
  }

  .page-info {
    font-size: 12px;
  }
}
</style>