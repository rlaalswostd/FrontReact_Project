
// 파일명 : src / reducers / CommonReuder.js

const initialState = {
    logged : false,
    token : '',
    menu : 1,
    counter : 1000,
};

// 한 사람이 바꾸면 다 바뀌는 공통변수

const CommonReuder = (state = initialState, action) => {
    // 바꾸는 동작1
    // dispatch({type: 'login', 'token' : '실제토큰'})
    if(action.type ==='login'){
        sessiobnStorage.setItem("TOKEN", action.token)
        // initalState 에서 2개의 logged, token 변경
        return {
            ...state,
            logged : true,
            token : action.token
        }
    }
    // 바꾸는 동작2
    // dispatch({type: 'logout'})

    else if( action.type==='logout'){
        sessiobnStorage.setItem("TOKEN");
        return {
            ...state,
            logged : false,
            token : '',
        }
    }

    else if (action.type==='counter'){
        return {
            ...state,
            counter : counter + 1
        }

    }

    // 현재의 4개의 값을 가지고 감
    else {
        const token = sessionStorage.getItem("TOKEN");
        if(token !== null){
            return {
                ...state,
                logged : true,
                token : token
            }
        }
    }

}

export default CommonReuder;