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

import { DuplicatesPageComponent } from './duplicates-page.component';
import { DuplicatesPageToolbarComponent } from 'app/library/components/duplicates-page-toolbar/duplicates-page-toolbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';
import { DuplicatePageGridItemComponent } from 'app/library/components/duplicate-page-grid-item/duplicate-page-grid-item.component';
import { DuplicatePageListItemComponent } from 'app/library/components/duplicate-page-list-item/duplicate-page-list-item.component';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  CardModule,
  CheckboxModule,
  ConfirmationService,
  MessageService,
  ProgressSpinnerModule,
  SliderModule,
  SplitButtonModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LibraryDisplayAdaptor } from 'app/library';
import { RouterTestingModule } from '@angular/router/testing';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { LoggerModule } from '@angular-ru/logger';

describe('DuplicatesPageComponent', () => {
  let component: DuplicatesPageComponent;
  let fixture: ComponentFixture<DuplicatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        DataViewModule,
        ButtonModule,
        DropdownModule,
        ToolbarModule,
        TooltipModule,
        CheckboxModule,
        SliderModule,
        CardModule,
        ProgressSpinnerModule,
        SplitButtonModule
      ],
      declarations: [
        DuplicatesPageComponent,
        DuplicatesPageToolbarComponent,
        DuplicatePageGridItemComponent,
        DuplicatePageListItemComponent,
        ComicCoverComponent,
        ComicPageUrlPipe
      ],
      providers: [
        DuplicatePagesAdaptors,
        LibraryDisplayAdaptor,
        MessageService,
        BreadcrumbAdaptor,
        ConfirmationService
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
