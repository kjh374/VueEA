<template>
    <div class="buttonClass">
        <button>양식 추가</button>
        <button>양식 삭제</button>
    </div>
    <input class="search" placeholder="검색어 입력 후 엔터"/>
    <select>
        <option v-for="item in items">{{ item }}</option>
    </select>
    <table>
        <thead>
            <tr>
                <td><input type="checkbox"></td>
                <td>번호</td>
                <td>사용여부</td>
                <td>문서양식</td>
                <td>작성일</td>
            </tr>    
        </thead>
        <tbody>
            <tr v-for="(item, i) in items">
                <td><input type="checkbox"></td>
                <td>{{ num[i] }}</td>
                <td>{{ isUse[i] }}</td>
                <td>{{ form[i] }}</td>
                <td>{{ rgstDate[i] }}</td>
            </tr>
        </tbody>
    </table>


</template>

<script>
export default {
    components: {
    },
    data() {
        return {
            items: ['a', 'b', 'c', 'd', 'e'],
            num: [1, 2, 3, 4, 5],
            isUse: [1, 0, 0, 0, 1],
            form: ['A', 'B', 'C', 'D', 'E'],
            rgstDate: [1, 2, 3, 4 , 5]
        }
    }
}
</script>

<style>

</style>