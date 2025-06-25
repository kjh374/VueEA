<template>
    <div class="mainHeader">
        <div class="no-padding"><a href="#" @click.prevent="moveMain"><img src="https://mail.credif.co.kr/admin/logo_view.php"/></a></div>
        <div id="userBanner">
            <span v-if="!isLoggedIn">
                <a href="#" @click.prevent="login" >로그인</a>
            </span>
            <span v-else>
                <!-- <a href="#">{{ userName }} 님 환영합니다.</a> -->
                <span>{{ userName }} 님 환영합니다.</span>
                <a href="#" @click.prevent="logout">로그아웃</a>
            </span>
        </div>
    </div>
    <div id="banner">
        <div class="banner-menu" v-for="menu in filteredMenus" :key="menu.name" @mouseleave="hideSubmenu">
            <a href="#" @click.prevent="selectMenu(menu.name)" @mouseover="showSubmenu(menu.name)" >{{ menu.name }}</a>
            <div v-if="menu.submenu && activeSubmenu === menu.name" class="submenu">
                <a v-for="submenu in menu.submenu" :key="submenu" href="#" @click.prevent="selectSubmenu(menu.name, submenu)">{{ submenu }}</a>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
    setup() {
        const activeSubmenu = ref('');
        const menus = ref([
            { 
                name: '전자결재',
                submenu: ['결재수신함', '결재상신함']
            },
            { name: '인사관리' },
            { name: '연차관리' },
            { name: '공지사항' },
        ]);
        const store = useStore();
        const userName = computed(() => store.state.userName);
        const isLoggedIn = computed(() => store.state.isLoggedIn);
        const filteredMenus = computed(() => {
            const isAdmin = store.state.isAdmin;
            if (isAdmin) {
                return menus.value;
            }
            return menus.value.filter((menu) => menu.name !== '인사관리' && menu.name !== '연차관리');
        });

        return {
            activeSubmenu,
            menus,
            filteredMenus,
            store,
            userName,
            isLoggedIn,
        };
    },
    methods: {
        moveMain() {
            this.store.commit('setMenuState', {menu: '전자결재', type: 'list'});
            this.store.commit('setSubmenuState', '결재수신함')
        },
        showSubmenu(menu) {
            this.activeSubmenu = menu;
        },
        hideSubmenu() {
            this.activeSubmenu = '';
        },
        selectSubmenu(menu, submenu) {
            this.store.commit('setMenuState', { menu: menu, type: 'list' });
            this.store.commit('setSubmenuState', submenu);
            this.store.commit('setIsApproval', submenu === '결재수신함');

        },
        selectMenu(menu) {
            this.store.commit('setMenuState', { menu: menu, type: 'list' });
        },
        logout() {
            axios.get('/emp/logout', {
                withCredentials: true,
            })
            .then((res) => {
                console.log('logout success');
                this.store.commit('setIsLoggedIn', false);
                this.store.commit('setLoginUserId', 0);
                this.store.commit('setIsAdmin', false);
                this.store.commit('setMenuState', {});
            });
        },
    },
};
</script>

<style scoped>
/* 전체 컨테이너 */
.mainHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 로고 */
.no-padding img {
    max-width: 150px;
    height: auto;
}

/* 사용자 배너 */
#userBanner {
    font-size: 14px;
    color: #333;
}

#userBanner span {
    margin-right: 20px;
}

#userBanner a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
}

#userBanner a:hover {
    color: #0033a0;
}

#userBanner a:not(:last-child)::after {
    content: ' | ';
    color: #ccc;
    margin: 0 5px;
}

/* 메뉴 배너 */
#banner {
    display: flex;
    justify-content: space-evenly;
    background-color: #f8f9fa;
    padding: 10px 0;
    border-bottom: 1px solid #e0e0e0;
}

/* 메뉴 항목 */
.banner-menu {
    position: relative;
    padding: 12px 20px;
    transition: background-color 0.3s ease;
}

.banner-menu > a {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease;
}

.banner-menu > a:hover {
    color: #0055cc;
}

/* 호버 시 밑줄 애니메이션 */
.banner-menu > a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: #0055cc;
    transition: width 0.3s ease;
}

.banner-menu > a:hover::after {
    width: 100%;
}

/* 서브메뉴 */
.submenu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    z-index: 100;
    opacity: 0;
    transform: translateY(-10px);
    visibility: hidden;
    transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
}

.banner-menu:hover .submenu {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
}

.submenu a {
    display: block;
    padding: 10px 20px;
    font-size: 14px;
    color: #333;
    text-decoration: none;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.submenu a:hover {
    background-color: #f1f3f5;
    color: #0055cc;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    #banner {
        flex-direction: column;
        align-items: center;
    }

    .banner-menu {
        width: 100%;
        text-align: center;
    }

    .submenu {
        position: static;
        box-shadow: none;
        border-radius: 0;
        background-color: #f1f3f5;
    }
}
</style>