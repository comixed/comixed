import {
  initialState,
  InitialUserAccountState,
  reducer
} from './initial-user-account.reducer';
import {
  createAdminAccount,
  createAdminAccountFailure,
  createAdminAccountSuccess,
  loadInitialUserAccount,
  loadInitialUserAccountFailure,
  loadInitialUserAccountSuccess
} from '@app/user/actions/initial-user-account.actions';
import { USER_ADMIN } from '@app/user/user.fixtures';

describe('InitialUserAccount Reducer', () => {
  const EMAIL = USER_ADMIN.email;
  const PASSWORD = 'My!P45sw0Rd';

  let state: InitialUserAccountState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the checked flag', () => {
      expect(state.checked).toBeFalse();
    });

    it('clears the has existing flag', () => {
      expect(state.hasExisting).toBeFalse();
    });
  });

  describe('checking the existing account state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, checked: true, hasExisting: true },
        loadInitialUserAccount()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the busy flag', () => {
      expect(state.checked).toBeFalse();
    });

    it('clears the has existing flag', () => {
      expect(state.hasExisting).toBeFalse();
    });

    describe('success', () => {
      const HAS_EXISTING = Math.random() > 0.5;

      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            checked: false,
            hasExisting: !HAS_EXISTING
          },
          loadInitialUserAccountSuccess({ hasExisting: HAS_EXISTING })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the checked flag', () => {
        expect(state.checked).toBeTrue();
      });

      it('sets the has existing flag', () => {
        expect(state.hasExisting).toEqual(HAS_EXISTING);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            checked: false
          },
          loadInitialUserAccountFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the checked flag as cleared', () => {
        expect(state.checked).toBeFalse();
      });
    });
  });

  describe('creating the initial admin account', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        createAdminAccount({ email: EMAIL, password: PASSWORD })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, createAdminAccountSuccess());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, createAdminAccountFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
