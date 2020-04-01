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

import { LibraryNavigationTreeComponent } from './library-navigation-tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService, ScrollPanelModule, TreeModule } from 'primeng/primeng';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryAdaptor, ReadingListAdaptor } from 'app/library';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComicsModule } from 'app/comics/comics.module';

describe('LibraryNavigationTreeComponent', () => {
  let component: LibraryNavigationTreeComponent;
  let fixture: ComponentFixture<LibraryNavigationTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        TreeModule,
        ScrollPanelModule
      ],
      declarations: [LibraryNavigationTreeComponent],
      providers: [LibraryAdaptor, ReadingListAdaptor, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryNavigationTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
