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

import {
  ContextMenuAddItem,
  ContextMenuDisableItem,
  ContextMenuEnableItem,
  ContextMenuHide,
  ContextMenuHideItem,
  ContextMenuRemoveItem,
  ContextMenuShow,
  ContextMenuShowItem,
  ContextMenuUpdateItem
} from 'app/user-experience/actions/context-menu.actions';
import {
  CONTEXT_MENU_ITEM_1,
  CONTEXT_MENU_ITEM_2,
  CONTEXT_MENU_ITEM_3,
  CONTEXT_MENU_ITEM_4,
  CONTEXT_MENU_ITEM_5
} from 'app/user-experience/user-experience.fixtures';
import {
  ContextMenuState,
  initialState,
  reducer
} from './context-menu.reducer';

describe('ContextMenu Reducer', () => {
  const MOUSE_EVENT: MouseEvent = { button: 2 };
  const ITEM = CONTEXT_MENU_ITEM_1;
  const ID = ITEM.id;
  const ICON = 'fa fa-fw fa-icon';
  const LABEL_KEY = ITEM.labelKey;
  const ENABLED = ITEM.enabled;
  const SHOWN = ITEM.show;
  const CALLBACK = ITEM.callback;
  const ITEMS = [
    CONTEXT_MENU_ITEM_2,
    CONTEXT_MENU_ITEM_3,
    CONTEXT_MENU_ITEM_4,
    CONTEXT_MENU_ITEM_5
  ];

  let state: ContextMenuState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initials tate', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the visible flag', () => {
      expect(state.visible).toBeFalsy();
    });

    it('has no mouse event', () => {
      expect(state.mouseEvent).toBeNull();
    });

    it('has an empty array of items', () => {
      expect(state.items).toEqual([]);
    });
  });

  describe('showing the context menu', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, visible: false },
        new ContextMenuShow({ event: MOUSE_EVENT })
      );
    });

    it('sets the visible flag', () => {
      expect(state.visible).toBeTruthy();
    });

    it('sets the mouse event', () => {
      expect(state.mouseEvent).toEqual(MOUSE_EVENT);
    });
  });

  describe('hiding the context menu', () => {
    beforeEach(() => {
      state = reducer({ ...state, visible: true }, new ContextMenuHide());
    });

    it('clears the visible flag', () => {
      expect(state.visible).toBeFalsy();
    });
  });

  describe('adding an item', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, items: ITEMS },
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: SHOWN,
          callback: CALLBACK
        })
      );
    });

    it('adds an item with the same id to the menu', () => {
      expect(state.items[state.items.length - 1].id).toEqual(ID);
    });

    it('adds an item with the same icon to the menu', () => {
      expect(state.items[state.items.length - 1].icon).toEqual(ICON);
    });

    it('adds an item with the same labelKey to the menu', () => {
      expect(state.items[state.items.length - 1].labelKey).toEqual(LABEL_KEY);
    });

    it('adds an item with the same enabled state to the menu', () => {
      expect(state.items[state.items.length - 1].enabled).toEqual(ENABLED);
    });

    it('adds an item with the same shown state to the menu', () => {
      expect(state.items[state.items.length - 1].show).toEqual(SHOWN);
    });

    it('adds an item with the same callback to the menu', () => {
      expect(state.items[state.items.length - 1].callback).toEqual(CALLBACK);
    });
  });

  describe('removing an item', () => {
    const REMOVED_ITEM = ITEMS[2];

    beforeEach(() => {
      state = reducer(
        { ...state, items: ITEMS },
        new ContextMenuRemoveItem({ id: REMOVED_ITEM.id })
      );
    });

    it('does not contain the removed item', () => {
      expect(state.items).not.toContain(REMOVED_ITEM);
    });
  });

  describe('updating an item', () => {
    const INDEX = 2;
    const UPDATED_ID = ITEMS[INDEX].id;
    const UPDATED_LABEL = ITEMS[INDEX].labelKey.substr(1);

    beforeEach(() => {
      state = reducer(
        { ...state, items: ITEMS },
        new ContextMenuUpdateItem({
          id: UPDATED_ID,
          labelKey: UPDATED_LABEL,
          callback: CALLBACK
        })
      );
    });

    it('replaces the old item with the new one', () => {
      expect(state.items[INDEX].labelKey).toEqual(UPDATED_LABEL);
    });
  });

  describe('enabling an item', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, items: [{ ...ITEM, enabled: false }] },
        new ContextMenuEnableItem({ id: ID })
      );
    });

    it('enables the specified item', () => {
      expect(state.items[0].enabled).toBeTruthy();
    });
  });

  describe('disabling an item', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, items: [{ ...ITEM, enabled: true }] },
        new ContextMenuDisableItem({ id: ID })
      );
    });

    it('disables the specified item', () => {
      expect(state.items[0].enabled).toBeFalsy();
    });
  });

  describe('show an item', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, items: [{ ...ITEM, show: false }] },
        new ContextMenuShowItem({ id: ID })
      );
    });

    it('shows the specified item', () => {
      expect(state.items[0].show).toBeTruthy();
    });
  });

  describe('hide an item', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, items: [{ ...ITEM, show: true }] },
        new ContextMenuHideItem({ id: ID })
      );
    });

    it('hides the specified item', () => {
      expect(state.items[0].show).toBeFalsy();
    });
  });
});
