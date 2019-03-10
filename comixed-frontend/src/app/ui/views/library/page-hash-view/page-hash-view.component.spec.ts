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
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ComicPageUrlPipe } from '../../../../pipes/comic-page-url.pipe';
import { ComicCoverUrlPipe } from '../../../../pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '../../../../pipes/comic-title.pipe';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { libraryReducer } from '../../../../reducers/library.reducer';
import { DuplicatePage } from '../../../../models/comics/duplicate-page';
import { PageHashViewComponent } from './page-hash-view.component';

describe('PageHashViewComponent', () => {
  let component: PageHashViewComponent;
  let fixture: ComponentFixture<PageHashViewComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ButtonModule,
        TableModule,
        CardModule,
        StoreModule.forRoot({ library: libraryReducer }),
        RouterModule.forRoot([])
      ],
      declarations: [
        PageHashViewComponent,
        ComicPageUrlPipe,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHashViewComponent);
    component = fixture.componentInstance;
    component.duplicates = {
      busy: false,
      pages: [],
      hashes: [],
      pages_by_hash: new Map<string, Array<DuplicatePage>>(),
      current_hash: '',
      current_duplicates: [],
      last_hash: '',
      pages_deleted: 0,
      pages_undeleted: 0
    };
    fixture.detectChanges();
    store = TestBed.get(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
