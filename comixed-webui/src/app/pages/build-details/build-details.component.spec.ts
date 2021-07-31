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
import { BuildDetailsComponent } from './build-details.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  BUILD_DETAILS_FEATURE_KEY,
  initialState as initialBuildState
} from '@app/reducers/build-details.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BUILD_DETAILS } from '@app/app.fixtures';
import { MatCardModule } from '@angular/material/card';

describe('BuildDetailsComponent', () => {
  const initialState = {
    [BUILD_DETAILS_FEATURE_KEY]: {
      ...initialBuildState,
      details: BUILD_DETAILS
    }
  };

  let component: BuildDetailsComponent;
  let fixture: ComponentFixture<BuildDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildDetailsComponent],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
