/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DuplicateComicsListPageComponent } from './duplicate-comics-list-page.component';
import {
  DUPLICATE_COMICS_FEATURE_KEY,
  initialState as initialDuplicateComicState
} from '@app/library/reducers/duplicate-comics.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { DUPLICATE_COMIC_1 } from '@app/library/library.fixtures';
import { formatDate } from '@angular/common';

describe('DuplicateComicsListPageComponent', () => {
  const initialState = {
    [DUPLICATE_COMICS_FEATURE_KEY]: initialDuplicateComicState
  };

  let component: DuplicateComicsListPageComponent;
  let fixture: ComponentFixture<DuplicateComicsListPageComponent>;
  let store: MockStore;
  let translateService: TranslateService;
  let titleService: TitleService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        DuplicateComicsListPageComponent
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicateComicsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting a duplicated comic', () => {
    const ENTRY = DUPLICATE_COMIC_1;

    beforeEach(() => {
      component.onLoadDuplicateComics(ENTRY);
    });

    it('navigates to the details page', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/library/duplicates',
        ENTRY.publisher,
        ENTRY.series,
        ENTRY.volume,
        ENTRY.issueNumber,
        formatDate(new Date(ENTRY.coverDate), 'yyyy-MM-dd', component.locale)
      ]);
    });
  });
});
