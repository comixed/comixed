/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedComicToolbar } from './selected-comic-toolbar';
import {
  DialogService,
  DynamicDialogRef
} from '@openng/optimus-ui/dynamicdialog';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY,
  selectedComicListAdapter
} from '@app/library/reducers/selected-comic-list.reducer';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import { beforeEach, Mock } from 'vitest';
import { Subject } from 'rxjs';
import { ReadComicStateDecision } from '@app/layout/components/read-state-dialog/read-state-dialog';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';

describe('SelectedComicToolbar', () => {
  const TEST_SELECTED_COMIC_IDS = [1, 3, 5, 7, 9];
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState
  };

  let component: SelectedComicToolbar;
  let fixture: ComponentFixture<SelectedComicToolbar>;
  let store: MockStore;
  let onClose$: Subject<unknown>;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    onClose$ = new Subject<unknown>();
    const dialogRef = {
      onClose: onClose$.asObservable(),
      close: vi.fn()
    } as unknown as DynamicDialogRef;

    openMock = vi.fn().mockReturnValue(dialogRef);

    await TestBed.configureTestingModule({
      imports: [SelectedComicToolbar],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        { provide: DialogService, useValue: { open: openMock } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedComicToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not enable the mark selected read button', () => {
    const button = fixture.nativeElement.querySelector(
      '#mark-selected-read button'
    );
    expect(button).toBeTruthy();
    expect(button.disabled).toBeTruthy();
  });

  describe('when there are selected ids', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SELECTED_COMIC_LIST_FEATURE_KEY]: selectedComicListAdapter.setAll(
          TEST_SELECTED_COMIC_IDS,
          initialSelectedComicListState
        )
      });
      fixture.detectChanges();
    });

    it('should enable the mark selected read button', () => {
      const button = fixture.nativeElement.querySelector(
        '#mark-selected-read button'
      );
      expect(button).toBeTruthy();
      expect(button.disabled).toBeFalsy();
    });

    describe('marking comics as read', () => {
      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        const button = fixture.nativeElement.querySelector(
          '#mark-selected-read button'
        );
        button.click();
        fixture.detectChanges();

        expect(openMock).toHaveBeenCalled();

        onClose$.next(ReadComicStateDecision.MarkRead);
        onClose$.complete();
      });

      it('should dispatch an action to mark comics as read', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          ReadComicListActions.markSelectedComics({ readState: true })
        );
      });
    });

    describe('marking comics as unread', () => {
      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        const button = fixture.nativeElement.querySelector(
          '#mark-selected-read button'
        );
        button.click();
        fixture.detectChanges();

        expect(openMock).toHaveBeenCalled();

        onClose$.next(ReadComicStateDecision.MarkUnread);
        onClose$.complete();
      });

      it('should dispatch an action to mark comics as unread', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          ReadComicListActions.markSelectedComics({ readState: false })
        );
      });
    });

    describe('cancelling', () => {
      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        const button = fixture.nativeElement.querySelector(
          '#mark-selected-read button'
        );
        button.click();
        fixture.detectChanges();

        expect(openMock).toHaveBeenCalled();

        onClose$.next(ReadComicStateDecision.Cancel);
        onClose$.complete();
      });

      it('should not dispatch an action', () => {
        expect(dispatchSpy).not.toHaveBeenCalled();
      });
    });
  });
});
