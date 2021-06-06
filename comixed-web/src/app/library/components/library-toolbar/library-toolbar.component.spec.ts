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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryToolbarComponent } from './library-toolbar.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { COMIC_1, COMIC_2, COMIC_3 } from '@app/comic-book/comic-book.fixtures';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Confirmation } from '@app/core/models/confirmation';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGINATION_PREFERENCE } from '@app/library/library.constants';
import { ConfirmationService } from '@app/core/services/confirmation.service';

describe('LibraryToolbarComponent', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const PAGINATION = Math.floor(Math.abs(Math.random() * 1000));
  const initialState = { [DISPLAY_FEATURE_KEY]: initialDisplayState };

  let component: LibraryToolbarComponent;
  let fixture: ComponentFixture<LibraryToolbarComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let translateService: TranslateService;

  beforeEach(async(() => {
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
        MatPaginatorModule
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comics = COMICS;
      component.onSelectAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        selectComics({ comics: COMICS })
      );
    });
  });

  describe('deselecting all comics', () => {
    beforeEach(() => {
      component.selected = COMICS;
      component.onDeselectAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deselectComics({ comics: COMICS })
      );
    });
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

  describe('setting the pagination', () => {
    beforeEach(() => {
      component.pagination = PAGINATION;
    });

    it('updates the component', () => {
      expect(component.pagination).toEqual(PAGINATION);
    });
  });

  describe('when the pagintion changes', () => {
    beforeEach(() => {
      component.onPaginationChange(PAGINATION);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: PAGINATION_PREFERENCE,
          value: `${PAGINATION}`
        })
      );
    });
  });
});
