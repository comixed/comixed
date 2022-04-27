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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LibraryToolbarComponent } from './library-toolbar.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3
} from '@app/comic-books/comic-books.fixtures';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  PAGE_SIZE_PREFERENCE,
  SORT_FIELD_PREFERENCE
} from '@app/library/library.constants';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { startLibraryConsolidation } from '@app/library/actions/consolidate-library.actions';
import { MatDividerModule } from '@angular/material/divider';
import { rescanComics } from '@app/library/actions/rescan-comics.actions';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { purgeLibrary } from '@app/library/actions/purge-library.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { setComicListFilter } from '@app/comic-books/actions/comic-list.actions';

describe('LibraryToolbarComponent', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const PAGINATION = Math.floor(Math.abs(Math.random() * 1000));
  const PAGE_INDEX = 2;
  const NOW = new Date();
  const initialState = {};

  let component: LibraryToolbarComponent;
  let fixture: ComponentFixture<LibraryToolbarComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LibraryToolbarComponent],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatIconModule,
          MatFormFieldModule,
          MatTooltipModule,
          MatDialogModule,
          MatPaginatorModule,
          MatSelectModule,
          MatOptionModule,
          MatDividerModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(LibraryToolbarComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      confirmationService = TestBed.inject(ConfirmationService);
      translateService = TestBed.inject(TranslateService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('starting the scraping process', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selected = COMICS;
      component.onScrapeComics();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('redirects the browsers to the scraping page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/library', 'scrape']);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.paginator._intl.itemsPerPageLabel = null;
      translateService.use('fr');
    });

    it('updates the items per page label', () => {
      expect(component.paginator._intl.itemsPerPageLabel).not.toBeNull();
    });
  });

  describe('when the page size changes', () => {
    beforeEach(() => {
      component.onLibraryDisplayChange(PAGINATION, PAGE_INDEX, PAGE_INDEX);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: PAGE_SIZE_PREFERENCE,
          value: `${PAGINATION}`
        })
      );
    });
  });

  describe('when the page index changes', () => {
    beforeEach(() => {
      spyOn(component.pageIndexChanged, 'emit');
      component.onLibraryDisplayChange(PAGINATION, PAGE_INDEX, PAGE_INDEX - 1);
    });

    it('emits an event', () => {
      expect(component.pageIndexChanged.emit).toHaveBeenCalledWith(PAGE_INDEX);
    });
  });

  describe('when the archive type changes', () => {
    const ARCHIVE_TYPE = Math.random() > 0.5 ? ArchiveType.CBZ : null;

    beforeEach(() => {
      spyOn(component.archiveTypeChanged, 'emit');
      component.onArchiveTypeChanged(ARCHIVE_TYPE);
    });

    it('emits an event', () => {
      expect(component.archiveTypeChanged.emit).toHaveBeenCalledWith(
        ARCHIVE_TYPE
      );
    });
  });

  describe('starting library consolidation', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onConsolidateLibrary();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(startLibraryConsolidation());
    });
  });

  describe('rescanning selected comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selected = COMICS;
      component.onRescanComics();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        rescanComics({ comics: COMICS })
      );
    });
  });

  describe('updating metadata in selected comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selected = COMICS;
      component.onUpdateMetadata();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateMetadata({ comics: COMICS })
      );
    });
  });

  describe('when sorting field changes', () => {
    const SORT_FIELD = 'sort-field';

    beforeEach(() => {
      component.onSortBy(SORT_FIELD);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({ name: SORT_FIELD_PREFERENCE, value: SORT_FIELD })
      );
    });
  });

  describe('purging the library', () => {
    beforeEach(() => {
      component.selected = COMICS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onPurgeLibrary();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action to purge the library', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        purgeLibrary({ ids: COMICS.map(comic => comic.id) })
      );
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comics = COMICS;
      spyOn(component.selectAllComics, 'emit');
      component.onSelectAll();
    });

    it('emits an event', () => {
      expect(component.selectAllComics.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('deselecting all comics', () => {
    beforeEach(() => {
      component.selected = COMICS;
      spyOn(component.selectAllComics, 'emit');
      component.onDeselectAll();
    });

    it('emits an event', () => {
      expect(component.selectAllComics.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('updating the year filter', () => {
    beforeEach(() => {
      component.coverMonth = NOW.getMonth();
      component.onCoverYearChange(NOW.getFullYear());
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicListFilter({
          year: NOW.getFullYear(),
          month: NOW.getMonth()
        })
      );
    });
  });

  describe('updating the month filter', () => {
    beforeEach(() => {
      component.coverYear = NOW.getFullYear();
      component.onCoverMonthChange(NOW.getMonth());
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicListFilter({
          year: NOW.getFullYear(),
          month: NOW.getMonth()
        })
      );
    });
  });
});
