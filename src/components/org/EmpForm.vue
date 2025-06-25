<template>
    <form @submit.prevent="confirmInfo" class="empForm">
      <div class="form-group">
        <label for="profile">프로필</label>
        <div class="preview-container" @click="triggerFileInput">
          <img :src="previewUrl || defaultImg" alt="preview" class="user-profile-img">
          <div class="placeholder">
            <span class="plus-icon">프로필 선택</span>
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          id="profile"
          name="profile"
          accept="image/*"
          @change="handleFileChange"
          class="hidden-input"
        />
      </div>
      <div class="form-group">
        <label for="empNm">이름</label>
        <input
          type="text"
          id="empNm"
          ref="empNmInput"
          v-model="emp.empNm"
          @input="validateEmpNm($event, emp)"
          placeholder="이름 (최대 40자)"
          aria-label="사원 이름"
          :aria-invalid="v$.empNm.$error"
        />
        <span v-if="v$.empNm.$error" class="error" role="alert">{{
          v$.empNm.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="loginId">로그인ID</label>
        <input
          type="text"
          id="loginId"
          v-model="emp.loginId"
          readonly
          aria-label="로그인 ID (읽기 전용)"
          :aria-invalid="v$.loginId.$error"
          style="caret-color: transparent;"
        />
        <span v-if="v$.loginId.$error" class="error" role="alert">{{
          v$.loginId.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="department">부서</label>
        <select
          name="department"
          id="department"
          v-model="emp.dptCd"
          aria-label="부서 선택"
          :aria-invalid="v$.dptCd.$error"
        >
          <option v-for="dpt in dptList" :key="dpt.dptCd" :value="dpt.dptCd">
            {{ dpt.dptNm }}
          </option>
        </select>
        <span v-if="v$.dptCd.$error" class="error" role="alert">{{
          v$.dptCd.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="pstnNm">직급</label>
        <select
          id="pstnNm"
          v-model="emp.pstnCd"
          aria-label="직급 선택"
          :aria-invalid="v$.pstnCd.$error"
        >
          <option v-for="pstn in pstnList" :key="pstn.pstnCd" :value="pstn.pstnCd">
            {{ pstn.pstnNm }}
          </option>
        </select>
        <span v-if="v$.pstnCd.$error" class="error" role="alert">{{
          v$.pstnCd.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="phnNo">연락처</label>
        <input
          ref="phnNoInput"
          type="tel"
          id="phnNo"
          :value="formattedPhnNumber"
          @input="validateContacts"
          @keypress="restrictNonNumeric"
          placeholder="전화번호 ( '-' 없이 입력)"
          aria-label="연락처"
          :aria-invalid="v$.phnNo.$error"
        />
        <span v-if="v$.phnNo.$error" class="error" role="alert">{{
          v$.phnNo.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="birthDate">생년월일</label>
        <input
          ref="birthDateInput"
          type="date"
          id="birthDate"
          v-model="emp.birthDate"
          aria-label="생년월일"
          :aria-invalid="v$.birthDate.$error"
          :max="currentDate"
        />
        <span v-if="v$.birthDate.$error" class="error" role="alert">{{
          v$.birthDate.$errors[0].$message
        }}</span>
      </div>
      <div class="form-group">
        <label for="hireDate">입사일</label>
        <input
          ref="hireDateInput"
          type="date"
          id="hireDate"
          v-model="emp.hireDate"
          aria-label="입사일"
          :aria-invalid="v$.hireDate.$error"
        />
        <span v-if="v$.hireDate.$error" class="error" role="alert">{{
          v$.hireDate.$errors[0].$message
        }}</span>
      </div>
      <div class="btnArea">
        <button type="submit" class="btn-primary" aria-label="저장">저장</button>
        <button
          type="button"
          @click="cancel"
          class="btn-secondary"
          aria-label="취소"
        >
          취소
        </button>
      </div>
    </form>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { helpers, minLength, required } from "@vuelidate/validators";
import store from "@/store";
import defaultImg from '@/assets/default.png';
const emit = defineEmits(['saved', 'cancel']);

const emp = reactive({
  profilePath: null,
  empNm: '',
  loginId: null,
  password: null,
  dptCd: null,
  dptNm: '',
  pstnCd: null,
  pstnNm: '',
  phnNo: '',
  birthDate: null,
  hireDate: null,
});
const dptList = ref([]);
const pstnList = ref([]);
const selectedEmpCd = computed(() => store.state.selectedEmpCd);
const isEdit = computed(() => !!store.state.selectedEmpCd);
const currentDate = computed(() => `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
const empNmInput = ref(null);
const phnNoInput = ref(null);
const birthDateInput = ref(null);
const hireDateInput = ref(null);
const rules = {
  empNm: {
    required: helpers.withMessage('이름을 입력하세요.', required),
  },
  loginId: {
    required: helpers.withMessage('아이디를 입력하세요.', required),
  },
  dptCd: {
    required: helpers.withMessage('부서를 선택하세요.', required),
  },
  pstnCd: {
    required: helpers.withMessage('직급을 선택하세요.', required),
  },
  phnNo: {
    required: helpers.withMessage('연락처를 입력하세요.', required),
    minLength: helpers.withMessage('연락처는 최소 10자 이상이어야 합니다.', minLength(10)),
  },
  birthDate: {
    required: helpers.withMessage('생일을 선택하세요.', required),
  },
  hireDate: {
    required: helpers.withMessage('입사일을 선택하세요.', required),
  },
};
const v$ = useVuelidate(rules, emp);

onMounted(async () => {
  await fetchLoginId();
  console.log('emp!!: ', emp);
  await fetchDptList();
  console.log('typeof(emp.dptCd): ', typeof(emp.dptCd));
        console.log('emp.dptNm!: ', emp.dptNm);

  console.log('emp!!!: ', emp);
  await fetchPstnList();
  console.log('emp!!!!: ', emp);
  await fetchEmpDetail();
    console.log('typeof(emp.dptCd): ', typeof(emp.dptCd));

  console.log('emp!!!!!: ', emp);
  empNmInput.value.focus();
});
function restrictNonNumeric(event) {
  const charCode = event.charCode || event.keyCode;
  if(charCode < 48 || charCode > 57) {
    event.preventDefault();
    alert('연락처는 숫자만 입력 가능합니다.');
  }
}
let lastContactsValue = '';
let lastPhnNo = null;
function validateContacts(event) {
  let rawInput = event.target.value;
  emp.phnNo = rawInput.replace(/[^0-9]/g, '');
  
  if(emp.phnNo.length > 11) {
    alert('연락처는 11자를 입력해주세요.');
    emp.phnNo = lastPhnNo;
    console.log('lastPhnNo: ', lastPhnNo);
    console.log('emp.phnNo: ', emp.phnNo);
    event.target.value = formattedPhnNo(emp.phnNo); // 입력 필드에 숫자만 반영
    return false;
  }
  lastContactsValue = formattedPhnNo(emp.phnNo);
  lastPhnNo = emp.phnNo;
}

function formattedPhnNo(value) {
  console.log('formattedPhnNo: ', emp.phnNo);
  
  if(value.length > 7) {
    return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  } else if(value.length > 3) {
    return `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    return value;
  }
}

const formattedPhnNumber = computed(() => {
  console.log('emp.phnNo2: ', emp.phnNo);
  
  const value = emp.phnNo;
  if(value.length > 7) {
    return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  } else if(value.length > 3) {
    return `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    return value;
  }
})

let lastValidValue = ''; // 이전 유효한 값 저장

function validateEmpNm(event, emp) {
  const input = event.target;
  const maxLength = 40;
  if(input.isComposing || event.isComposing) return;

  // 특수문자 제거 (영문, 한글만 허용)
  let validValue = input.value.replace(/[^a-zA-Z가-힣]/g, '');

  if(input.value !== validValue) {
    console.log(input.value);
    console.log(validValue);
    alert('유효하지 않은 입력값입니다.');
    emp.empNm = validValue;
    return false;
  }
  // 40자 초과 시 이전 값 복원
  if (validValue.length > maxLength) {
    alert('이름은 40자를 초과할 수 없습니다.');
    emp.empNm = lastValidValue;
    return false;
  }

  // 유효한 경우 동기화
  emp.empNm = validValue;
  lastValidValue = validValue;
  return true;
}

async function fetchLoginId() {
  const res = await axios.get('/emp/login/id')
  emp.loginId = res.data;
}

async function fetchDptList() {
  const res = await fetch('/dpt/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json();

  dptList.value = data;
  emp.dptCd = data[0].dptCd;
  emp.dptNm = data[0].dptNm;
}

async function fetchPstnList() {
  const res = await axios.get('/pstn/list');
  pstnList.value = res.data.reverse();
  emp.pstnCd = pstnList.value[0].pstnCd;
}

async function fetchEmpDetail() {
  if (selectedEmpCd.value) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const res = await axios.get('/emp/detail/' + selectedEmpCd.value);
    Object.assign(emp, res.data);
    console.log('res.data: ', res.data);
    previewUrl.value = emp.previewUrl;
    lastPhnNo = emp.phnNo || '';
  }
}

const previewUrl = ref(null);

function handleFileChange(event) {
  const file = event.target.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = e => previewUrl.value = e.target.result;
    reader.readAsDataURL(file);
  } else {
    previewUrl.value = null;
  }
}

const fileInput = ref(null);
function triggerFileInput(event) {
  fileInput.value.click();
}

const validateSumbmit = () => {
  if(!emp.empNm.trim()) {
    alert('이름을 입력해주세요.');
    empNmInput.value.focus();
    return false;
  }

  if(emp.empNm != emp.empNm.trim()) {
    alert('이름 앞뒤에는 공백을 입력할 수 없습니다.');
    empNmInput.value.focus();
    return false;
  }

  if(!emp.phnNo.trim()) {
    alert('연락처를 입력해주세요.');
    phnNoInput.value.focus();
    //여기부터
    return false;
  }

  if(emp.phnNo.length != 11) {
    alert('연락처는 11자를 입력해주세요.');
    phnNoInput.value.focus();
    return false;
  }

  if(!emp.birthDate) {
    alert('생년월일을 입력해주세요.');
    birthDateInput.value.focus();
    return false;
  }
  
  if(!emp.hireDate) {
    alert('입사일을 입력해주세요.');
    hireDateInput.value.focus();
    return false;
  }

  return true;
}

async function confirmInfo() {
  // const isValid = await v$.value.$validate();
  const isValid = await validateSumbmit();
  if (isValid) {
    console.log('emp!: ', emp);
    emp.previewUrl = null;
    const formData = new FormData();
    Object.entries(emp).forEach(([key, value]) => {
      console.log(key, value);
      formData.append(key, value ?? '');
    });
    console.log(fileInput.value.files[0]);
    formData.append('profile', fileInput.value.files[0] ?? null);
    // formData.append('pstnNm', emp.pstnNm);
    console.log('formData', formData);
    console.log('formData' + formData);
    const request = isEdit.value
      ? axios.put('/emp', formData)
      : axios.post('/emp', formData);
    request.then((res) => {
      store.commit('setOpenOrgFormModal', false);
      if(isEdit.value) {
        emit('edited');
      } else {
        emit('saved');
      }
    });
  }
}

function cancel() {
  store.commit('setOpenOrgFormModal', false);
  if(selectedEmpCd.value) {
    store.commit('setOpenOrgDetailModal', true);
  }
}

watch(
  () => [emp.pstnCd, emp.dptCd],
  ([newPstnCd, newDptCd], [oldPstnCd, oldDptCd]) => {
    emp.pstnNm = pstnList.value.find((pstn) => pstn.pstnCd === newPstnCd)?.pstnNm ?? '';
    emp.dptNm = dptList.value.find((dpt) => dpt.dptCd === newDptCd)?.dptNm ?? '';
  }
)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
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

.empForm {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #343a40;
}

.form-group input,
.form-group select {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #007bff;
}

.form-group input[readonly] {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-group input[aria-invalid="true"],
.form-group select[aria-invalid="true"] {
  border-color: #e74c3c;
}

.error {
  color: #e74c3c;
  font-size: 12px;
}

.btnArea {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #007bff; /* 전자결재 블루 */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  background: #fff;
  border: 1px solid #d1d3e2;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.user-profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
}

.plus-icon {
  font-weight: bold;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .emp-container {
    padding: 10px;
  }

  .empForm {
    max-width: 100%;
    padding: 15px;
  }

  .form-group input,
  .form-group select {
    font-size: 12px;
    padding: 8px;
  }

  .btnArea {
    flex-direction: column;
    gap: 8px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
}
</style>