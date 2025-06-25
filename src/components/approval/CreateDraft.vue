<template>
    <header class="header">{{ header }}</header>
    <div class="buttonContainer">
        <span><a href="#">결재요청</a></span>
        <span><a href="#">취소</a></span>
    </div>
    <div class="body">
        <div>
            <div>
                <label for="title">제목</label><input id="title"/>
            </div>
            <div>
                <label>파일첨부</label><button>양식 불러오기</button>
            </div>
            <div>문서영역</div>
        </div>
        <div class="line">
            <div>결재선</div>
            <div>결재자1</div>
            <div>결재자2</div>
            <div>결재자3</div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            category: '전자결재',
            header: '기안서'
        }
    }
}
</script>
<style scoped>
.category {
    border-bottom: 1px solid gainsboro;
    padding-bottom: 5px;
    font-size: 30px;
}
.body {
    display: flex;
}
.line {
    margin-left: 10px;
    padding-left: 10px;
    border-left: 1px solid;
}
.buttonContainer {
    text-align: right;
}
.header {
    font-size: 25px;
}

</style>