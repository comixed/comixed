/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { MetadataSourceEffects } from './metadata-source.effects';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { MetadataSourceService } from '@app/comic-metadata/services/metadata-source.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  clearMetadataSource,
  deleteMetadataSource,
  deleteMetadataSourceFailed,
  loadMetadataSource,
  loadMetadataSourceFailed,
  metadataSourceDeleted,
  metadataSourceLoaded,
  metadataSourceSaved,
  saveMetadataSource,
  saveMetadataSourceFailed
} from '@app/comic-metadata/actions/metadata-source.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('MetadataSourceEffects', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;

  let actions$: Observable<any>;
  let effects: MetadataSourceEffects;
  let metadataSourceService: jasmine.SpyObj<MetadataSourceService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        MetadataSourceEffects,
        provideMockActions(() => actions$),
        {
          provide: MetadataSourceService,
          useValue: {
            loadOne: jasmine.createSpy('MetadataSourceService.loadOne()'),
            save: jasmine.createSpy('MetadataSourceService.save()'),
            delete: jasmine.createSpy('MetadataSourceService.delete()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MetadataSourceEffects);
    metadataSourceService = TestBed.inject(
      MetadataSourceService
    ) as jasmine.SpyObj<MetadataSourceService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a source', () => {
    it('fires an action on success', () => {
      const serviceResponse = METADATA_SOURCE;
      const action = loadMetadataSource({ id: METADATA_SOURCE.id });
      const outcome = metadataSourceLoaded({ source: METADATA_SOURCE });

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadOne
        .withArgs({ id: METADATA_SOURCE.id })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMetadataSource({ id: METADATA_SOURCE.id });
      const outcome = loadMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadOne
        .withArgs({ id: METADATA_SOURCE.id })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMetadataSource({ id: METADATA_SOURCE.id });
      const outcome = loadMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadOne
        .withArgs({ id: METADATA_SOURCE.id })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving a source', () => {
    it('fires an action on success', () => {
      const serviceResponse = METADATA_SOURCE;
      const action = saveMetadataSource({ source: METADATA_SOURCE });
      const outcome = metadataSourceSaved({ source: METADATA_SOURCE });

      actions$ = hot('-a', { a: action });
      metadataSourceService.save
        .withArgs({ source: METADATA_SOURCE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveMetadataSource({ source: METADATA_SOURCE });
      const outcome = saveMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.save
        .withArgs({ source: METADATA_SOURCE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveMetadataSource({ source: METADATA_SOURCE });
      const outcome = saveMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.save
        .withArgs({ source: METADATA_SOURCE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('delete a source', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteMetadataSource({ source: METADATA_SOURCE });
      const outcome1 = metadataSourceDeleted();
      const outcome2 = clearMetadataSource();

      actions$ = hot('-a', { a: action });
      metadataSourceService.delete
        .withArgs({ source: METADATA_SOURCE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.delete$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteMetadataSource({ source: METADATA_SOURCE });
      const outcome = deleteMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.delete
        .withArgs({ source: METADATA_SOURCE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.delete$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteMetadataSource({ source: METADATA_SOURCE });
      const outcome = deleteMetadataSourceFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.delete
        .withArgs({ source: METADATA_SOURCE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.delete$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
