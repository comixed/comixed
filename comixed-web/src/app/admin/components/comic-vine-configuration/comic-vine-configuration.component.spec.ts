/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { ComicVineConfigurationComponent } from './comic-vine-configuration.component';
import { LoggerModule } from '@angular-ru/logger';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ComicVineConfigurationComponent', () => {
  const formBuilder = new FormBuilder();

  let component: ComicVineConfigurationComponent;
  let fixture: ComponentFixture<ComicVineConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicVineConfigurationComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicVineConfigurationComponent);
    component = fixture.componentInstance;
    component.form = formBuilder.group({ apiKey: null });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
