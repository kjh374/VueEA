<template>
  <div class="container">
    <div class="form-selector">
      <button
        v-if="state.docVac"
        :class="{ active: state.doc.docType === 'VAC' }"
        @click="changeForm('VAC')"
        class="form-toggle"
      >
        휴가신청서
      </button>
      <button
        v-if="state.docExp"
        :class="{ active: state.doc.docType === 'EXP' }"
        @click="changeForm('EXP')"
        class="form-toggle"
      >
        지출결의서
      </button>
    </div>
    <div class="btn-area">
      <button @click="submitRequest" class="btn-primary">결재요청</button>
      <button @click="closeForm" class="btn-secondary">취소</button>
    </div>
  </div>

  <div class="main-content">
    <!-- 휴가신청서 -->
    <div v-if="state.doc.docType === 'VAC'" class="form-card">
      <h2>휴가신청서</h2>
      <div class="vacation-form">
        <div class="form-row">
          <div class="label-group">
            제목
            <span class="required-asterisk">*</span>
          </div>
          <div class="input-group">
            <input
              ref="docTitleInput"
              v-model="state.doc.docTitle"
              class="input-field"
              placeholder="제목 입력"
              @input="validateDocTitle"
              required
            />
          </div>
        </div>
        <div class="form-row">
          <div class="label-group">
            <span>
              휴가일자
              <span class="required-asterisk">*</span>
            </span>
            <button @click="addDate" class="btn-add">추가</button>
          </div>
          <div class="form-row schedule-row">
            <div v-for="(schedule, index) in state.schedules" :key="schedule.id" class="input-group">
              <VueDatePicker 
                :ref="el => vacDateInput[index] = el"
                v-model="schedule.vacDate"
                :disabled-dates="disableDates"
                format="yyyy-MM-dd"
                locale="ko"
                week-start="0"
                :enable-time-picker="false"
                :auto-apply="true"
                @update:model-value="validateInput('vacDate', index)"
                class="input-field"
              />
              <select :ref="el => vacTypeInput[index] = el" v-model="schedule.vacType" class="select-field" :class="{ error: errors.schedules[index]?.vacType }"
                @change="validateInput('vacType', index)">
                <option value="01">연차(종일)</option>
                <option value="02">연차(오전)</option>
                <option value="03">연차(오후)</option>
                <option value="11">병가(종일)</option>
                <option value="12">병가(오전)</option>
                <option value="13">병가(오후)</option>
                <option value="21">공가(종일)</option>
                <option value="22">공가(오전)</option>
                <option value="23">공가(오후)</option>
              </select>
              <button @click="deleteDate(index)" class="btn-delete">삭제</button>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="label-group">업무대체자</div>
          <div class="input-group">
            <input
              v-model="substituteText"
              readonly
              class="input-field substitute"
              placeholder="대체자를 선택하세요"
            />
            <button @click="openOrg(1)" class="btn-action">조직도</button>
          </div>
        </div>
        <div class="form-row">
          <div class="label-group">비상연락망</div>
          <div class="input-group">
            <input
              ref="contactsInput"
              v-model="state.docVac.contacts"
              class="input-field"
              :class="{error: errors.contacts}"
              placeholder="연락처 입력"
              @input="validateInput('contacts')"
            />
            <span v-if="errors.contacts" class="error-message">
              {{ errors.contacts }}
            </span>
          </div>
        </div>
        <div class="form-row">
          <div class="label-group">사유</div>
          <div class="input-group">
            <input
              ref="vacCommentInput"
              v-model="state.docVac.vacComment"
              class="input-field"
              :class="{error: errors.vacComment}"
              placeholder="휴가 사유 입력"
              @input="validateVacComment"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 지출결의서 -->
    <div v-if="state.doc.docType === 'EXP'" class="form-card">
      <h2>지출결의서</h2>
      <div class="expense-header">
        <div class="title-field">
          <span>
            제목
            <span class="required-asterisk">*</span>
          </span>
          <input
            ref="docTitleInput"
            class="input-field"
            :class="{ error: errors.docTitle }"
            type="text"
            v-model="state.doc.docTitle"
            placeholder="제목 입력"
            @input="validateDocTitle"
          />
        </div>
        <div class="date-input">
          <span>
            지출연월
            <span class="required-asterisk">*</span>
          </span>
          <select
            ref="expDttmSelect"
            class="select-field"
            :class="{ error: errors.expDttm }"
            v-model="state.docExp.expDttm"
            @change="validateInput('expDttm')"
          >
            <option v-for="(date, index) in state.dates" :key="index" :value="formatDate(date)">
              {{ dateText(date) }}
            </option>
          </select>
        </div>
        <div class="sum-field">
          <span>합산금액</span>
          <div class="input-with-suffix">
            <input
              type="number"
              v-model="totalSum"
              class="input-field"
              placeholder="0"
              readonly
            />
            <span class="suffix">원</span>
          </div>
        </div>
      </div>
      <div class="expense-items">
        <div
          v-for="(item, index) in state.docExp.items"
          :key="index"
          class="expense-item"
        >
          <div class="expense-row">
            <div class="info-area">
              <div class="expense-input">
                <span>
                  결제수단
                  <span class="required-asterisk">*</span>
                </span>
                <!-- :class="{ error: errors.expItems[index]?.expMethod }"  -->
                <select :ref="(el) => (expMethodInput[index] = el)" v-model="item.expMethod" class="select-field" 
                  :class="{ error: errors.expMethod }" 
                  @change="validateInput('expMethod', index)">
                  <option value="1000">법인카드</option>
                  <option value="2000">개인카드</option>
                  <option value="3000">현금</option>
                </select>
              </div>
              <div class="expense-input">
                <span>
                  지출건수
                  <span class="required-asterisk">*</span>
                </span>
                <div class="input-with-suffix">
                  <input
                    :ref="(el) => (expCountInput[index] = el)"
                    type="number"
                    v-model="item.expCount"
                    class="input-field"
                    :class="{ error: errors.expItems[index]?.expCount }"
                    placeholder="0"
                    @input="restrictNegative($event, index, 'expCount')"
                  />
                  <span class="suffix">건</span>
                </div>
              </div>
              <div class="expense-input">
                <span>
                  지출금액
                  <span class="required-asterisk">*</span>
                </span>
                <div class="input-with-suffix">
                  <input
                    :ref="(el) => (expAmountInput[index] = el)"
                    type="number"
                    v-model="item.expAmount"
                    class="input-field"
                    :class="{ error: errors.expItems[index]?.expAmount }"
                    placeholder="0"
                    @input="restrictNegative($event, index, 'expAmount')"
                  />
                  <span class="suffix">원</span>
                </div>
              </div>
            </div>
            <div class="file-area">
              <div class="file-upload">
                <span>
                  증빙자료
                  <span class="required-asterisk">*</span>
                </span>
                <label class="button-upload">
                  파일 선택
                  <input
                    type="file"
                    @change="handleFileUpload($event, index)"
                    class="input-file"
                    multiple
                    accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png"
                  />
                </label>
                <p class="description">
                  {{ calculateTotalSize(item.files, item.newFiles) }} / 10MB
                </p>
                <span v-if="errors.expItems[index].files" class="error-message">
                  {{ errors.expItems[index].files }}
                </span>
              </div>
              <div tabindex="6" class="file-attachments">
                <div class="file-list-header">
                  <div class="file-list-header-title"><span>파일명</span></div>
                  <div class="file-list-header-volume"><span>용량</span></div>
                  <div class="file-list-header-task"></div>
                </div>
                <ul class="file-list">
                  <li
                    v-for="file in getAllFiles(item.files, item.newFiles)"
                    :key="file.fileCd || file.name"
                    class="file-item"
                    v-if="getAllFiles(item.files, item.newFiles).length"
                  >
                    <div class="file-info">
                      <div class="file-thumbnail">
                        <em :class="getFileIconClass(file)"></em>
                      </div>
                      <div class="file-title-wrap">
                        <span class="file-title">{{ file.name || file.fileNm }}</span>
                        <span class="file-volume">{{ file.size || file.fileSize ? formatFileSize(file.size, file.fileSize) : 'N/A' }}</span>
                      </div>
                    </div>
                    <div class="task">
                      <button
                        @click="deleteFile(file.fileCd || file.name, index)"
                        class="button-svg-delete"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                  <span v-else>선택된 파일 없음</span>
                </ul>
              </div>
            </div>
            <button @click="deleteItem(index)" class="btn-delete">항목 삭제</button>
          </div>
        </div>
        <button v-if="state.docExp.items.length < 3" @click="addItem" class="btn-add">항목 추가</button>
      </div>
    </div>

    <!-- 결재선/참조선 -->
    <div class="approver-card">
      <h2>결재/참조 설정</h2>
      <table class="approver-table">
        <tr>
          <td class="approver-header">
            <div class="approver-header-group">
              <div class="approver-header-item">
                <span>결재선</span>
                <button @click="addApprovers" class="btn-action">추가</button>
              </div>
              <div class="approver-header-item">
                <span>참조선</span>
                <button @click="addReferencer" class="btn-action">추가</button>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="approver-content">
              <div class="approver-list-container">
                <ul class="approver-list">
                  <li v-for="(approver, index) in state.approvers" :key="approver.id">
                    <div class="step-label" :class="'step-' + (index + 1)">
                      <span>{{ index + 1 }}차 결재자 :</span>
                    </div>
                    {{ approver.pstnNm + ' ' + approver.empNm }}
                    <div class="button-group">
                      <button @click="openOrg(2, index)" class="btn-action">선택</button>
                      <button @click="deleteApprover(index)" class="btn-delete">삭제</button>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="approver-list-container">
                <ul class="approver-list">
                  <li v-for="(referencer, index) in state.referencers" :key="referencer.id">
                    참조자 : {{ referencer.pstnNm + ' ' + referencer.empNm }}
                    <div class="button-group">
                      <button @click="openOrg(3, index)" class="btn-action">선택</button>
                      <button @click="deleteReferencer(index)" class="btn-delete">삭제</button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- 모달 -->
  <div class="modal-overlay" v-if="openOrgModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">×</button>
      <OrgModalVue :id="state.id" :index="state.index" :excluded-empCds="excludedEmpCds" :prevPstn="findPrevApprover(state.approvers, state.index)" :postPstn="findPostApprover(state.approvers, state.index)" @select-success="handleEmpChange" />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import OrgModalVue from './OrgModal.vue'; // 실제 경로로 수정
