import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'connected-react-router';
import { ApplicationState } from '../reducers/rootReducer';


export const userHasAuth = connectedReduxRedirect({
  redirectPath: (state: ApplicationState) => {
    if (state.account.logged) {
      return '/unauthorized';
    }

    return '/login';
  },
  authenticatedSelector: (state: ApplicationState) => state.account.logged ,
  wrapperDisplayName: 'UserIsAuthenticated',
  redirectAction: routerActions.replace,
  allowRedirectBack: true,
});
