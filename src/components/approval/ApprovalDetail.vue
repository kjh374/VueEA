<template>
  <div class="container">
    <div class="form-selector">
      <button
        @click="changeForm"
        class="form-toggle active"
      >
        {{ formTypeText }}
      </button>
    </div>
    <div class="btn-area">
      <button v-if="!isReferencer && doc.status === 1000 && isRcsed && isApproval" class="btn-primary" @click="updateStatus(2000)">결재</button>
      <button v-if="!isReferencer && doc.status === 1000 && isRcsed && isApproval" class="btn-delete" @click="openModal(3000)">반려</button>
      <button v-if="isEditable && !isApproval" @click="openForm" class="btn-primary">수정</button>
      <button v-if="isEditable && !isApproval" @click="submitCancel" class="btn-delete">삭제</button>
      <button @click="closeDetail" class="btn-secondary">목록</button>
    </div>
  </div>

  <div class="main-content">
    <!-- 휴가신청서 상세 -->
    <div v-if="doc.docType === 'VAC'" class="form-card">
      <h2>휴가신청서 상세</h2>
      <table class="form-table">
        <tr>
          <th>제목</th>
          <td>{{ doc.docTitle }}</td>
        </tr>
        <tr>
          <th>휴가일자</th>
          <td>
            <ol class="schedule-list">
              <li v-for="schedule in schedules" :key="schedule.scheduleId">
                {{ schedule.vacDate }} {{ vacTypeText(schedule) }}
              </li>
            </ol>
          </td>
        </tr>
        <tr>
          <th>업무대체자</th>
          <td>{{ substituteText }}</td>
        </tr>
        <tr>
          <th>비상연락망</th>
          <td>{{ contactsText }}</td>
        </tr>
        <tr>
          <th>사유</th>
          <td>{{ commentText }}</td>
        </tr>
        <tr v-if="doc.rejComment">
          <th>반려사유</th>
          <td>{{ doc.rejComment }}</td>
        </tr>
      </table>
    </div>

    <!-- 지출결의서 상세 -->
    <div v-if="doc.docType === 'EXP'" class="form-card">
      <h2>지출결의서 상세</h2>
      <table v-if="docExp" class="form-table">
        <tr>
          <th>제목</th>
          <td>{{ doc.docTitle }}</td>
        </tr>
        <tr>
          <th>지출일자</th>
          <td>{{ expDateText }}</td>
        </tr>
        <tr>
          <th>합산금액</th>
          <td>{{ sumText }} 원</td>
        </tr>
        <tr>
          <th>지출항목</th>
          <td>
            <ol class="expense-list">
              <li v-for="(item, index) in docExp.items" :key="item.expItemId" class="expense-item">
                <div class="expense-info">
                  <span class="expense-method">{{ expMethodText(item.expMethod) }}</span>
                  <span class="expense-count">건수: {{ item.expCount }}건</span>
                  <span class="expense-amount">금액: {{ item.expAmount.toLocaleString() }}원</span>
                </div>
                <div v-if="item.files && item.files.length">
                  <!-- 엑셀 파일 섹션 -->
                  <div class="file_attachments expanded">
                    <div class="file_attachments_summary">
                      <span class="total_count">첨부 <strong>{{ item.files.length }}</strong>개</span>
                      <span class="total_volume">
                        <span class="blind">전체 용량</span>{{ formatFileSize(getTotalSize(item.files)) }}
                      </span>
                    </div>
                    <div class="file_attachments_inner">
                      <ul class="file_list">
                        <li class="file_item" v-for="(file, index) in item.files" :key="index">
                          <div class="file_link">
                            <div class="file_thumbnail">
                              <em :class="getFileIconClass(file.fileNm)"></em>
                            </div>
                            <div class="file_info_area">
                              <div class="file_title_wrap">
                                <strong class="file_title">
                                  <span class="text">{{ getFileNameWithoutExtension(file.fileNm) }}</span>
                                </strong>
                                <span class="file_extension">{{ getFileExtension(file.fileNm) }}</span>
                                <span class="file_volume">{{ formatFileSize(file.fileSize) }}</span>
                              </div>
                            </div>
                          </div>
                          <div class="task">
                            <a class="button_svg_download" href="javascript:void(0)" @click.prevent="downloadFile(file)">
                              <img src="@/assets/download-button-svgrepo-com.svg" alt="다운로드">
                            </a>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </td>
        </tr>
        <tr v-if="doc.rejComment">
          <th>반려사유</th>
          <td>{{ doc.rejComment }}</td>
        </tr>
      </table>
      <p v-if="!docExp">지출결의서 상세 정보가 없습니다.</p>
    </div>

    <!-- 결재/참조 -->
    <div class="approver-card">
      <h2>결재/참조 정보</h2>
      <table class="approver-table">
        <tr>
          <th>결재선</th>
          <th>참조선</th>
        </tr>
        <tr>
          <td>
            <ul class="approver-list">
              <li v-for="approver in approvers" :key="approver.approverId">
                {{ approver.pstnNm }} {{ approver.empNm }}
                <span :class="statusStyle(approver.status)">
                  {{ statusText(approver.status) }}
                </span>
              </li>
            </ul>
          </td>
          <td>
            <ul class="approver-list">
              <li v-for="referencer in referencers" :key="referencer.referencerId">
                {{ referencer.pstnNm }} {{ referencer.empNm }}
              </li>
            </ul>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <!-- 모달 (변경 없음) -->
  <div class="modal-overlay" v-if="openCommentModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">×</button>
      <RejCommentModalVue :id="id" :index="index" :excluded-empCds="excludedEmpCds" @input-success="handleRejCommentChange" @closeModal="closeModal"/>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Header from '../Header.vue'
