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

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppState, ContextMenuItem } from 'app/user-experience';
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
  CONTEXT_MENU_FEATURE_KEY,
  reducer
} from 'app/user-experience/reducers/context-menu.reducer';
import {
  CONTEXT_MENU_ITEM_1,
  CONTEXT_MENU_ITEM_2,
  CONTEXT_MENU_ITEM_3,
  CONTEXT_MENU_ITEM_4,
  CONTEXT_MENU_ITEM_5
} from 'app/user-experience/user-experience.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import { ContextMenuAdaptor } from './context-menu.adaptor';

describe('ContextMenuAdaptor', () => {
  const MOUSE_EVENT = new MouseEvent('mousedown');
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

  let adaptor: ContextMenuAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(CONTEXT_MENU_FEATURE_KEY, reducer)
      ],
      providers: [ContextMenuAdaptor]
    });

    adaptor = TestBed.get(ContextMenuAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('showing the context menu', () => {
    beforeEach(() => {
      adaptor.showMenu(MOUSE_EVENT);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuShow({ event: MOUSE_EVENT })
      );
    });

    it('provides updates on showing the menu', () => {
      adaptor.visible$.subscribe(response => expect(response).toBeTruthy());
    });

    it('provides updates on the mouse event', () => {
      adaptor.mouseEvent$.subscribe(response =>
        expect(response).toEqual(MOUSE_EVENT)
      );
    });
  });

  describe('hiding the context menu', () => {
    beforeEach(() => {
      adaptor.showMenu(MOUSE_EVENT);
      adaptor.hideMenu();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new ContextMenuHide());
    });

    it('provides updates on showing the menu', () => {
      adaptor.visible$.subscribe(response => expect(response).toBeFalsy());
    });
  });

  describe('adding a menu item', () => {
    beforeEach(() => {
      adaptor.addItem(ID, ICON, LABEL_KEY, ENABLED, SHOWN, CALLBACK);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
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

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response =>
        expect(response).toContain({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: SHOWN,
          callback: CALLBACK
        } as ContextMenuItem)
      );
    });
  });

  describe('removing a menu item', () => {
    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: SHOWN,
          callback: CALLBACK
        })
      );
      adaptor.removeItem(ID);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuRemoveItem({ id: ID })
      );
    });

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response => expect(response).toEqual([]));
    });
  });

  describe('updating a menu item', () => {
    const UPDATED_LABEL = LABEL_KEY.substr(1);
    const UPDATED_CALLBACK: () => void = () => {};

    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: SHOWN,
          callback: CALLBACK
        })
      );
      adaptor.updateItem(ID, UPDATED_LABEL, UPDATED_CALLBACK);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuUpdateItem({
          id: ID,
          labelKey: UPDATED_LABEL,
          callback: UPDATED_CALLBACK
        })
      );
    });

    it('updates the item', () => {
      adaptor.items$.subscribe(response =>
        expect(response.find(entry => entry.id === ID)).toEqual({
          id: ID,
          icon: ICON,
          labelKey: UPDATED_LABEL,
          enabled: ENABLED,
          show: SHOWN,
          callback: UPDATED_CALLBACK
        } as ContextMenuItem)
      );
    });
  });

  describe('enabling a menu item', () => {
    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: false,
          show: SHOWN,
          callback: CALLBACK
        })
      );
      adaptor.enableItem(ID);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuEnableItem({ id: ID })
      );
    });

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response =>
        expect(response.find(item => item.id === ID).enabled).toBeTruthy()
      );
    });
  });

  describe('disabling a menu item', () => {
    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: true,
          show: SHOWN,
          callback: CALLBACK
        })
      );
      adaptor.disableItem(ID);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuDisableItem({ id: ID })
      );
    });

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response =>
        expect(response.find(item => item.id === ID).enabled).toBeFalsy()
      );
    });
  });

  describe('showing a menu item', () => {
    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: false,
          callback: CALLBACK
        })
      );
      adaptor.showItem(ID);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuShowItem({ id: ID })
      );
    });

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response =>
        expect(response.find(item => item.id === ID).show).toBeTruthy()
      );
    });
  });

  describe('disabling a menu item', () => {
    beforeEach(() => {
      store.dispatch(
        new ContextMenuAddItem({
          id: ID,
          icon: ICON,
          labelKey: LABEL_KEY,
          enabled: ENABLED,
          show: true,
          callback: CALLBACK
        })
      );
      adaptor.hideItem(ID);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ContextMenuHideItem({ id: ID })
      );
    });

    it('provides updates on the menu items', () => {
      adaptor.items$.subscribe(response =>
        expect(response.find(item => item.id === ID).show).toBeFalsy()
      );
    });
  });
});
