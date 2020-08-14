/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromClearTaskAuditLog from '../reducers/clear-task-audit-log.reducer';
import { ClearTaskAuditLogState } from '../reducers/clear-task-audit-log.reducer';

/**
 * Returns the clear task audit log state.
 */
export const selectClearTaskAuditLogState = createFeatureSelector<
  fromClearTaskAuditLog.ClearTaskAuditLogState
>(fromClearTaskAuditLog.CLEAR_TASK_AUDIT_LOG_FEATURE_KEY);

/**
 * Returns the working state for clearing the task audit log.
 */
export const selectClearTaskingAuditLogWorking = createSelector(
  selectClearTaskAuditLogState,
  (state: ClearTaskAuditLogState) => state.working
);
