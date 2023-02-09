/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { DeletedPageListPageComponent } from './deleted-page-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TitleService } from '@app/core/services/title.service';
import {
  DELETED_PAGE_1,
  DELETED_PAGE_2,
  DELETED_PAGE_3,
  DELETED_PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import {
  DELETED_PAGE_FEATURE_KEY,
  initialState as deletedPageInitiaState
} from '@app/comic-pages/reducers/deleted-pages.reducer';
import { PageHashUrlPipe } from '@app/comic-books/pipes/page-hash-url.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailListDialogComponent } from '@app/library/components/comic-detail-list-dialog/comic-detail-list-dialog.component';

describe('DeletedPageListPageComponent', () => {
  const DELETED_PAGE_LIST = [
    DELETED_PAGE_1,
    DELETED_PAGE_2,
    DELETED_PAGE_3,
    DELETED_PAGE_4
  ];
  const COMICS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const PAGE_INDEX = 11;
  const PAGE_SIZE = 25;
  const USER = { ...USER_ADMIN };
  const initialState = {
    [DELETED_PAGE_FEATURE_KEY]: deletedPageInitiaState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: DeletedPageListPageComponent;
  let fixture: ComponentFixture<DeletedPageListPageComponent>;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let store: MockStore<any>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletedPageListPageComponent, PageHashUrlPipe],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(DeletedPageListPageComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(MockStore);
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the tab title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      setTitleSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading pages', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [DELETED_PAGE_FEATURE_KEY]: {
          ...deletedPageInitiaState,
          list: DELETED_PAGE_LIST
        }
      });
    });

    it('loads the pages', () => {
      expect(component.dataSource.data).toEqual(DELETED_PAGE_LIST);
    });
  });

  describe('sorting the pages', () => {
    const ENTRY = DELETED_PAGE_LIST[0];

    it('sorts by hash', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'hash')).toEqual(
        ENTRY.hash
      );
    });

    it('sorts by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-count')
      ).toEqual(ENTRY.comics.length);
    });
  });

  describe('the total page count', () => {
    beforeEach(() => {
      component.pages = DELETED_PAGE_LIST;
    });

    it('loads the total number of comics', () => {
      expect(component.totalComicCount).toEqual(
        DELETED_PAGE_LIST.map(entry => entry.comics.length).reduce(
          (sum, current) => sum + current,
          0
        )
      );
    });
  });

  describe('showing the list of comics', () => {
    beforeEach(() => {
      component.onShowComics(COMICS);
    });

    it('opens the dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(ComicDetailListDialogComponent, {
        data: COMICS
      });
    });
  });
});