import VueDatePicker from '@vuepic/vue-datepicker';

// Vuex 스토어
const store = useStore();

// 통합된 state 객체
const state = reactive({
  doc: {
    docCd: 0,
    docType: 'VAC',
    docTitle: ''
  },
  docVac: {
    substitute: {
      empCd: 0,
      empNm: '',
      pstnCd: '',
      pstnNm: ''
    },
    contacts: '',
    vacComment: ''
  },
  docExp: {
    expCd: 0,
    expDttm: '',
    sum: 0,
    items: [
      {
        expItemId: 0,
        expMethod: '1000',
        expCount: 0,
        expAmount: 0,
        files: [],
        newFiles: []
      }
    ]
  },
  schedules: [{
    scheduleId: 0,
    vacDate: '',
    vacType: '01'
  }],
  approvers: [{
    approverId: 0,
    empCd: 0,
    empNm: '',
    pstnCd: '',
    pstnNm: ''
  },
  {
    approverId: 0,
    empCd: 0,
    empNm: '',
    pstnCd: '',
    pstnNm: ''
  },
  {
    approverId: 0,
    empCd: 0,
    empNm: '',
    pstnCd: '',
    pstnNm: ''
  }],
  referencers: [
    {
      empCd: 56,
      empNm: '김지영',
      pstnCd: '',
      pstnNm: '차장'
    },
    {
      empCd: 57,
      empNm: '이재준',
      pstnCd: '',
      pstnNm: '상무'
    }
  ],
  dates: [],
  deletedFileCds: [],
  id: '',
  index: ''
});

