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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicPagesComponent } from './comic-pages.component';
import { COMIC_2 } from '@app/comic-books/comic-books.fixtures';
import { ComicPageUrlPipe } from '@app/comic-books/pipes/comic-page-url.pipe';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatCardModule } from '@angular/material/card';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialuUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatMenuModule } from '@angular/material/menu';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { updatePageDeletion } from '@app/comic-books/actions/comic.actions';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';

describe('ComicPagesComponent', () => {
  const COMIC = COMIC_2;
  const USER = USER_READER;
  const PAGE = PAGE_1;
  const DELETED = Math.random() > 0.5;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialuUserState, user: USER }
  };

  let component: ComicPagesComponent;
  let fixture: ComponentFixture<ComicPagesComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ComicPagesComponent,
          ComicPageComponent,
          ComicPageUrlPipe
        ],
        imports: [
          RouterTestingModule.withRoutes([
            {
              path: '**',
              redirectTo: ''
            }
          ]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatCardModule,
          MatMenuModule,
          MatDialogModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicPagesComponent);
      component = fixture.componentInstance;
      component.comic = COMIC;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showing the context menu', () => {
    const XPOS = '7';
    const YPOS = '17';

    beforeEach(() => {
      component.comic = null;
      spyOn(component.contextMenu, 'openMenu');
      component.onShowContextMenu(PAGE, XPOS, YPOS);
    });

    it('sets the current page', () => {
      expect(component.page).toEqual(PAGE);
    });

    it('set the context menu x position', () => {
      expect(component.contextMenuX).toEqual(XPOS);
    });

    it('set the context menu y position', () => {
      expect(component.contextMenuY).toEqual(YPOS);
    });

    it('shows the context menu', () => {
      expect(component.contextMenu.openMenu).toHaveBeenCalled();
    });
  });

  describe('setting the page hash blocked state', () => {
    const BLOCKED = Math.random() > 0.5;

    beforeEach(() => {
      component.onSetPageBlocked(PAGE, BLOCKED);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBlockedState({ hashes: [PAGE.hash], blocked: BLOCKED })
      );
    });
  });

  describe('updating the deleted state for a page', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSetPageDeleted(PAGE, DELETED);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updatePageDeletion({ pages: [PAGE], deleted: DELETED })
      );
    });
  });
});
