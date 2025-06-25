<!-- SidebarVue.vue -->
<template>
  <aside class="sidebar">
    <button class="newDraft" :class="{ active: activeTab === 'application' }" @click="openApplication">
      기안서 작성
    </button>
    <ul>
      <li
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
        <span v-if="tab.id === 'reference' && noRead > 0" class="badge">{{ noRead }}</span>
      </li>
    </ul>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  name: 'Sidebar',
  data() {
    return {
      noRead: 0,
      tabs: [
        { id: 'submission', label: '결재 상신함' },
        { id: 'pending', label: '결재 진행함' },
        { id: 'finished', label: '결재 완료함' },
        { id: 'received', label: '결재 수신함' },
        { id: 'approval', label: '수신결재' },
        { id: 'history', label: '결재내역' },
        { id: 'reference', label: '수신참조' },
      ],
    };
  },
  computed: {
    ...mapState(['activeTab']),
  },
  methods: {
    selectTab(tabId) {
      this.$store.commit('setActiveTab', tabId);
      if (tabId === 'application') {
        this.openApplication();
      } else if (tabId === 'pending') {
        this.openPendingDocuments();
      } else if (tabId === 'finished') {
        this.openFinishedDocuments();
      } else {
        // 다른 탭에 대한 동작 추가
        this.$store.commit('setShowDocumentList', { showDocumentList: true, options: [tabId] });
      }
    },
    openApplication() {
      this.$store.commit('setActiveTab', 'application');
      this.$store.commit('setShowApplication', true);
    },
    openPendingDocuments() {
      this.$store.commit('setActiveTab', 'pending');
      this.$store.commit('setMenuState', { menu: '전자결재', type: 'list' });
      this.$store.commit('setSubmenuState', '상신문서함');
      this.$store.commit('setShowDocumentList', { showDocumentList: true, options: ['대기', '진행'] });
    },
    openFinishedDocuments() {
      this.$store.commit('setActiveTab', 'finished');
      this.$store.commit('setMenuState', { menu: '전자결재', type: 'list' });
      this.$store.commit('setSubmenuState', '상신문서함');
      this.$store.commit('setShowDocumentList', { showDocumentList: true, options: ['완료'] });
    },
    // count() {
    //   axios.get('/document/count').then((res) => {
    //     this.noRead = res.data.noRead || 0; // 서버에서 수신참조 미확인 수 반환
    //   });
    // },
  },
  // mounted() {
  //   this.count(); // 컴포넌트 마운트 시 미확인 수 가져오기
  // },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: #f4f4f4;
  padding: 10px;
}
.newDraft {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
.newDraft.active {
  background: #0056b3;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 10px;
  cursor: pointer;
}
li.active {
  background: #007bff;
  color: white;
}
.badge {
  background: red;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 5px;
}
</style>