const docTitleInput = ref(null);
const contactsInput = ref(null);
const vacDateInput = ref([]);
const vacTypeInput = ref([]);
const vacCommentInput = ref(null);
const expDttmSelect = ref(null);
const expMethodInput = ref([]);
const expCountInput = ref([]);
const expAmountInput = ref([]);

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const errors = reactive({
  docTitle: '',
  contacts: '',
  vacComment: '',
  schedules: state.schedules.map((schedule) => ({
    vacDate: '',
    vacType: ''
  })),
  expMethod: '',
  expDttm: '',
  expCount: '',
  expItems: state.docExp.items.map((item) => ({
    expMethod: '',
    expCount: '',
    expAmount: '',
    files: ''
  })),
  approvers: state.approvers.map((approver) => ({
    empNm: '',
    pstnNm: ''
  })),
  remainingVacation: ''
});

const calculateDays = () => {
  return state.schedules.reduce((sum, schedule) => {
    if(['21', '22', '23'].includes(schedule.vacType)) return sum;
    const isHalfDay = ['02', '03', '12', '13'].includes(schedule.vacType);
    return sum + (isHalfDay ? 0.5 : 1);
  }, 0)
}

const validateRemainingVacation = () => {
  const remainingVacation = store.state.loginUser.totalVac - store.state.loginUser.useVac;
    if(calculateDays() > remainingVacation) {
      errors.remainingVacation = `잔여연차가 부족합니다.( ${calculateDays()} / ${remainingVacation}일 )`;
    } else {
      errors.remainingVacation = '';
    };
    return !errors.remainingVacation;
}
const lastDocTitle = ref(null);
const validateDocTitle = () => {
  if(state.doc.docTitle.length > 60) {
    alert('제목은 60자를 초과할 수 없습니다.');
    state.doc.docTitle = lastDocTitle.value;
    docTitleInput.value.focus();
  }
  lastDocTitle.value = state.doc.docTitle;
}

