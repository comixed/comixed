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
import { DeletedListPageComponent } from './deleted-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import { TitleService } from '@app/core/services/title.service';
import { Comic } from '@app/comic-books/models/comic';
import { COMIC_1 } from '@app/comic-books/comic-books.fixtures';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';

describe('DeletedListPageComponent', () => {
  const COMICS: Comic[] = [
    {
      ...COMIC_1,
      pages: [
        { ...PAGE_1, deleted: false },
        { ...PAGE_2, deleted: true },
        { ...PAGE_3, deleted: true }
      ]
    }
  ];
  const initialState = { [COMIC_LIST_FEATURE_KEY]: initialComicListState };

  let component: DeletedListPageComponent;
  let fixture: ComponentFixture<DeletedListPageComponent>;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletedListPageComponent],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(DeletedListPageComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(MockStore);
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
        [COMIC_LIST_FEATURE_KEY]: { ...initialComicListState, comics: COMICS }
      });
    });

    it('loads the pages', () => {
      expect(component.dataSource.data).not.toEqual([]);
    });

    it('loads only deletd pages', () => {
      expect(
        component.dataSource.data.every(entry => entry.page.deleted)
      ).toBeTrue();
    });
  });

  describe('sorting the pages', () => {
    const PAGE = PAGE_3;
    const COMIC = COMIC_1;
    const ENTRY = { page: PAGE, comic: COMIC };

    it('sorts by comic', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'comic')).toEqual(
        COMIC.coverDate
      );
    });

    it('sorts by filename', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'filename')
      ).toEqual(PAGE.filename);
    });

    it('sorts by hash', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'hash')).toEqual(
        PAGE.hash
      );
    });
  });
});
