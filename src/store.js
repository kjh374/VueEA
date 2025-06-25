import { createStore } from 'vuex';

export default createStore({
    state: {
        userName: '',
        isAdmin: false,
        loginUserId: 0,
        empCd: 0,
        isLoggedIn: false,
        showOrgMng: false,
        showSidebar: false,
        docCd: 0,
        options: [],
        subTitle: '',
        showLeaveMng: false,
        showList: false,
        showForm: false,
        showDetail: false,
        activeComponent: null,
        showDocApproval: false,
        openOrgModal: false,
        submenu: false,
        ids: [],
        loginUser: {},
        menu: '',
        isApproval: false,
        selectedEmpCd: '',
        openOrgFormModal: false,
        openOrgDetailModal: false
    },
    mutations: {
        setLoginUser(state, loginUser) {
            state.loginUser = loginUser;
        },
        setIsLoggedIn(state, isLoggedIn) {
            state.isLoggedIn = isLoggedIn;
        },
        setUserName(state, userName) {
            state.userName = userName;
        },
        setIsAdmin(state, isAdmin) {
            state.isAdmin = isAdmin;
        },
        setEmpCd(state, empCd) {
            state.empCd = empCd;
        },
        setLoginUserId(state, loginUserId) {
            state.loginUserId = loginUserId
        },
        setShowOrgMng(state, showOrgMng) {
            state.showOrgMng = showOrgMng;
        },
        setShowDocumentList(state, payload) {
            if(typeof payload == 'object') {
                state.showDocumentList = payload.showDocumentList;
                state.options = payload.options;
            } else {
                state.showDocumentList = payload.showDocumentList;
            }
        },
        setShowApplication(state, showApplication) {
            state.showApplication = showApplication;
        },
        setShowDocumentVacation(state, payload) {
            state.showDocumentVacation = payload.showDocumentVacation;
            state.docCd = payload.docCd;
        },
        setShowSidebar(state, showSidebar) {
            state.showSidebar = showSidebar;
        },
        setOpenOrgModal(state, payload) {
            state.openOrgModal = payload.openOrgModal;
            state.ids.push(payload.id);
        },
        setOpenOrgFormModal(state, payload) {
            state.openOrgFormModal = payload;
        },
        setOpenOrgDetailModal(state, payload) {
            state.openOrgDetailModal = payload;
        },
        setMenuState(state, payload) {
            state.showOrgMng = false;
            state.showDocApproval = false;
            state.showSidebar = false;
            state.showLeaveMng = false;
            state.showList = false;
            state.showForm = false;
            state.showDetail = false;
            state.openOrgModal = false;
            state.docCd = 0;
            state.ids = [];
            state.menu = payload.menu;
            
            switch(payload.menu) {
                case '전자결재':
                    state.showDocApproval = true;
                    switch (payload.type) {
                        case 'list':
                            state.showList = true;
                            state.subTitle = '문서목록';
                            break;
                        case 'write':
                            state.showForm = true;
                            state.subTitle = '문서작성';
                            break;
                        case 'detail':
                            state.showDetail = true;
                            state.subTitle = '문서상세';
                            state.docCd = payload.docCd;
                            break;
                        case 'update':
                            state.showForm = true;
                            state.subTitle = '문서수정';
                            state.docCd = payload.docCd;
                            break;
                        default:
                            break;
                    }
                    break;
                case '인사관리':
                    state.showOrgMng = true;
                    switch (payload.type) {
                        case 'list':
                            state.showList = true;
                            state.subTitle = '사원목록';        
                            break;
                        default:
                            break;
                    }
                    break;
                case '연차관리':
                    state.showLeaveMng = true;
                    switch (payload.type) {
                        case 'list':
                            state.showList = true;
                            state.subTitle = '연차목록';
                            break;
                        case 'write':
                            state.showForm = true;
                            state.subTitle = '연차등록';
                            break;
                        case 'detail':
                            state.showDetail = true;
                            state.subTitle = '연차정보';
                            break;
                        case 'update':
                            state.showForm = true;
                            state.subTitle = '연차수정';
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    state.subTitle = '';
                    break;
            }
        },
        setSubmenuState(state, submenu) {
            state.submenu = submenu;
        },
        setActiveComponent(state, component) {
            state.activeComponent = component;
        },
        setIsApproval(state, payload) {
            state.isApproval = payload;
        },
        setSelectedEmpCd(state, payload) {
            state.selectedEmpCd = payload;
        }
    },
    getters: {
        submenu: state => state.submenu
    },
    actions: {
        
    }
})