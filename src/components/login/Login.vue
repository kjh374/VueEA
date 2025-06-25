<template>
  <div class="login-container">
    <div class="logoArea">
      <a href="#" @click.prevent="goToMain">
        <img src="https://mail.credif.co.kr/admin/logo_view.php" alt="전자결재 로고" />
      </a>
    </div>
    <div class="loginArea">
      <form class="login-form" @submit.prevent="loginSubmit" aria-labelledby="login-title">
        <h2 id="login-title">로그인</h2>
        <div class="input-group">
          <label for="loginId" class="sr-only">아이디</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              ref="loginIdInput"
              id="loginId"
              v-model="loginId"
              type="text"
              placeholder="ID"
              aria-label="아이디 입력"
              required
            />
          </div>
        </div>
        <div class="input-group">
          <label for="password" class="sr-only">비밀번호</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
              aria-label="비밀번호 입력"
              required
            />
          </div>
        </div>
        <button type="submit" class="login-button">로그인</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    // const loginIdInput = ref(null);

    // onMounted(() => {
    //   loginIdInput.value.focus();
    // })
    return {
      store,
      // loginIdInput
    };
  },
  data() {
    return {
      loginId: '',
      password: '',
    };
  },
  methods: {
    loginSubmit() {
      let userInfo = {};
      userInfo.loginId = this.loginId;
      userInfo.password = this.password;

      axios
        .post(
          '/emp/login',
          JSON.stringify(userInfo),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        )
        .then((res) => {
          console.log('성공', res);
          if (res.data.success) {
            console.log('로그인 성공');
            this.$emit('login-success');
            this.store.commit('setUserName', res.data.userName);
            this.store.commit('setIsAdmin', res.data.isAdmin);
            this.store.commit('setLoginUserId', res.data.empCd);
            this.store.commit('setLoginUser', res.data.loginUser);
            this.store.commit('setIsLoggedIn', true);
            this.store.commit('setShowApplication', false);
            this.store.commit('setShowDocumentVacation', false);
            this.store.commit('setShowDocumentList', false);
            this.store.commit('setShowSidebar', false);
            this.store.commit('setShowOrgMng', false);
            this.store.commit('setMenuState', { menu: '전자결재', type: 'list' });
            this.store.commit('setSubmenuState', '결재수신함');
            this.store.commit('setIsApproval', true);
          } else {
            alert(res.data.message);
            this.password = '';
          }
        })
        .catch((error) => {
          if(error.response && error.response.status === 401) {
            alert(error.response.data.message || '로그인에 실패했습니다.');
            this.password = '';
          }
        });
    },
    goToMain() {
      window.location.href = '/'; // 메인 페이지로 리다이렉트
    },
  },
  mounted() {
    this.$refs.loginIdInput.focus();
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* 전체 화면 중앙 정렬 */
  padding: 20px;
}

.logoArea {
  margin-bottom: 40px;
}

.logoArea img {
  max-height: 60px; /* 로고 크기 */
  cursor: pointer;
}

.logoArea a {
  text-decoration: none;
}

.loginArea {
  width: 100%;
  max-width: 400px; /* 폼 최대 너비 */
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 입력 필드 간격 */
}

.login-form h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: #666666;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px; /* 아이콘 공간 확보 */
  font-size: 16px;
  border: 1px solid #d1d3e2;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input:focus {
  border-color: #357abd;
  box-shadow: 0 0 0 3px rgba(53, 122, 189, 0.2);
}

input::placeholder {
  color: #999999;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  background: #357abd;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.login-button:hover {
  background: #2a6099;
}

.login-button:active {
  transform: scale(0.98);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .loginArea {
    max-width: 90%;
    padding: 20px;
  }

  .logoArea img {
    max-height: 50px;
  }

  .login-form h2 {
    font-size: 20px;
  }

  input {
    padding: 10px 10px 10px 36px;
    font-size: 14px;
  }

  .login-button {
    padding: 12px;
    font-size: 16px;
  }
}
</style>