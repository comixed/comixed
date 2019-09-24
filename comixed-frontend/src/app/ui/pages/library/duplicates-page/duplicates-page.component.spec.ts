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
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { UserService } from 'app/services/user.service';
import { UserServiceMock } from 'app/services/user.service.mock';
import { DuplicatePagesViewComponent } from 'app/ui/views/library/duplicate-pages-view/duplicate-pages-view.component';
import { PageHashViewComponent } from 'app/ui/views/library/page-hash-view/page-hash-view.component';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { DuplicatesPageComponent } from './duplicates-page.component';
import { REDUCERS } from 'app/app.reducers';

describe('DuplicatesPageComponent', () => {
  let component: DuplicatesPageComponent;
  let fixture: ComponentFixture<DuplicatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        CardModule,
        DataViewModule,
        DropdownModule,
        SliderModule,
        ButtonModule,
        TableModule
      ],
      declarations: [
        DuplicatesPageComponent,
        DuplicatePagesViewComponent,
        PageHashViewComponent,
        ComicPageUrlPipe,
        ComicTitlePipe,
        ComicCoverUrlPipe
      ],
      providers: [
        MessageService,
        { provide: UserService, useClass: UserServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
