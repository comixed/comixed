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
import { DuplicatePageDetailPageComponent } from './duplicate-page-detail-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  DUPLICATE_PAGE_DETAIL_FEATURE_KEY,
  initialState as initialDuplicatePageDetailState
} from '@app/library/reducers/duplicate-page-detail.reducer';
import { DUPLICATE_PAGE_1 } from '@app/library/library.fixtures';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ComicPageComponent } from '@app/comic-book/components/comic-page/comic-page.component';
import { PageHashUrlPipe } from '@app/comic-book/pipes/page-hash-url.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { loadDuplicatePageDetail } from '@app/library/actions/duplicate-page-detail.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

describe('DuplicatePageDetailPageComponent', () => {
  const DETAIL = DUPLICATE_PAGE_1;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: {
      ...initialDuplicatePageDetailState,
      detail: DETAIL
    }
  };
  let component: DuplicatePageDetailPageComponent;
  let fixture: ComponentFixture<DuplicatePageDetailPageComponent>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let store: MockStore<any>;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DuplicatePageDetailPageComponent,
        ComicPageComponent,
        PageHashUrlPipe
      ],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatIconModule,
        MatTableModule,
        MatCardModule,
        MatDialogModule,
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({})
          }
        },
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicatePageDetailPageComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

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

  describe('loading the duplicate page detail', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        hash: DETAIL.hash
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadDuplicatePageDetail({ hash: DETAIL.hash })
      );
    });

    describe('when the page was not found', () => {
      beforeEach(() => {
        spyOn(router, 'navigateByUrl');
        store.setState({
          ...initialState,
          [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: {
            ...initialDuplicatePageDetailState,
            notFound: true
          }
        });
      });

      it('redirects the browser to the list page', () => {
        expect(router.navigateByUrl).toHaveBeenCalledWith(
          '/library/pages/duplicates'
        );
      });
    });

    describe('when the page is loaded', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: {
            ...initialDuplicatePageDetailState,
            detail: DETAIL
          }
        });
      });

      it('sets the detail reference', () => {
        expect(component.detail).toEqual(DETAIL);
      });
    });
  });

  describe('setting the blocked state for a page', () => {
    beforeEach(() => {
      component.hash = DETAIL.hash;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
    });

    describe('blocking a page', () => {
      beforeEach(() => {
        component.onBlockPage();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBlockedState({ hashes: [DETAIL.hash], blocked: true })
        );
      });
    });

    describe('unblocking a page', () => {
      beforeEach(() => {
        component.onUnblockPage();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBlockedState({ hashes: [DETAIL.hash], blocked: false })
        );
      });
    });
  });
});
