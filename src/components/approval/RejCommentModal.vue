<template>
    <div class="reject-modal">
        <div class="title">
        <span>반려 사유</span>
        </div>
        <div class="content-container">
        <textarea
            ref="textareaRef"
            v-model="comment"
            class="input-field"
            placeholder="반려 사유를 입력하세요"
            rows="5"
        ></textarea>
        </div>
        <div class="button-container">
        <button @click="transferComment" class="btn-primary">확인</button>
        <button @click="emit('closeModal')" class="btn-secondary">취소</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const comment = ref('');
const textareaRef = ref(null);
const emit = defineEmits(['input-success', 'cancel']);

function transferComment() {
    if (!comment.value.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
    }
    emit('input-success', comment.value);
comment.value = ''; // 입력값 초기화
}

// 모달 열릴 때 textarea에 포커스
onMounted(() => {
    textareaRef.value.focus();
});
</script>

<style scoped>
/* 모달 컨테이너 */
.reject-modal {
display: flex;
flex-direction: column;
gap: 15px;
}

/* 제목 */
.title {
font-size: 18px;
font-weight: 600;
color: #333;
text-align: left;
}

.title span {
user-select: none; /* 텍스트 선택 방지 */
}

/* 텍스트 입력 영역 */
.content-container {
display: flex;
flex-direction: column;
}

.input-field {
font-size: 14px;
border: 1px solid #e0e0e0;
border-radius: 4px;
resize: vertical;
min-height: 100px;
transition: border-color 0.2s;
}

.input-field:focus {
outline: none;
border-color: #4a90e2;
box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}

.input-field::placeholder {
color: #999;
}

/* 버튼 컨테이너 */
.button-container {
display: flex;
justify-content: flex-end;
gap: 10px;
}

/* 버튼 스타일 */
.btn-primary,
.btn-secondary {
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
border: none;
border-radius: 4px;
cursor: pointer;
transition: background 0.2s;
}

.btn-primary {
background: #4a90e2;
color: #fff;
}

.btn-primary:hover {
background: #357abd;
}

.btn-secondary {
background: #f4f4f4;
color: #333;
border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
background: #e0e0e0;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
.reject-modal {
    gap: 12px;
}

.title {
    font-size: 16px;
}

.input-field {
    font-size: 13px;
    min-height: 80px;
}

.btn-primary,
.btn-secondary {
    padding: 7px 14px;
    font-size: 13px;
}
}
</style>