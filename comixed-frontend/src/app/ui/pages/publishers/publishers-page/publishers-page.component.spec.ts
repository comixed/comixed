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
import { PublishersPageComponent } from './publishers-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule, DropdownModule, PanelModule } from 'primeng/primeng';
import { LibraryFilterComponent } from '../../../components/library/library-filter/library-filter.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { libraryReducer } from '../../../../reducers/library.reducer';
import { AppState } from '../../../../app.state';
import * as LibraryActions from '../../../../actions/library.actions';

describe('PublishersPageComponent', () => {
  let component: PublishersPageComponent;
  let fixture: ComponentFixture<PublishersPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          library: libraryReducer
        }),
        TranslateModule.forRoot(),
        TableModule,
        DropdownModule,
        PanelModule,
        ButtonModule
      ],
      declarations: [
        PublishersPageComponent,
        LibraryFilterComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublishersPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);

    store.dispatch(new LibraryActions.LibraryReset());

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