import RejCommentModalVue from './RejCommentModal.vue';

export default {
  components: { Header, RejCommentModalVue },
  data() {
    return {
        doc: {
            docCd: 0,
            docType: '',
            status: 0,
            docVacs: [],
            vacComment: '',
            rejComment: '',
            rgstEmp: {},
            rgstDttm: null,
            updtDttm: null,
        },
        docVac: {
            contacts: '',
            vacComment: '',
            file: null
        },
        docExp:{

        },
        substitute: {
            empCd: 0,
            empNm: '',
            pstnNm: ''
        },
        approvers: [],
        referencers: [],
        schedules: [],
        openCommentModal: false
    };
  },
  computed: {
    formTypeText() {
      return this.doc.docType === 'VAC' ? '휴가신청서' : '지출결의서';
    },
    rgstEmpText() {
        return this.doc && this.doc.rgstEmp ? this.doc.rgstEmp.pstnNm + ' ' + this.doc.rgstEmp.empNm : '알 수 없음';
    },
    substituteText() {
        return this.substitute && this.substitute.empNm ? this.substitute.pstnNm + ' ' + this.substitute.empNm : '없음';  
    },
    contactsText() {
      return this.docVac && this.docVac.contacts ? this.docVac.contacts.slice(0, 3) + '-' + this.docVac.contacts.slice(3, 7) + '-' + this.docVac.contacts.slice(7) : '없음';
    },
    commentText() {
        return this.docVac && this.docVac.vacComment ? this.docVac.vacComment : '없음';
    },
    isReferencer() {
        this.referencers.some((referencer) => referencer.empCd === this.$store.state.empCd);
    },
    isRcsed() {
      if (!this.approvers || !this.$store.state.loginUserId) {
        return false; // approvers 또는 loginId가 없으면 false
      }
      const approver = this.approvers.find(approver => 
        approver && approver.empCd == this.$store.state.loginUserId
      );
      return approver?.status === 1000;
    },
    expDateText() {
      const year = this.docExp.expDttm.substring(0,4);
      const month = this.docExp.expDttm.substring(4,6);
      return `${year}년 ${month}월`;
    },
    sumText() {
      return this.docExp.sum.toLocaleString();
    },
    isEditable() {
      return this.$store.state.isAdmin || this.doc.status === 1000;
    },
    isApproval() {
      return this.$store.state.isApproval;
    }
  },
  methods: {
    openForm() {
      this.$store.commit('setMenuState', {menu: '전자결재', type: 'update', docCd: this.doc.docCd});
    },
    submitCancel() {
      if(confirm('해당 문서를 삭제하시겠습니까?')) {
        axios.delete('/document', {
          params: {
            docCd: this.doc.docCd
          }
        }).then((res) => {
          console.log(res.data);
          if(res.status === 200) {
            alert('문서가 삭제되었습니다.');
            this.$store.commit('setMenuState', {menu: '전자결재', type: 'list'});
          }
        });
      }
    },
    // 파일 아이콘 클래스
    getFileIconClass(fileNm) {
      if (!fileNm) return 'svg_file_default';
      const ext = fileNm.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'xlsx':
        case 'xls':
          return 'svg_file_excel';
        case 'pdf':
          return 'svg_file_pdf';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'svg_file_image';
        default:
          return 'svg_file_default';
      }
    },
    formatFileSize(bytes) {
      if(!bytes) return '0KB';
      const kb = bytes / 1024;
      return `${kb.toFixed(1)}KB`;
    },
    getFileNameWithoutExtension(fileNm) {
      return fileNm ? fileNm.substring(0, fileNm.lastIndexOf('.')) : '';
    },
    getFileExtension(fileNm) {
      return fileNm ? fileNm.split('.').pop() : '';
    },
    getTotalSize(files) {
      return files.reduce((total, file) => total + (file.fileSize || 0), 0);
    },
    downloadFile(file) {
      axios.get(`document/files/${file.fileCd}`, {
        responseType: 'blob',
      })
      .then((res) => {
        console.log('res.data: ', res.data);
        console.log('file: ',file);

        const blob = new Blob([res.data], { type: res.headers['content-type']});
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileNm;
        document.body.append(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      })
    },
    expMethodText(method) {
      const map = {
        1000: '법인카드',
        2000: '개인카드',
        3000: '현금'
      }
      return map[method] || '알 수 없음';
    },
    openModal() {
      this.openCommentModal = true;
    },
    handleRejCommentChange(comment) {
      this.doc.rejComment = comment;
      this.openCommentModal = false;
      this.updateStatus(3000);
    },
    closeDetail() {
        this.$store.commit("setMenuState", {'menu': '전자결재', 'type': 'list'});
    },
    updateStatus(status) {
        axios.patch('/document', { 
            'docCd': this.doc.docCd,
            'rejComment': this.doc.rejComment,
            'status': status
         }, 
        {
            headers: {
                'Content-type': 'application/json',
            },
            withCredentials: true
        })
        .then((res) => {
            console.log(res.data);
            alert('결재가 완료되었습니다.');
            this.$store.commit('setMenuState', {'menu': '전자결재', 'type': 'list'})
        })
        .catch((error) => {
            console.error('Error :', error.message);
            if(error.response) {
                console.error('Response Data: ', error.response.data);
            }
        })
    },
    statusStyle(status) {
        const map = {
            1000: 'status-pending',
            2000: 'status-approved',
            3000: 'status-rejected',
        };
        return map[status] || 'status-unknown';
    },
    statusText(status) {
        const map = {
            1000: '대기',
            2000: '승인',
            3000: '반려'
        }
        return map[status] || '알 수 없음';
    },
    vacTypeText(schedule) {
        console.log('schedule: ', schedule);
        const map = {
            '01': '연차(종일)',
            '02': '연차(오전)',
            '03': '연차(오후)',
            '11': '병가(종일)',
            '12': '병가(오전)',
            '13': '병가(오후)',
            '21': '공가(종일)',
            '22': '공가(오전)',
            '23': '공가(오후)'
        }
        return map[schedule.vacType] || '알 수 없음';
    },
    closeModal() {
      this.openCommentModal = false;
    }
  },
  created() {
    console.log(this.$store.state.docCd);
    axios.get('/document/one', {
        params: {
            'docCd': this.$store.state.docCd
        }
    }).then((res) => {
        console.log('DocumentVacation', res.data);
        this.substitute = res.data.substitute;
        this.schedules = res.data.schedules;
        this.doc = res.data.doc;
        this.docVac = res.data.docVac;
        this.docExp = res.data.docExp;
        this.approvers = res.data.approvers;
        this.referencers = res.data.referencers;
    })
  }
}
</script>

