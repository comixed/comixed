/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { BuildDetailsPageComponent } from './build-details-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import {
  BUILD_DETAILS_FEATURE_KEY,
  reducer
} from 'app/backend-status/reducers/build-details.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BuildDetailsEffects } from 'app/backend-status/effects/build-details.effects';
import { MessageService } from 'primeng/api';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/logger';
import { Title } from '@angular/platform-browser';

describe('BuildDetailsPageComponent', () => {
  let component: BuildDetailsPageComponent;
  let fixture: ComponentFixture<BuildDetailsPageComponent>;
  let breadcrumbAdaptor: BreadcrumbAdaptor;
  let titleService: Title;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(BUILD_DETAILS_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([BuildDetailsEffects])
      ],
      providers: [BreadcrumbAdaptor, MessageService],
      declarations: [BuildDetailsPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);
    spyOn(breadcrumbAdaptor, 'loadEntries');
    titleService = TestBed.get(Title);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.get(TranslateService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('reloads the breadcrumb trail', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });

    it('reloads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalled();
    });
  });
});