const lastVacComment = ref(null);
const validateVacComment = () => {
  if(state.docVac.vacComment.length > 100) {
    alert('휴가 사유는 100자를 초과할 수 없습니다.');
    state.docVac.vacComment = lastVacComment.value;
    vacCommentInput.value.focus();
  }
  lastVacComment.value = state.docVac.vacComment;
}

const lastContacts = ref('');

const formDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  return dateObj.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); // "2025-06-18"
};
const validateInput = (field, index) => {
  if(field === 'vacDate') {
    console.log(errors.schedules);
    errors.schedules[index].vacDate = '';
    if(!state.schedules[index].vacDate) {
      errors.schedules[index].vacDate = '휴가날짜를 선택해주세요.';
    } else if(state.schedules.some((schedule, i) => i !== index && schedule.vacDate && formDate(schedule.vacDate) === formDate(state.schedules[index].vacDate))){
      alert('날짜 중복선택이 불가합니다.');
      state.schedules[index].vacDate = '';
    }
    return !errors.schedules[index].vacDate;
  } else if(field === 'vacType') {
    errors.schedules[index].vacType = state.schedules[index].vacType ? '' : '휴가유형을 선택해주세요.';
    return !errors.schedules[index].vacType;
  } else if(field === 'contacts') {
    // 유효성 검사: 11자 초과 시
    if (state.docVac.contacts.length > 11) {
      alert('연락처는 11자 이내로 입력해주세요.');
      // 이전 유효한 값으로 복원
      state.docVac.contacts = lastContacts.value;
      contactsInput.value.focus();
    } 
    lastContacts.value = state.docVac.contacts;
  } else if(field === 'expDttm') {
    errors.expDttm = state.docExp.expDttm ? '' : '지출연월을 선택해주세요.';
    return !errors.expDttm;
  } else if(field === 'expMethod') {
    // errors.expItems[index].expMethod = state.docExp.items[index].expMethod ? '' : '결제수단을 선택해주세요.';
    errors.expMethod = state.docExp.items[index].expMethod ? '' : '결제수단을 선택해주세요.';
    // return !errors.expItems[index].expMethod;
    return !errors.expMethod;
  } else if(field === 'expCount') {
    errors.expItems[index].expCount = state.docExp.items[index].expCount > 0 ? '' : '지출건수를 입력해주세요.';
    return !errors.expItems[index].expCount;
  } else if(field === 'expAmount') {
    errors.expItems[index].expAmount = state.docExp.items[index].expAmount > 0 ? '' : '지출금액을 입력해주세요.';
    return !errors.expItems[index].expAmount;
  } else if(field === 'files') {
    errors.expItems[index].files = state.docExp.items[index].files?.some((file) => file.fileNm || file.name) || state.docExp.items[index].newFiles?.some((file) => file.fileNm || file.name) ? '' : '증빙자료를 첨부해주세요.';
    return !errors.expItems[index].files;
  } else if(field === 'approvers') {
    errors.approvers[index].empNm = state.approvers[index].empNm ? '' : (index + 1) + '차 결재자를 선택해주세요.';
    return !errors.approvers[index].empNm;
  }
}

