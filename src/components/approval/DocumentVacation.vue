<template>
    <div class="container">
        <header @click="changeForm">휴가신청서</header>
        <header @click="changeForm">지출결의서</header>
    </div>
    <div>
        <div v-show="isVacation">
            <div>
                <header>휴가일자</header>
                <ol>
                    <li v-for="(schedule, index) in schedules" :key="index">{{ schedule }}</li>
                </ol>
            </div>
            <div>
                <header>업무대체자</header>
                <span>{{ replace }}</span>
            </div>
            <div>
                <header>비상연락망</header>
                <span>{{ contacts }}</span>
            </div>
            <div>
                <header>사유</header>
                <span>{{ comment}}</span>
            </div>
            <div>
                <header>증빙자료</header>
                <span>{{ proofFile }}</span>
            </div>
        </div>

        <table>
            <tr>
                <td>
                    <span>결재선</span>
                    <ul>
                        <li>a</li>
                        <li>a</li>
                        <li>a</li>
                        <li>a</li>
                    </ul>
                </td>
                <td>
                    <span>참조선</span>
                    <ul>
                        <li>a</li>
                        <li>a</li>
                    </ul>
                </td>
            </tr>
            
        </table>
        <button @click="submitCancel">상신취소</button>
    </div>

    <div class="expenditure">
        <div>
            
        </div>
    </div>

    <div class="listModal">

    </div>
</template>

<script>
import axios from 'axios';
import Header from '../Header.vue'
import EmpListVue from './OrgModal.vue';

export default {
  components: { Header, EmpListVue },
  data() {
    return {
        isVacation: true,
        dates: [],
        vacDate:'',
        category:'',
        name: '',
        position: '',
        schedules: [],
        empCd: 0,
        replace: '',
        dptCd: 1000,
        contacts: '',
        comment: '',
        openEmpList: false,
        list: [],
        proofFile: '',
        dvId: 0
    };
  },
  computed: {
    nameCard() {
        if(this.name && this.position) {
            return this.name + '(' + this.position + ')';
        }
    },
    changeDvId() {
        return this.dvId = this.$store.state.dvId;
    }
  },
  methods: {
    changeForm() {
        this.isVacation = !this.isVacation;
        console.log(this.isVacation);
    },
    addDate() {
        this.dates.push({
            id: Date.now(),
        })
    },
    submitCancel() {
        // const application = {
        //     vacDate: this.vacDate.toString().replace(/-/g,'')+this.category,
        //     empCd: this.empCd,
        //     contacts: this.contacts,
        //     comment: this.comment
        // };

        // axios.post('/document/request', JSON.stringify(application), {
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     withCredentials: true
        // }).then((res) => {
        //     console.log('request success', res);
        //     if(res.status == 200) {

        //     }
        // });


    },
    openOrg() {
        this.openEmpList = true;
        axios.get('/emp/list', {
            params: {dptCd: this.dptCd}, 
            withCredentials: true
        }).then((res) => {
            this.list = res.data.doc.list;
        })
    },
    handleEmpChange(name, id, position) {
        console.log(name, id, '!!!!!!!!!!!!!!');
        this.name = name;
        this.empCd = id;
        this.position = position;
    }
  },
  created() {
    this.dvId = this.changeDvId;
    console.log(this.dvId);
    axios.get('/document/one', {
        params: {
            'id': this.dvId
        }
    }).then((res) => {
        console.log('DocumentVacation', res);
        this.schedules = res.data.doc.vacDate;
        this.contacts = res.data.doc.contacts;
        this.replace = res.data.doc.empCd;
        this.comment = res.data.doc.comment;
        this.proofFile = res.data.doc.proofFile;
    })
  }
}
</script>

<style>
.container {
    display: flex;
}
</style>