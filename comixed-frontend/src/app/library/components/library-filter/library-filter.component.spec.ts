/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { LibraryFilterComponent } from './library-filter.component';
import * as fromLibrary from 'app/library/reducers/library.reducer';
import * as fromFilter from 'app/library/reducers/filters.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { LibraryAdaptor } from 'app/library';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';
import { ComicsModule } from 'app/comics/comics.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('LibraryFilterComponent', () => {
  const PUBLISHER = 'DC';
  const SERIES = 'Batman';

  let component: LibraryFilterComponent;
  let fixture: ComponentFixture<LibraryFilterComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          fromLibrary.LIBRARY_FEATURE_KEY,
          fromLibrary.reducer
        ),
        StoreModule.forFeature(
          fromFilter.FILTERS_FEATURE_KEY,
          fromFilter.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        PanelModule,
        ButtonModule,
        DropdownModule
      ],
      providers: [LibraryAdaptor, FilterAdaptor, MessageService],
      declarations: [LibraryFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