const validateAll = () => {
  if(!state.doc.docTitle) {
    alert('제목을 입력해주세요.');
    docTitleInput.value.focus();
    return false;
  }
  if(state.doc.docTitle !== state.doc.docTitle.trim()){
    alert('제목 앞뒤에는 공백은 입력할 수 없습니다.');
    state.doc.docTitle = state.doc.docTitle.trim();
    docTitleInput.value.focus();
    return false;
  };
  
  if(state.doc.docType === 'VAC') {
    for(let i=0; i < state.schedules.length; i++) {
      if(!validateInput('vacDate', i)) {
        alert(errors.schedules[i].vacDate);
        vacDateInput.value[i].openMenu();
        return false;
      }
      
      if(!validateInput('vacType', i)) {
        alert(errors.schedules[i].vacType);
        vacTypeInput.value[i].focus();
        return false;
      }
    }
    if(!state.docVac.vacComment.trim()) {
      state.docVac.vacComment = state.docVac.vacComment.trim();
    }
    if(state.docVac.vacComment !== state.docVac.vacComment.trim()) {
      alert('앞뒤 공백은 입력할 수 없습니다.' );
      state.docVac.vacComment = state.docVac.vacComment.trim();
      vacCommentInput.value.focus();
      return false;
    }

    if(!state.docVac.contacts.trim()) {
      state.docVac.contacts = state.docVac.contacts.trim();
    }
    
    if(state.docVac.contacts !== state.docVac.contacts.trim()) {
      alert('연락처에 앞뒤 공백은 입력할 수 없습니다.');
      state.docVac.contacts = state.docVac.contacts.trim();
      contactsInput.value.focus();
      return false;
    }
    
    if(!validateRemainingVacation()) {
      console.log(errors.remainingVacation);
      alert(errors.remainingVacation);
      return false;
    }
  };

  if(state.doc.docType === 'EXP') {
    if(!validateInput('expDttm')) {
      alert(errors.expDttm);
      expDttmSelect.value.focus();
      return false;
    }
    
    for(let i = 0; i < state.docExp.items.length; i++) {
      if(!validateInput('expMethod', i)) {
        // alert(errors.expItems[i].expMethod);
        alert(errors.expMethod);
        expMethodInput.value[i].focus();
        return false;
      }
      if(!validateInput('expCount', i)) {
        alert(errors.expItems[i].expCount);
        expCountInput.value[i].focus();
        return false;
      }
      if(!validateInput('expAmount', i)) {
        alert(errors.expItems[i].expAmount);
        expAmountInput.value[i].focus();
        return false;
      }
      if(!validateInput('files', i)) {
        alert(errors.expItems[i].files);
        return false;
      }
    }
  }

  for(let i=0; i < state.approvers.length; i++) {
    if(!validateInput('approvers', i)) {
    alert(errors.approvers[i].empNm);
    return false;
    }
  }

  const hasErrors = errors.docTitle ||
    errors.approvers.some((item) => item.empNm) || 
    (state.doc.docType === 'VAC' && (errors.schedules.some((schedule) =>  schedule.vacDate || schedule.vacType) || errors.remainingVacation || errors.contacts || errors.vacComment)) ||
    (state.doc.docType === 'EXP' && (errors.expDttm || errors.expItems.some((item) => item.expMethod || item.expAmount || item.expCount)));

  return !hasErrors;
}

const disableDates = (date) => {
  const scheduleObjs = state.schedules.map((schedule) => formDate(schedule.vacDate)); 
  console.log(scheduleObjs);
  return date.getDay() === 0 || date.getDay() === 6 || scheduleObjs.includes(formDate(date));
}

// 계산된 속성 (computed)
const totalSum = computed(() => {
  return (state.docExp?.items || []).reduce((sum, item) => {
    return sum + (item.expAmount || 0);
  }, 0);
});

const substituteText = computed(() => {
  return state.docVac?.substitute?.empNm
    ? `${state.docVac.substitute.pstnNm} ${state.docVac.substitute.empNm}`
    : '';
});

const openOrgModal = computed(() => store.state.openOrgModal);

const excludedEmpCds = computed(() => {
  const approverCds = state.approvers.map(a => a.empCd).filter(Boolean);
  const referencerCds = state.referencers.map(r => r.empCd).filter(Boolean);
  const loginUserId = store.state.loginUserId;
  if (state.id === 1) {
    return [loginUserId];
  } else if (state.id === 2 || state.id === 3) {
    return [...new Set([...approverCds, ...referencerCds, loginUserId])];
  }
  return [];
});

// 메서드
const getAllFiles = (files, newFiles) => {
  return [
    ...(Array.isArray(files) ? files : []),
    ...(Array.isArray(newFiles) ? newFiles : [])
  ];
};

const deleteFile = (identifier, idx) => {
  state.docExp.items[idx].files = Array.isArray(state.docExp.items[idx].files)
    ? state.docExp.items[idx].files.filter(file => file.fileCd !== identifier)
    : [];
  state.docExp.items[idx].newFiles = Array.isArray(state.docExp.items[idx].newFiles)
    ? state.docExp.items[idx].newFiles.filter(file => file.name !== identifier)
    : [];
  if (typeof identifier === 'number') state.deletedFileCds.push(identifier);
};

const calculateTotalSize = (files, newFiles) => {
  const totalSize = [
    ...(Array.isArray(files) ? files : []),
    ...(Array.isArray(newFiles) ? newFiles : [])
  ].reduce((sum, file) => sum + (file.size || file.fileSize || 0), 0);
  return formatFileSize(totalSize);
};

const formatFileSize = (size, orSize) => {
  const bytes = size || orSize;
  if (!bytes) return '0KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)}MB`;
};

