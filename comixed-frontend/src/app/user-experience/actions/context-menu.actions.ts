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

import { Action } from '@ngrx/store';

export enum ContextMenuActionTypes {
  Show = '[CONTEXT MENU] Show the menu',
  Hide = '[CONTEXT MENU] Hide the menu',
  AddItem = '[CONTEXT MENU] Add a menu item',
  RemoveItem = '[CONTEXT MENU] Remove a menu item',
  UpdateItem = '[CONTEXT MENU] Updates a menu item',
  EnableItem = '[CONTEXT MENU] Enables a menu item',
  DisableItem = '[CONTEXT MENU] Disables a menu item',
  ShowItem = '[CONTEXT MENU] Show a menu item',
  HideItem = '[CONTEXT MENU] Hide a menu item'
}

export class ContextMenuShow implements Action {
  readonly type = ContextMenuActionTypes.Show;

  constructor(public payload: { event: MouseEvent }) {}
}

export class ContextMenuHide implements Action {
  readonly type = ContextMenuActionTypes.Hide;

  constructor() {}
}

export class ContextMenuAddItem implements Action {
  readonly type = ContextMenuActionTypes.AddItem;

  constructor(
    public payload: {
      id: string;
      icon: string;
      labelKey: string;
      enabled: boolean;
      show: boolean;
      callback: () => void;
    }
  ) {}
}

export class ContextMenuRemoveItem implements Action {
  readonly type = ContextMenuActionTypes.RemoveItem;

  constructor(public payload: { id: string }) {}
}

export class ContextMenuUpdateItem implements Action {
  readonly type = ContextMenuActionTypes.UpdateItem;

  constructor(
    public payload: { id: string; labelKey: string; callback: () => void }
  ) {}
}

export class ContextMenuEnableItem implements Action {
  readonly type = ContextMenuActionTypes.EnableItem;

  constructor(public payload: { id: string }) {}
}

export class ContextMenuDisableItem implements Action {
  readonly type = ContextMenuActionTypes.DisableItem;

  constructor(public payload: { id: string }) {}
}

export class ContextMenuShowItem implements Action {
  readonly type = ContextMenuActionTypes.ShowItem;

  constructor(public payload: { id: string }) {}
}

export class ContextMenuHideItem implements Action {
  readonly type = ContextMenuActionTypes.HideItem;

  constructor(public payload: { id: string }) {}
}

export type ContextMenuActions =
  | ContextMenuShow
  | ContextMenuHide
  | ContextMenuAddItem
  | ContextMenuRemoveItem
  | ContextMenuUpdateItem
  | ContextMenuEnableItem
  | ContextMenuDisableItem
  | ContextMenuShowItem
  | ContextMenuHideItem;