<style scoped>
/* 상태 스타일 */
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

/* 전체 컨테이너 */
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  max-width: 100%;
}

/* 폼 선택 버튼 */
.form-selector {
  display: flex;
  gap: 10px;
}

.form-toggle {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.form-toggle.active,
.form-toggle:hover {
  background: #4b5563;
  color: #fff;
  border-color: #4b5563;
}

/* 상단 버튼 영역 */
.btn-area {
  display: flex;
  gap: 10px;
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
}

.btn-primary:hover {
  background: #4b5563;
}

.btn-secondary {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f4f4f4;
}

.btn-delete {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #c82333;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 100%;
  margin: 10px 0;
  padding: 0 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 폼 카드 */
.form-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex: 2;
  min-width: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.form-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

/* 결재/참조 카드 */
.approver-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 250px;
}

.approver-card h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

/* 테이블 스타일 */
.form-table,
.approver-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.form-table th,
.form-table td,
.approver-table th,
.approver-table td {
  padding: 12px 16px;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

.form-table th,
.approver-table th {
  font-weight: 600;
  color: #2d3748;
  width: 150px;
  background: #f7fafc;
  text-align: center;
}
.form-table th {
  width: 80px;
}

.form-table td,
.approver-table td {
  color: #4a5568;
  font-size: 15px;
}

/* 휴가일자 리스트 */
.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.schedule-list li {
  padding: 8px 0;
  font-size: 15px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-list li::before {
  content: '•';
  color: #007bff;
  font-size: 18px;
}

/* 지출항목 리스트 */
.expense-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expense-item {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  transition: background 0.2s, border-color 0.2s;
}

.expense-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
}

.expense-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: #2d3748;
  white-space: nowrap; /* 줄바꿈 방지 */
}

.expense-method {
  font-weight: 600;
  color: #1a202c;
}

.expense-count,
.expense-amount {
  color: #4a5568;
}

/* 파일 첨부 섹션 */
.file_attachments {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #e2e8f0;
}

.file_attachments_summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.total_count {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.total_count strong {
  color: #007bff;
}

.total_volume {
  font-size: 13px;
  color: #718096;
}

.file_attachments_inner {
  padding: 0;
}

.file_list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file_item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  transition: background 0.2s, border-color 0.2s;
}

.file_item:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
}

