const userReducerDefaultState = {
    user : undefined,
    isAuthentication : false
};

const userReducer = (state = userReducerDefaultState, action) => {
    switch (action.type) {
        case 'UPDATE_USER':
            return {
                user : action.user,
                isAuthenticated : action.isAuthenticated
            };
        default:
            return state;
    }
};

export default userReducer;