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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
  MESSAGING_FEATURE_KEY,
  MessagingState,
  reducer as messagingReducer
} from '@app/messaging/reducers/messaging.reducer';
import { ActionReducerMap } from '@ngrx/store';

export { WebSocketService } from './services/web-socket.service';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface MessagingModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [MESSAGING_FEATURE_KEY]: MessagingState;
}

export type ModuleState = MessagingModuleState;

export const reducers: ActionReducerMap<MessagingModuleState> = {
  router: routerReducer,
  [MESSAGING_FEATURE_KEY]: messagingReducer
};
