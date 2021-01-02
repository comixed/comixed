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
import { AllComicsComponent } from './all-comics.component';
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

describe('AllComicsComponent', () => {
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [DISPLAY_FEATURE_KEY]: initialDisplayState
  };

  let component: AllComicsComponent;
  let fixture: ComponentFixture<AllComicsComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AllComicsComponent,
        NavigationPaneComponent,
        ComicCoversComponent
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
        MatPaginatorModule
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(AllComicsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
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
});
