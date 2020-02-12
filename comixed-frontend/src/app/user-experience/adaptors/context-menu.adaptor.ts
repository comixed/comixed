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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/user-experience';
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
import { ContextMenuItem } from 'app/user-experience/models/context-menu-item';
import {
  CONTEXT_MENU_FEATURE_KEY,
  ContextMenuState
} from 'app/user-experience/reducers/context-menu.reducer';
import * as _ from 'lodash';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class ContextMenuAdaptor {
  private _visible$ = new BehaviorSubject<boolean>(false);
  private _mouseEvent$ = new BehaviorSubject<MouseEvent>(null);
  private _items$ = new BehaviorSubject<ContextMenuItem[]>([]);

  constructor(private logger: NGXLogger, private store: Store<AppState>) {
    this.store
      .select(CONTEXT_MENU_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ContextMenuState) => {
        this.logger.debug('context menu state updated:', state);
        if (state.visible !== this._visible$.getValue()) {
          this._visible$.next(state.visible);
        }
        if (!_.isEqual(state.mouseEvent, this._mouseEvent$.getValue())) {
          this._mouseEvent$.next(state.mouseEvent);
        }
        if (!_.isEqual(state.items, this._items$.getValue())) {
          this._items$.next(state.items);
        }
      });
  }

  showMenu($event: MouseEvent): void {
    this.logger.debug('firing an action to show the context menu');
    this.store.dispatch(new ContextMenuShow({ event: $event }));
  }

  hideMenu(): void {
    this.logger.debug('firing an action to hide the context menu');
    this.store.dispatch(new ContextMenuHide());
  }

  addItem(
    id: string,
    icon: string,
    labelKey: string,
    enabled: boolean,
    show: boolean,
    callback: () => void
  ): void {
    this.logger.debug(
      `firing action to add menu item: id=${id} icon=${icon} labelKey=${labelKey} enabled=${enabled} show=${show}:`,
      callback
    );
    this.store.dispatch(
      new ContextMenuAddItem({
        id: id,
        icon: icon,
        labelKey: labelKey,
        enabled: enabled,
        show: show,
        callback: callback
      })
    );
  }

  removeItem(id: string): void {
    this.logger.debug(`firing action to remove menu item: id=${id}`);
    this.store.dispatch(new ContextMenuRemoveItem({ id: id }));
  }

  updateItem(id: string, labelKey: string, callback: () => void): void {
    this.logger.debug(
      `firing action to update menu item: id=${id} labelKey=${labelKey}:`,
      callback
    );
    this.store.dispatch(
      new ContextMenuUpdateItem({
        id: id,
        labelKey: labelKey,
        callback: callback
      })
    );
  }

  enableItem(id: string): void {
    this.logger.debug(`firing an action to enable menu item: id=${id}`);
    this.store.dispatch(new ContextMenuEnableItem({ id: id }));
  }

  disableItem(id: string) {
    this.logger.debug(`firing an action to disable menu item: id=${id}`);
    this.store.dispatch(new ContextMenuDisableItem({ id: id }));
  }

  showItem(id: string): void {
    this.logger.debug(`firing an action to show a menu item: id=${id}`);
    this.store.dispatch(new ContextMenuShowItem({ id: id }));
  }

  hideItem(id: string): void {
    this.logger.debug(`firing an action to hide a menu item: id=${id}`);
    this.store.dispatch(new ContextMenuHideItem({ id: id }));
  }

  get visible$(): Observable<boolean> {
    return this._visible$.asObservable();
  }

  get mouseEvent$(): Observable<MouseEvent> {
    return this._mouseEvent$.asObservable();
  }

  get items$(): Observable<ContextMenuItem[]> {
    return this._items$.asObservable();
  }
}
