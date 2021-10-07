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
import { ConfigurationPageComponent } from './configuration-page.component';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  initialState as initialConfigurationOptionListState
} from '@app/admin/reducers/configuration-option-list.reducer';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ComicVineConfigurationComponent } from '@app/admin/components/comic-vine-configuration/comic-vine-configuration.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {
  COMICVINE_API_KEY,
  LIBRARY_RENAMING_RULE
} from '@app/admin/admin.constants';
import { LibraryConfigurationComponent } from '@app/admin/components/library-configuration/library-configuration.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { QUERY_PARAM_TAB } from '@app/library/library.constants';
import { MatCardModule } from '@angular/material/card';

describe('ConfigurationPageComponent', () => {
  const OPTIONS = [
    { ...CONFIGURATION_OPTION_1, name: COMICVINE_API_KEY },
    { ...CONFIGURATION_OPTION_2, name: LIBRARY_RENAMING_RULE },
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];
  const initialState = {
    [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: {
      ...initialConfigurationOptionListState,
      options: OPTIONS
    }
  };

  let component: ConfigurationPageComponent;
  let fixture: ComponentFixture<ConfigurationPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfigurationPageComponent,
        LibraryConfigurationComponent,
        ComicVineConfigurationComponent
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatDialogModule,
        MatTabsModule,
        MatCardModule
      ],
      providers: [
        provideMockStore({ initialState }),
        TitleService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      setTitleSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('query parameter processing', () => {
    const TAB = 2;

    it('loads the tab from the URL', () => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_TAB]: `${TAB}`
      });
      expect(component.currentTab).toEqual(TAB);
    });

    it('updates the URL when the tab changes', () => {
      component.onTabChange(TAB);
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
