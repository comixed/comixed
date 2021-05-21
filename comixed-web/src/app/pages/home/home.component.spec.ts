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
import { HomeComponent } from '@app/pages/home/home.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { RouterTestingModule } from '@angular/router/testing';
import {
  initialState as initialServerStatusState,
  SERVER_STATUS_FEATURE_KEY
} from '@app/reducers/server-status.reducer';
import { provideMockStore } from '@ngrx/store/testing';

describe('HomeComponent', () => {
  const initialState = {
    [SERVER_STATUS_FEATURE_KEY]: initialServerStatusState
  };

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [TitleService, provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
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
