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
import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from 'environments/environment';
import * as fromContextMenu from './reducers/context-menu.reducer';
import { ContextMenuState } from './reducers/context-menu.reducer';
import { ContextMenuItem } from 'app/user-experience/models/context-menu-item';
import { MenuItem } from 'primeng/components/common/menuitem';
import { TranslateService } from '@ngx-translate/core';

export { ContextMenuItem } from './models/context-menu-item';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  context_menu_state: ContextMenuState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  context_menu_state: fromContextMenu.reducer
};

export function generateContextMenuItems(
  items: ContextMenuItem[],
  translateService: TranslateService
) {
  return items.map(item => {
    return {
      icon: item.icon,
      label: translateService.instant(item.labelKey),
      disabled: !item.enabled,
      visible: item.show,
      command: item.callback
    } as MenuItem;
  });
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
