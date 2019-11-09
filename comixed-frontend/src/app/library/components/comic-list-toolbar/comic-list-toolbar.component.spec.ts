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
import { ComicListToolbarComponent } from './comic-list-toolbar.component';
import {
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  DropdownModule,
  MessageService,
  SliderModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  SelectionAdaptor
} from 'app/library';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationAdaptor } from 'app/user';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComicsModule } from 'app/comics/comics.module';

describe('ComicListToolbarComponent', () => {
  let component: ComicListToolbarComponent;
  let fixture: ComponentFixture<ComicListToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        ToolbarModule,
        ButtonModule,
        TooltipModule,
        DropdownModule,
        SliderModule,
        CheckboxModule
      ],
      declarations: [ComicListToolbarComponent],
      providers: [
        AuthenticationAdaptor,
        SelectionAdaptor,
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