.file_link {
  display: flex;
  align-items: center;
  flex: 1;
  text-decoration: none;
  color: #2d3748;
}

.file_thumbnail {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.file_thumbnail em {
  font-size: 24px;
}

.svg_file_excel { color: #28a745; }
.svg_file_pdf { color: #e53e3e; }
.svg_file_image { color: #3182ce; }
.svg_file_default { color: #718096; }

.file_info_area {
  flex: 1;
}

.file_title_wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file_title {
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
}

.file_extension {
  font-size: 13px;
  color: #718096;
  text-transform: uppercase;
}

.file_extension::before {
  content: '.';
}

.file_volume {
  font-size: 13px;
  color: #718096;
}

/* 다운로드 버튼 */
.task {
  margin-left: 12px;
}

.button_svg_download {
  display: inline-block;
  padding: 6px;
  border-radius: 50%;
  transition: background 0.2s;
}

.button_svg_download img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.button_svg_download:hover {
  background: #e2e8f0;
}

.button_svg_download:hover img {
  opacity: 1;
}

.button_svg_download:focus {
  outline-offset: 2px;
}

/* 결재/참조 리스트 */
.approver-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.approver-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
}

.close-btn:hover {
  color: #ff0000;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 8px;
  }

  .main-content {
    flex-direction: column;
    gap: 10px;
    padding: 0 8px;
    margin: 5px 0;
  }

  .form-card,
  .approver-card {
    flex: none;
    width: 100%;
    min-width: 0;
    padding: 12px;
    border-radius: 8px;
  }

  .form-card h2,
  .approver-card h2 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .form-table,
  .approver-table {
    display: block;
  }

  .form-table tr,
  .approver-table tr {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #edf2f7;
    margin-bottom: 12px;
  }

  .form-table th,
  .form-table td,
  .approver-table th,
  .approver-table td {
    width: 100%;
    padding: 8px 12px;
    display: block;
  }

  .form-table th,
  .approver-table th {
    background: none;
    font-size: 14px;
    color: #2d3748;
  }

  .expense-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    white-space: normal; /* 모바일에서 줄바꿈 허용 */
  }

  .expense-item {
    padding: 10px;
  }

  .file_item {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px;
  }

  .file_link {
    flex-direction: column;
    align-items: flex-start;
  }

  .file_thumbnail {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .task {
    margin-left: 0;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .form-card,
  .approver-card {
    padding: 10px;
  }

  .form-card h2,
  .approver-card h2 {
    font-size: 18px;
  }

  .expense-info {
    font-size: 14px;
  }

  .expense-method,
  .expense-count,
  .expense-amount {
    font-size: 14px;
  }

  .file_title {
    font-size: 14px;
  }

  .file_extension,
  .file_volume {
    font-size: 12px;
  }
}
</style>