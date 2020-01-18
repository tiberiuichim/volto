import { CLEAR_ERRORS } from '../../constants/ActionTypes';

export default function errors(state = [], action = {}) {
  console.log('action', action.type);
  if (action.error) return [...state, action];

  if (action.type === '@redux-conn/BEGIN_GLOBAL_LOAD') console.log(action);

  if (action.type === '@redux-conn/END_GLOBAL_LOAD') console.log(action);
  if (action.type === '@@router/LOCATION_CHANGE') console.log(action);

  switch (action.type) {
    case CLEAR_ERRORS:
      return [];
    default:
      return state;
  }
}