const getFileIconClass = (file) => {
  const extension = (file.name || file.fileNm || '').split('.').pop().toLowerCase();
  if (['xlsx', 'xls'].includes(extension)) return 'svg-file-ms-excel';
  if (['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) return 'svg-file-receipt';
  return 'svg-file-default';
};

const handleFileUpload = (event, index) => {
  const files = Array.from(event.target.files);
  const totalFileSize = [...state.docExp.items[index].files, ...files].reduce(
    (sum, file) => sum + (file.size || file.fileSize),
    0
  );
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (totalFileSize <= MAX_FILE_SIZE) {
    files.forEach((file) => {
      const extension = file.name.split('.').pop().toLowerCase();
      file.fileType = ['xlsx', 'xls'].includes(extension) ? 'EXCEL' : 'RECEIPT';
      state.docExp.items[index].newFiles = state.docExp.items[index].newFiles || [];
      state.docExp.items[index].newFiles.push(file);
    });
    validateInput('files', index);
  } else {
    alert('허용 용량을 초과합니다.');
  }
};

const formatDate = (date) => {
  return `${date.getFullYear().toString()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const dateText = (date) => {
  return `${date.getFullYear().toString().slice(2)}년 ${date.getMonth() + 1}월`;
};

const changeForm = (type) => {
  state.doc.docType = type;
};

const restrictNegative = (event, index, field) => {
  const rawValue = event.target.value.trim();
  if(rawValue <= 0) {
    state.docExp.items[index][field] = 0;
  }
  validateInput(field, index); // 기존 유효성 검사 호출
}

const addDate = () => {
  state.schedules.push({
    id: Date.now(),
    vacDate: '',
    vacType: '01'
  });
  errors.schedules.push({
    vacDate: '',
    vacType: ''
  })
};

const deleteDate = (idx) => {
  if(state.schedules.length > 1) {
    state.schedules.splice(idx, 1);
  }
};

function findPrevApprover(approvers, index) {
  return approvers.slice(0, index).findLast((approver) => approver.empCd > 0)?.pstnCd;
}

function findPostApprover(approvers, index) {
  return approvers.slice(index + 1).find((approver) => approver.empCd > 0)?.pstnCd ?? null;
}

const submitRequest = async () => {
  const isValid = validateAll();
  if (!isValid) {
    return;
  }
  const formData = new FormData();
  const api = axios.create({
    baseURL: '/document',
    withCredentials: true
  });

  let fileCounter = 0;
  const updatedItems = state.docExp.items.map((item, index) => {
    const files = Array.isArray(item.newFiles) ? item.newFiles : [];
    const fileIndexes = [];
    files.forEach((file) => {
      formData.append('files', file, file.name || `file_${index}`);
      formData.append('fileTypes', file.fileType || 'EXCEL');
      fileIndexes.push(fileCounter++);
    });
    return { ...item, fileIndexes };
  });

  const payload = state.doc.docType === 'VAC' ? {
    doc: state.doc,
    docVac: state.docVac,
    schedules: state.schedules,
    approvers: state.approvers,
    referencers: state.referencers
  } : {
    doc: state.doc,
    docExp: { ...state.docExp, items: updatedItems },
    approvers: state.approvers,
    referencers: state.referencers,
    deletedFileCds: state.deletedFileCds
  };

  formData.append('payload', JSON.stringify(payload));

  try {
    const request = state.doc.docCd
      ? api.put('', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    const res = await request;
    console.log('request success', res);
    if (res.status === 200) {
      alert('신청이 완료되었습니다.');
      store.commit('setMenuState', {
        menu: '전자결재',
        type: 'list'
      });
      store.commit('setSubmenuState', '결재상신함')
      store.commit('setIsApproval', false);
    }
  } catch (error) {
    console.error('Request failed', error);
  }
};

const openOrg = (idVal, idx) => {
  store.commit('setOpenOrgModal', {
    openOrgModal: !store.state.openOrgModal,
    id: null
  });
  state.id = idVal;
  state.index = idx;
};

const handleEmpChange = (idVal, idx, emp) => {
  if (idVal == 1) {
    state.docVac.substitute = emp;
  } else if (idVal == 2) {
    state.approvers[idx] = { ...emp, apOrder: idx + 1 };
    validateInput('approvers', idx)
  } else if (idVal == 3) {
    state.referencers[idx] = emp;
  }
};

const addItem = () => {
  state.docExp.items.push({
    expItemId: 0,
    expMethod: '1000',
    expCount: 0,
    expAmount: 0,
    files: [],
    newFiles: []
  });
  errors.expItems.push({
    expMethod: '',
    expCount: '',
    expAmount: ''
  });
};

const deleteItem = (idx) => {
  if (state.docExp.items.length > 1) {
    state.docExp.items.splice(idx, 1);
    errors.expItems.splice(idx, 1);
  }
};

const addApprovers = () => {
  state.approvers.push({
    empNm: '',
    pstnNm: '',
  });
  errors.approvers.push({
    empNm: '',
    pstnNm: ''
  })
};

const addReferencer = () => {
  state.referencers.push({
    id: Date.now(),
    empNm: '',
    pstnCd: '',
    pstnNm: ''
  });
};

const deleteApprover = (idx) => {
  if(state.approvers.length > 1) {
    state.approvers.splice(idx, 1);
    errors.approvers.splice(idx, 1);
  }
};

const deleteReferencer = (idx) => {
  // const referencer = state.referencers[idx];
  state.referencers.splice(idx, 1);
};

const closeForm = () => {
  if (state.doc.docCd) {
    store.commit('setMenuState', {
      menu: '전자결재',
      type: 'detail',
      docCd: state.doc.docCd
    });
  } else {
    store.commit('setMenuState', {
      menu: '전자결재',
      type: 'list'
    });
  }
};

const closeModal = () => {
  store.commit('setOpenOrgModal', false);
};

// Watch
watch(totalSum, (newSum) => {
  state.docExp.sum = newSum;
});

// Mounted
onMounted(async () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const dateArray = [];
  for (let i = 0; i < 12; i++) {
    dateArray.push(new Date(currentYear, currentMonth - i, 1));
  }
  state.dates = dateArray.reverse();
  state.docExp.expDttm = formatDate(new Date(currentYear, currentMonth, 1));
  state.doc.docType = 'VAC';
  state.docVac.contacts = store.state.loginUser.phnNo;

  if (store.state.docCd) {
    try {
      const res = await axios.get('/document/one', {
        params: { docCd: store.state.docCd }
      });
      console.log('DocumentVacation', res.data);
      state.schedules = res.data.schedules;
      Object.assign(state.doc, res.data.doc);
      Object.assign(state.docVac, res.data.docVac || {});
      state.docVac.substitute = res.data.substitute;
      Object.assign(state.docExp, res.data.docExp);
      state.approvers = res.data.approvers;
      state.referencers = res.data.referencers;
      // errors.expItems도 동기화
      errors.expItems = state.docExp.items.map(() => ({
        expMethod: '',
        expCount: '',
        expAmount: '',
        files: ''
      }));      
      errors.schedules = state.schedules.map(() => ({
        vacDate: '',
        vacType: ''
      }));
      
      console.log(errors.expItems);
      console.log(state.docExp.items);
    } catch (error) {
      console.error('Failed to fetch document', error);
    }
  }
  lastDocTitle.value = state.doc.docTitle;
  lastVacComment.value = state.docVac.vacComment;
  lastContacts.value = state.docVac.contacts;
});
</script>

<style scoped>
/* 상위 컨테이너에 텍스트 선택 방지 적용 */
.container,
.main-content,
.form-card,
.approver-card {
  user-select: none;
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
.row-area {
  display: flex;
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

/* 메인 콘텐츠 */
.main-content {
  max-width: 100%;
  margin: 10px 0;
  padding: 0 10px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* 폼 카드 */
.form-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 1.1;
  min-width: 350px;
}

/* 결재/참조 카드 */
.approver-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 300px;
}

.form-card h2,
.approver-card h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

/* 휴가신청서 폼 */
.vacation-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vacation-form .input-field {
  width: 340px;
}

.substitute {
  caret-color: transparent;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-group {
  width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-asterisk {
  color: red;
  font-size: 14px;
  line-height: 1;
}

.input-group {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 5px;
}

.schedule-row {
  flex: 1;
  flex-wrap: wrap;
}

/* 입력 필드 */
.input-field,
.select-field {
  padding: 6px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}

.info-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.date-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-field > .input-field {
  min-width: 80px;
  flex-grow: 1;
  padding: 6px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.expense-input .input-field,
.expense-input .select-field {
  min-width: 80px;
  flex-grow: 1;
  font-size: 13px;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.input-field[readonly] {
  background: #f4f4f4;
  cursor: not-allowed;
}

.input-file {
  display: none;
}

.file-area {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  height: 100%; /* 부모 높이와 동일 */
  min-height: 100%;
}

/* 버튼 스타일 */
.btn-add,
.btn-delete,
.btn-action {
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add {
  padding: 6px 12px;
  background: #6b7280;
  color: #fff;
}

.btn-add:hover {
  background: #4b5563;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-action {
  padding: 6px 12px;
  background: #6b7280;
  color: #fff;
}

.btn-action:hover {
  background: #4b5563;
}

/* 지출결의서 */
.expense-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
  gap: 15px;
  flex: wrap;
}

.title-field {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 4px;
}

.sum-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expense-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.expense-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.expense-input {
  display: flex;
  flex-wrap: nowrap;
  align-items: center; /* 수직 중앙 정렬 */
  gap: 4px;
  min-width: 0px;
}

.expense-input > span{
  color: #333;
  font-weight: 600;
}



.file-upload {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.option-area {
  flex-direction: column;
}

.button-upload {
  display: inline-block;
  padding: 6px 12px;
  background: #007bff;
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.button-upload:hover {
  background: #0056b3;
}

.description {
  font-size: 11px;
  color: #666;
}

.file-attachments {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-top: 8px;
}

.file-list-header {
  display: flex;
  position: sticky;
  top: 0;
  background: #f8f9fa;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.file-list-header-title {
  flex: 3;
}

.file-list-header-volume {
  flex: 1;
  text-align: center;
}

.file-list-header-task {
  flex: 0.5;
  text-align: right;
}

.file-list {
  height: 70px;
  max-height: 70px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 3;
  gap: 8px;
}

.file-thumbnail {
  width: 18px;
  height: 18px;
}

.svg-file-ms-excel,
.svg-file-receipt,
.svg-file-default {
  display: block;
  width: 100%;
  height: 100%;
  /* background: url('data:image/svg+xml;...') no-repeat center; 실제 SVG 아이콘 URL 추가 필요 */
}

.file-title-wrap {
  flex: 4;
  display: flex;
}

.file-title {
  flex: 3;
  font-size: 12px;
  color: #333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-volume {
  flex: 1;
  font-size: 11px;
  color: #666;
}

.task {
  text-align: right;
}

.button-svg-delete {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 14px;
  cursor: pointer;
}

.button-svg-delete:hover {
  color: #c82333;
}

/* 결재/참조 테이블 */
.approver-table {
  width: 100%;
  border-collapse: collapse;
}

.approver-table td {
  padding: 8px;
  vertical-align: top;
}

.approver-header {
  padding: 8px;
}

.approver-header-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.approver-header-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.approver-content {
  display: flex;
  gap: 15px;
  position: relative;
}

.approver-content::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 10%;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  background-color: #ccc; /* 구분선 색상 */
}

.approver-list-container {
  flex: 1;
}

.approver-list {
  list-style: none;
  padding: 0;
}

.approver-list li {
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 5px;
  gap: 5px;
}

.step-label span{
  vertical-align: sub;
}

.button-group {
  display: flex;
  gap: 6px;
  margin-left: auto;
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

.expense-row {
  display: flex;
  align-items: stretch; /* 자식 요소들이 부모 높이를 채우도록 */
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
  min-height: 120px; /* 최소 높이 설정 */
}

.info-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 내부 요소들 세로로 분배 */
  min-height: 100%;
}

.expense-input {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%; /* .info-area 내에서 전체 너비 사용 */
}

.file-upload {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.file-attachments {
  height: 76px;
  flex-grow: 1; /* 남은 공간 채우기 */
  max-height: none;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-top: 8px;
}

.file-list {
  height: 30px; /* 고정 높이 제거 */
  max-height: none;
  list-style: none;
  padding: 0;
  margin: 0;
}

.btn-delete {
  align-self: flex-end;
  padding: 6px 12px;
  background: #dc3545;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  display: block;
  padding-top: 5px;
}

@media (max-width: 768px) {
  .expense-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    height: auto;
    min-height: 0;
  }

  .info-area {
    height: auto;
    width: 100%;
  }

  .file-area {
    height: auto;
    width: 100%;
  }

  .file-attachments {
    max-height: 150px; /* 모바일에서 스크롤 유지 */
  }

  .btn-delete {
    align-self: flex-start;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
    padding: 10px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .input-field,
  .select-field {
    width: 100%;
  }

  .input-group {
    flex: 1;
    flex-direction: column;
    align-items: stretch;
  }

  .label-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .expense-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .expense-input {
    width: 100%;
    min-width: 0;
  }

  .file-upload {
    flex-direction: column;
    align-items: flex-start;
  }

  .file-list-header {
    display: none;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .file-info {
    flex: none;
    width: 100%;
  }

  .file-title {
    max-width: 100%;
  }

  .task {
    text-align: left;
  }

  .btn-delete {
    align-self: flex-start;
  }

  .approver-header-group {
    flex-direction: column;
    gap: 8px;
  }

  .approver-header-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .approver-content {
    flex-direction: column;
    gap: 10px;
  }
}

.expense-input {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
}

.expense-input > span,
.title-field > span {
  width: 100px;
  white-space: nowrap;
  flex-shrink: 0;
  color: #333;
  font-weight: 600;
}


.input-with-suffix {
  flex-grow: 1;
  position: relative;
  display: inline-flex;
  align-items: center;
}

.input-with-suffix .input-field {
  width: 110px;
  padding-right: 30px; /* 접미사 공간 확보 */
}

.input-with-suffix .suffix {
  position: absolute;
  right: 8px;
  font-size: 13px;
  color: #666;
  pointer-events: none;
}

@media (max-width: 768px) {
  .expense-input {
    width: 100%;
    flex-direction: row;
    align-items: center;
  }

  .input-with-suffix .input-field {
    width: 100%;
    min-width: 0;
  }
}
</style>