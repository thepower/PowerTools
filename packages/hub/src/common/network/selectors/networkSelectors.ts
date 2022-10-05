import { createSelector } from '@reduxjs/toolkit';
import { ApplicationState } from '../../../application';

export const getUiActions = (state: ApplicationState) => state.network.actions;

// Хотя бы один action из списка в состоянии загруки
export const checkIfLoading = (state: ApplicationState, ...actionsToCheck: string[]) => (
  state.network.actions.some((a) => actionsToCheck.includes(a.name))
);

// Action с переданным id в payload в состоянии загрузки
export const checkIfLoadingItemById = createSelector(
  [getUiActions, (_: ApplicationState, props: { id: string | number, actionToCheck: string }) => props],
  (actions, { actionToCheck, id }) => actions.some((a) => a.name === actionToCheck && a.params?.id === id),
);

// Id всех сущностей одного action в состоянии загрузки
export const getUpdatingItemIds = createSelector(
  [getUiActions, (_: ApplicationState, actionToCheck: string) => actionToCheck],
  (actions, actionToCheck) => (
    actions
      .reduce((acc, action) => {
        if (action.name === actionToCheck && (Number.isInteger(action.params?.id) || typeof action.params?.id === 'string')) {
          acc.push(action.params.id);
        }
        return acc;
      }, [] as (number | string)[])
  ),
);
