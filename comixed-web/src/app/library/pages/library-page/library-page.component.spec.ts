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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryPageComponent } from './library-page.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { ComicCoversComponent } from '@app/library/components/comic-covers/comic-covers.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatMenuModule } from '@angular/material/menu';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DeletedComicsPipe } from '@app/library/pipes/deleted-comics.pipe';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/library/reducers/comic-list.reducer';
import { COMIC_1, COMIC_3 } from '@app/comic/comic.fixtures';
import { TitleService } from '@app/core/services/title.service';

describe('LibraryPageComponent', () => {
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [DISPLAY_FEATURE_KEY]: initialDisplayState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState
  };

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LibraryPageComponent,
        LibraryToolbarComponent,
        ComicCoversComponent,
        DeletedComicsPipe
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatTreeModule,
        MatBadgeModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatDialogModule,
        MatMenuModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            data: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot,
            queryParams: new BehaviorSubject<{}>({}),
            params: new BehaviorSubject<{}>({})
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading page data', () => {
    beforeEach(() => {
      component.unreadOnly = false;
      component.deletedOnly = false;
    });

    describe('when showing unread comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ unread: true });
      });

      it('sets the unread only flag', () => {
        expect(component.unreadOnly).toBeTrue();
      });
    });

    describe('when showing deleted comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ deleted: true });
      });

      it('sets the deleted only flag', () => {
        expect(component.deletedOnly).toBeTrue();
      });
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.unreadOnly = false;
      component.deletedOnly = false;
    });

    it('updates the page title for all comic', () => {
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unread comic', () => {
      component.unreadOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for deleted comic', () => {
      component.deletedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading all pages', () => {
    const UNREAD = { ...COMIC_1, lastRead: null, deletedDate: null };
    const DELETED = {
      ...COMIC_3,
      lastRead: new Date().getTime(),
      deletedDate: new Date().getTime()
    };
    const COMICS = [UNREAD, DELETED];

    describe('for unread comics', () => {
      beforeEach(() => {
        component.unreadOnly = true;
        component.deletedOnly = false;
        store.setState({
          ...initialState,
          [COMIC_LIST_FEATURE_KEY]: { ...initialComicListState, comics: COMICS }
        });
      });

      it('only loads the unread comics', () => {
        component.comics.every(comic => expect(comic.lastRead).toBeNull());
      });
    });

    describe('for deleted comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = true;
        store.setState({
          ...initialState,
          [COMIC_LIST_FEATURE_KEY]: { ...initialComicListState, comics: COMICS }
        });
      });

      it('only loads the unread comics', () => {
        component.comics.every(comic =>
          expect(comic.deletedDate).not.toBeNull()
        );
      });
    });
  });

  describe('loading the translations', () => {});
});
