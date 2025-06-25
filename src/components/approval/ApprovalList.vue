<template>
   <div class="approval-container">
       <div class="header">
            <div class="count-area">
                <div class="category" :aria-label="`현재 메뉴: ${menu}, 하위 메뉴: ${submenu}`">
                    <span>{{ menu }}</span>
                    <span class="title">{{ submenu }}</span>
                </div>
                <div class="status-count" :class="{ 'status-total': true }">
                    <span><i class="icon-total"></i> 전체: {{ statusCounts[0] }} 건</span>
                </div>
                <div class="status-count" :class="{ 'status-pending': true }">
                    <span><i class="icon-pending"></i> 진행중: {{ statusCounts[1] }} 건</span>
                </div>
                <div class="status-count" :class="{ 'status-approved': true }">
                    <span><i class="icon-approved"></i> 승인: {{ statusCounts[2] }} 건</span>
                </div>
                <div class="status-count" :class="{ 'status-rejected': true }">
                    <span><i class="icon-rejected"></i> 반려: {{ statusCounts[3] }} 건</span>
                </div>
            </div>
            <div class="filter-area">
                <div class="filter-group">
                    <label for="type-select">문서 유형</label>
                    <select v-model="type" id="type-select" aria-label="문서 유형 선택">
                        <option value="">전체</option>
                        <option value="VAC">휴가신청서</option>
                        <option value="EXP">지출결의서</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="status-select">상태</label>
                    <select v-model="status" id="status-select" aria-label="결재 상태 선택">
                        <option value="">전체</option>
                        <option value="1000">{{ statusText(1000)}}</option>
                        <option value="2000">승인</option>
                        <option value="3000">반려</option>
                    </select>
                </div>
                <div class="search-area">
                    <img src="@/assets/search.svg" alt="검색 아이콘" class="search-icon" />
                    <input 
                        v-model="searchValue"
                        @input="handleInput" 
                        type="text" 
                        placeholder="제목 검색..." 
                        aria-label="문서 제목 검색" 
                    />
                </div>
            </div>
            <button 
                v-if="menu == '전자결재'" 
                @click="openApplication" 
                aria-label="새 문서 작성"
                class="btn-primary"
            >
                작성
            </button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th width="5%">No.</th>
                        <th width="10%">문서 유형</th>
                        <th width="10%">결재 상태</th>
                        <th>제목</th>
                        <th width="10%" v-if="isApproval">신청자</th>
                        <th width="10%">신청일</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="list.length === 0">
                        <td v-if="isApproval" colspan="6" class="no-data">등록된 문서가 없습니다.</td>
                        <td v-else colspan="5" class="no-data">등록된 문서가 없습니다.</td>
                    </tr>
                    <tr v-else v-for="(doc, index) in list" :key="index" class="clickable-row" @click="openDetail(doc.docCd)">
                        <td>{{ totalElements - (curPage - 1) * pageSize - index }}</td>
                        <td>{{ docTypeText(doc.docType) }}</td>
                        <td><span :class="statusStyle(isApproval ? doc.aprvStatus : doc.status)">{{ aprvStatusText(isApproval ? doc.aprvStatus : doc.status) }}</span></td>
                        <td class="doc-title">{{ doc.docTitle }}</td>
                        <td v-if="isApproval">{{ doc.rgstEmp.pstnNm }} {{ doc.rgstEmp.empNm }}</td>
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
   </div>
</template>

<script setup>
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const list = ref([]);
const totalPages = ref(0);
const curPage = ref(1);
const pageSize = ref(5);
const totalElements = ref(1);
const searchValue = ref('');
const status = ref('');
const type = ref('');
const category = computed(() => store.state.submenu);
const statusCounts = ref({});
const menu = computed(() => store.state.menu);
const submenu = computed(() => store.state.submenu);
const isApproval = computed(() => store.state.isApproval);

function statusStyle(status) {
    const map = {
        1000: 'status-pending',
        2000: 'status-approved',
        3000: 'status-rejected',
    };
    return map[status] || 'status-unknown';
}

function statusText(status) {
    const map = {
        1000: submenu.value === '결재수신함' ? '대기' : '진행중',
        2000: '승인',
        3000: '반려',
    };
    if (status === 1000 && store.state.isAdmin) {
        return '진행중';
    }
    return map[status] || '알 수 없음';
}

function aprvStatusText(status) {
    const map = {
        1000: '진행중',
        2000: '승인',
        3000: '반려',
    };
    if (status === 1000 && store.state.isAdmin) {
        return '진행중';
    }
    return map[status] || '알 수 없음';
}

function docTypeText(type) {
    const map = {
        'VAC': '휴가신청서',
        'EXP': '지출결의서',
    };
    return map[type] || '알 수 없음';
}

function openApplication() {
        store.commit('setMenuState', { 'menu': '전자결재', 'type': 'write' });
}

function handleInput(event) {
    searchValue.value = event.target.value.trim();
    changeStatus(searchValue);
}

function changeStatus() {
    axios.get('/document/list', {
        params: {
            curPage: curPage.value,
            pageSize: pageSize.value,
            searchValue: searchValue.value,
            status: status.value === '' ? null : status.value,
            type: type.value === '' ? null : type.value,
            category: category.value,
        },
        withCredentials: true,
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

function openDetail(docCd) {
    store.commit('setMenuState', { menu: '전자결재', type: 'detail', docCd: docCd });
}

watch(
    () => [curPage.value, status.value, type.value, category.value],
    () => {
        changeStatus();
    }
);

onMounted(() => {
    changeStatus();
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.approval-container {
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    padding: 20px;
}
.btn-primary {
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: #6b7280;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    margin-right: 20px;
}

.btn-primary:hover {
    background-color: #343a40;
}

.category span:first-child {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-color);
    letter-spacing: -0.2px;
}

.category .title {
    vertical-align: text-bottom;
    font-size: 18px;
    font-weight: 400;
    color: var(--secondary-text-color);
    position: relative;
    padding-left: 16px;
}

.count-area {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
}

.header {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 8px;
    flex-wrap: wrap;
    justify-content: space-between;
}

.search-area {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #d1d3e2;
    border-radius: 6px;
    padding: 7px 10px;
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

.status-count {
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

.doc-title {
    text-align: left;
}

.doc-title a {
    text-decoration: none;
    color: #2C3E50;
    transition: color 0.2s;
}

.doc-title a:hover {
    color: #2C3E50;
    text-decoration: underline;
}

.clickable-row {
    cursor: pointer;
    transition: background 0.2s ease;
}

.status-total {
    font-weight: 500;
    background-color: rgba(230, 227, 225, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.status-pending {
    font-weight: 500;
    background-color: rgba(241, 196, 15, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.status-approved {
    font-weight: 500;
    background-color: rgba(46, 204, 113, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.status-rejected {
    font-weight: 500;
    background-color: rgba(231, 76, 60, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.status-unknown {
    color: #6c757d;
}

.pagination {
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

/* 현재 페이지 정보 스타일 추가 */
.page-info {
    text-align: center;
    font-size: 14px;
    color: #495057;
    font-weight: 500;
}
:deep(.paginate-button:hover) {
    background-color: #2C3E50;
}
:deep(.active-page) {
    background-color: #dce3eb;
}
</style>