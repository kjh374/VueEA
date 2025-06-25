<template>
    <div class="addBtn">
        <div class="search-area">
            <img src="/path/to/magnifier-icon.svg" alt="검색 아이콘" class="search-icon" />
            <input v-model="searchValue" type="text" placeholder="제목 검색..." />
        </div>
        <div class="status-count">
            <span>전체: {{ statusCounts[0] }}</span>
        </div>
        <div class="status-count">
            <span>진행중: {{ statusCounts[1] }}</span>
        </div>
        <div class="status-count">
            <span>승인: {{ statusCounts[2] }}</span>
        </div>
        <div class="status-count">
            <span>반려: {{ statusCounts[3] }}</span>
        </div>
        <div class="filter-group">
            <span>상태</span>
            <select v-model="status">
                <option value="">전체</option>
                <option value="1000">진행중</option>
                <option value="2000">승인</option>
                <option value="3000">반려</option>
            </select>
        </div>
        <div class="filter-group">
            <span>유형</span>
            <select v-model="type">
                <option value="">전체</option>
                <option value="VAC">휴가신청서</option>
                <option value="EXP">지출결의서</option>
            </select>
        </div>
    </div>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th width="5%">번호</th>
                    <th width="10%">결재상태</th>
                    <th width="15%">유형</th>
                    <th>제목</th>
                    <th width="15%">신청일</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="list.length === 0">
                    <td colspan="5" class="no-data">등록된 문서가 없습니다.</td>
                </tr>
                <tr v-else v-for="(doc, index) in list" :key="index" class="clickable-row" @click="openDetail(doc.docCd)">
                    <td>{{ totalElements - (curPage - 1) * pageSize - index }}</td>
                    <td><span :class="statusStyle(doc.status)">{{ statusText(doc.status) }}</span></td>
                    <td>{{ docTypeText(doc.docType) }}</td>
                    <td class="doc-title">{{ doc.docTitle }}</td>
                    <td>{{ doc.rgstDttm }}</td>
                </tr>
            </tbody>
        </table>
        <VueAwesomePaginate
            v-model="curPage"
            :itemsPerPage="pageSize"
            :total-items="totalElements"
            class="pagination"
        />
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const list = ref([]);
const totalPages = ref(0);
const category = ref('상신문서함');
const curPage = ref(1);
const pageSize = ref(5);
const totalElements = ref(1);
const searchValue = ref('');
const status = ref('');
const type = ref('');
const statusCounts = ref({});

function statusText(status) {
    const map = {
        1000: '진행중',
        2000: '승인',
        3000: '반려'
    }
    return map[status] || '알 수 없음';
}

function docTypeText(type) {
    const map = {
        'VAC': '휴가신청서',
        'EXP': '지출결의서'
    };
    return map[type] || '알 수 없음';
}

function changeStatus() {
    axios.get('/document/list', {
        params: {
            'curPage': curPage.value,
            'pageSize': pageSize.value,
            'searchValue': searchValue.value.trim() === '' ? null : searchValue.value.trim(),
            'status': status.value === '' ? null : status.value,
            'type': type.value === '' ? null : type.value,
            'category': category.value
        },
        withCredentials: true
    }).then((res) => {
        console.log('documentList', res);
        if (res.data.page) {
            list.value = res.data.page.content;
            totalPages.value = res.data.page.totalPages;
            totalElements.value = res.data.page.totalElements;
            statusCounts.value = res.data.statusCounts;
        }
    });
}

function statusStyle(status) {
    const map = {
        1000: 'status-pending',
        2000: 'status-approved',
        3000: 'status-rejected'
    };
    return map[status] || 'status-unknown';
}

function openDetail(docCd) {
    store.commit('setMenuState', { 'menu': '전자결재', 'type': 'detail', 'docCd': docCd });
}

watch(
    () => [curPage.value, searchValue.value.trim(), status.value, type.value],
    () => {
        changeStatus();
    }
)

onMounted(() => {
    changeStatus();
});
</script>

<style scoped>
/* 전체 레이아웃 */
.addBtn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

/* 검색 영역 */
.search-area {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #d1d3e2;
    border-radius: 6px;
    padding: 5px 10px;
    width: 250px;
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

/* 상태 카운트 */
.status-count {
    padding: 8px 12px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #e1e3e8;
    font-size: 14px;
    color: #495057;
}

/* 필터 그룹 */
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

/* 작성 버튼 */
.addBtn button {
    padding: 8px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.addBtn button:hover {
    background-color: #0056b3;
}

/* 테이블 컨테이너 */
.table-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 20px;
}

/* 테이블 스타일 */
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

table th {
    background-color: #f1f3f5;
    padding: 12px;
    text-align: center;
    color: #343a40;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

table td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
}

table tr:hover {
    background-color: #f8f9fa;
}

.no-data {
    padding: 20px;
    color: #6c757d;
    font-size: 15px;
}

/* 문서 제목 */
.doc-title a {
    text-decoration: none;
    color: #2C3E50;
    transition: color 0.2s;
}

.doc-title a:hover {
    color: #2C3E50;
    text-decoration: underline;
}

/* 클릭 가능한 행 스타일 */
.clickable-row {
  cursor: pointer; /* 마우스 커서를 포인터로 */
  transition: background 0.2s ease;
}

/* 상태 스타일 */
.status-pending {
    color: #ffc107;
    font-weight: 500;
}

.status-approved {
    color: #28a745;
    font-weight: 500;
}

.status-rejected {
    color: #dc3545;
    font-weight: 500;
}

.status-unknown {
    color: #6c757d;
}

/* 페이징 */
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

::v-deep .paginate-buttons {
    display: flex;
    gap: 5px;
}

::v-deep .paginate-buttons button {
    padding: 8px 12px;
    border: 1px solid #d1d3e2;
    border-radius: 6px;
    background-color: #fff;
    color: #495057;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

::v-deep .paginate-buttons button:hover {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
}

::v-deep .paginate-buttons .active {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
}
</style>