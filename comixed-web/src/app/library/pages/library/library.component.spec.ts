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
import { LibraryComponent } from './library.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NavigationPaneComponent } from '@app/library/components/navigation-pane/navigation-pane.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { TitleService } from '@app/core';
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
import { QUERY_PARAM_TAB } from '@app/library/library.constants';
import { MatTabsModule } from '@angular/material/tabs';
import { DeletedComicsPipe } from '@app/library/pipes/deleted-comics.pipe';

describe('LibraryComponent', () => {
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [DISPLAY_FEATURE_KEY]: initialDisplayState
  };

  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LibraryComponent,
        LibraryToolbarComponent,
        NavigationPaneComponent,
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
        MatMenuModule,
        MatTabsModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            params: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryComponent);
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

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('changing the displayed tab', () => {
    const TAB = 3;

    it('loads the tab from the URL', () => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_TAB]: `${TAB}`
      });
      expect(component.currentTab).toEqual(TAB);
    });

    it('updates the URL when the tab changes', () => {
      component.onCurrentTabChanged(TAB);
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
