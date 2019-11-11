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

import { DuplicatesPageToolbarComponent } from './duplicates-page-toolbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  CheckboxModule,
  MessageService,
  SliderModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { LibraryDisplayAdaptor } from 'app/library';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationAdaptor } from 'app/user';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DuplicatesPageToolbarComponent', () => {
  let component: DuplicatesPageToolbarComponent;
  let fixture: ComponentFixture<DuplicatesPageToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        ButtonModule,
        DropdownModule,
        TooltipModule,
        CheckboxModule,
        SliderModule,
        ToolbarModule
      ],
      declarations: [DuplicatesPageToolbarComponent],
      providers: [LibraryDisplayAdaptor, MessageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatesPageToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
