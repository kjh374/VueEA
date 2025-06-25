<template>
  <div class="title-area">
    <span>조직도</span>
    <div class="search-area">
      <img src="@/assets/search.svg" alt="검색 아이콘" class="search-icon">
      <input type="text"
        v-model="empNm"
        @input="handleInput"
        placeholder="이름 검색.."
        aria-label="이름 검색" 
      />
    </div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr class="table-title">
          <th width="10%">No.</th>
          <th>부서</th>
          <th>직급</th>
          <th>이름</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="paginatedlist.length === 0">
          <td colspan="4" class="no-data">등록된 사원이 없습니다.</td>
        </tr>
        <tr v-else v-for="(emp, index) in paginatedlist" :key="index" @click="selectEmp(emp)" :class="{'clickable-row': !isDisabled(emp), 'disabled': isDisabled(emp)}">
          <td>{{ totalElements - (currentPage - 1) * itemsPerPage - index }}</td>
          <td>{{ emp.dptNm }}</td>
          <td>{{ emp.pstnNm }}</td>
          <td>{{ emp.empNm }}</td>
        </tr>
      </tbody>
    </table>
    <VueAwesomePaginate 
      :total-items="list.length"
      :items-per-page="itemsPerPage"
      v-model="currentPage"
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps(['id', 'index', 'excludedEmpCds', 'prevPstn', 'postPstn']);
console.log(props);
const store = useStore();
const list = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalElements = ref(0);
const empNm = ref('');

const paginatedlist = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return list.value.slice(start, end);
})

const emit = defineEmits(['select-success']);

const dptCd = ref(null);

function isDisabled(emp) {
  return props.excludedEmpCds.includes(emp.empCd);
}

function selectEmp(emp) {
  if(isDisabled(emp)) return;
  emit('select-success', props.id, props.index, emp);
  store.commit('setOpenOrgModal', {'openOrgModal': false, 'id': emp.empCd});
}

function handleInput(event) {
  const searchValue = event.target.value || '';
  changeList(searchValue);
}

const changeList = (searchValue) => {
    axios.get('/emp/list', {
        params: {
          dptCd: dptCd.value,
          prevPstn: props.prevPstn,
          postPstn: props.postPstn,
          searchValue: searchValue
        }, 
        withCredentials: true
    }).then((res) => {
        console.log(res, 'success emp List');
        list.value = res.data.list || res.data;
        totalElements.value = res.data.list.length;
    })
};

onMounted(() => {
    changeList();
    console.log(props);
})
</script>

<style scoped>
.title-area {
  display: flex;
  padding: 0 20px;
}
.title-area span {
  width: 100px;
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.2px;
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
    margin-right: 20px;
}
.search-area input {
    border: none;
    outline: none;
    font-size: 14px;
    width: 100%;
    background: transparent;
}
.search-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}
.table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse; /* 테두리 겹침 방지 */
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 테이블 전체에 그림자 */
}

/* 테이블 제목 (조직도) */
.table-title {
  background: #3c4650; /* 초록색 */
  color: #fff; /* 흰색 텍스트 */
  font-size: 18px;
  font-weight: bold;
  padding: 15px;
  text-align: center;
  border-bottom: 2px solid #357abd; /* 하단 테두리 */
}

/* 헤더 행 */
thead th {
  font-weight: 600;
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

/* 바디 행 */
tbody td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

/* 링크 스타일 */
tbody td a {
  text-decoration: none;
}

tbody td a:hover {
  text-decoration: underline;
  color: #357abd;
}

/* 호버 효과 */
tbody tr:hover {
  background: #f9f9f9; /* 행 호버 시 밝은 배경 */
}
/* 클릭 가능한 행 스타일 */
.clickable-row {
  cursor: pointer; /* 마우스 커서를 포인터로 */
  transition: background 0.2s ease;
}

.clickable-row:hover {
  background: #e6f0fa; /* 호버 시 밝은 파란색 배경 */
}

/* 선택된 행 강조 (옵션) */
.clickable-row:active {
  background: #d1e7ff; /* 클릭 시 더 진한 배경 */
}

.no-data {
    padding: 20px;
    color: #6c757d;
    font-size: 15px;
}

.no-data:hover {
    color: #6c757d;
    background-color: #fff;
}


.disabled {
  background: #f4f4f4;
  color: #999;
  cursor: not-allowed;
}

.disabled:hover {
  background: #f4f4f4; /* 호버 효과 제거 */
}

/* 페이징 스타일 (VueAwesomePaginate) */
:deep(.pagination-container) {
  margin-top: 20px;
}
@media (max-width: 600px) {
  table {
    font-size: 14px;
  }
  .table-title {
    font-size: 16px;
    padding: 10px;
  }
  thead th,
  tbody td {
    padding: 8px;
  }
}
</style>