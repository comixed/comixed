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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { LibraryFilterComponent } from 'app/library/components/library-filter/library-filter.component';
import { LocationsPageComponent } from './locations-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { LibraryAdaptor } from 'app/library';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { ComicsModule } from 'app/comics/comics.module';
import { CheckboxModule } from 'primeng/checkbox';

describe('LocationsPageComponent', () => {
  let component: LocationsPageComponent;
  let fixture: ComponentFixture<LocationsPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        RouterTestingModule,
        ButtonModule,
        DropdownModule,
        TableModule,
        PanelModule,
        CheckboxModule
      ],
      declarations: [LocationsPageComponent, LibraryFilterComponent],
      providers: [
        BreadcrumbAdaptor,
        LibraryAdaptor,
        MessageService,
        ComicService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
