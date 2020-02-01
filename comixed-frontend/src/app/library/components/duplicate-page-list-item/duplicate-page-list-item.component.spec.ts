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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicsModule } from 'app/comics/comics.module';
import { LibraryAdaptor } from 'app/library';
import { DuplicatePagesEffects } from 'app/library/effects/duplicate-pages.effects';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import {
  DUPLICATE_PAGES_FEATURE_KEY,
  reducer
} from 'app/library/reducers/duplicate-pages.reducer';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { CardModule } from 'primeng/card';
import {
  ConfirmationService,
  MessageService,
  ProgressSpinnerModule,
  TooltipModule
} from 'primeng/primeng';
import { DuplicatePageListItemComponent } from './duplicate-page-list-item.component';

describe('DuplicatePageListItemComponent', () => {
  let component: DuplicatePageListItemComponent;
  let fixture: ComponentFixture<DuplicatePageListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        UserExperienceModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(DUPLICATE_PAGES_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([DuplicatePagesEffects]),
        CardModule,
        ProgressSpinnerModule,
        TooltipModule
      ],
      declarations: [DuplicatePageListItemComponent],
      providers: [MessageService, LibraryAdaptor, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicatePageListItemComponent);
    component = fixture.componentInstance;
    component.item = DUPLICATE_PAGE_1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
