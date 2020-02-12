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

import { ContextMenuItem } from 'app/user-experience/models/context-menu-item';
import {
  ContextMenuActions,
  ContextMenuActionTypes
} from '../actions/context-menu.actions';

export const CONTEXT_MENU_FEATURE_KEY = 'context_menu_state';

export interface ContextMenuState {
  visible: boolean;
  mouseEvent: MouseEvent;
  items: ContextMenuItem[];
}

export const initialState: ContextMenuState = {
  visible: false,
  mouseEvent: null,
  items: []
};

export function reducer(
  state = initialState,
  action: ContextMenuActions
): ContextMenuState {
  switch (action.type) {
    case ContextMenuActionTypes.Show:
      return { ...state, visible: true, mouseEvent: action.payload.event };

    case ContextMenuActionTypes.Hide:
      return { ...state, visible: false };

    case ContextMenuActionTypes.AddItem:
      return {
        ...state,
        items: state.items.concat({
          id: action.payload.id,
          icon: action.payload.icon,
          labelKey: action.payload.labelKey,
          enabled: action.payload.enabled,
          show: action.payload.show,
          callback: action.payload.callback
        } as ContextMenuItem)
      };

    case ContextMenuActionTypes.RemoveItem:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case ContextMenuActionTypes.UpdateItem: {
      const items = state.items.map(item => {
        if (item.id === action.payload.id) {
          return {
            id: item.id,
            icon: item.icon,
            labelKey: action.payload.labelKey,
            enabled: item.enabled,
            show: item.show,
            callback: action.payload.callback
          } as ContextMenuItem;
        } else {
          return item;
        }
      });
      return { ...state, items: items };
    }

    case ContextMenuActionTypes.EnableItem: {
      const item = state.items.find(entry => entry.id === action.payload.id);
      item.enabled = true;
      const items = state.items.filter(entry => entry.id !== item.id);
      items.push(item);
      return { ...state, items: items };
    }

    case ContextMenuActionTypes.DisableItem: {
      const item = state.items.find(entry => entry.id === action.payload.id);
      item.enabled = false;
      const items = state.items.filter(entry => entry.id !== item.id);
      items.push(item);
      return { ...state, items: items };
    }

    case ContextMenuActionTypes.ShowItem: {
      const item = state.items.find(entry => entry.id === action.payload.id);
      item.show = true;
      const items = state.items.filter(entry => entry.id !== item.id);
      items.push(item);
      return { ...state, items: items };
    }

    case ContextMenuActionTypes.HideItem: {
      const item = state.items.find(entry => entry.id === action.payload.id);
      item.show = false;
      const items = state.items.filter(entry => entry.id !== item.id);
      items.push(item);
      return { ...state, items: items };
    }

    default:
      return state;
  }
}
