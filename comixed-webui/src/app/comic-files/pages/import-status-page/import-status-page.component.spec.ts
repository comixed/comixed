/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportStatusPageComponent } from './import-status-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  initialState as initialProcessComicsState,
  PROCESS_COMICS_FEATURE_KEY
} from '@app/reducers/process-comics.reducer';
import { Router } from '@angular/router';

describe('ImportStatusPageComponent', () => {
  const initialState = {
    [PROCESS_COMICS_FEATURE_KEY]: initialProcessComicsState
  };

  let component: ImportStatusPageComponent;
  let fixture: ComponentFixture<ImportStatusPageComponent>;
  let router: Router;
  let navigateByUrlSpy: jasmine.Spy;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportStatusPageComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatProgressBarModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportStatusPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when no import is in process', () => {
    beforeEach(() => {
      navigateByUrlSpy.calls.reset();
      store.setState({
        ...initialState,
        [PROCESS_COMICS_FEATURE_KEY]: {
          ...initialProcessComicsState,
          active: false
        }
      });
    });

    it('redirects the browser to the import page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/library/import');
    });
  });

  describe('when an import is in process', () => {
    const STARTED = Math.abs(Math.floor(Math.random() * 1000));
    const STEP_NAME = 'step.name';
    const PROCESSED = Math.abs(Math.floor(Math.random() * 1000));
    const TOTAL = PROCESSED * 4;

    beforeEach(() => {
      navigateByUrlSpy.calls.reset();
      component.started = 0;
      component.stepName = '';
      component.total = 0;
      component.processed = 0;
      component.progress = 0;

      store.setState({
        ...initialState,
        [PROCESS_COMICS_FEATURE_KEY]: {
          ...initialProcessComicsState,
          active: true,
          started: STARTED,
          stepName: STEP_NAME,
          total: TOTAL,
          processed: PROCESSED
        }
      });
    });

    it('sets the started value', () => {
      expect(component.started).toEqual(STARTED);
    });

    it('sets the step name value', () => {
      expect(component.stepName).toEqual(STEP_NAME);
    });

    it('sets the total value', () => {
      expect(component.total).toEqual(TOTAL);
    });

    it('sets the processed value', () => {
      expect(component.processed).toEqual(PROCESSED);
    });

    it('sets the progress value', () => {
      expect(component.progress).toEqual((PROCESSED / TOTAL) * 100);
    });
  });
});
