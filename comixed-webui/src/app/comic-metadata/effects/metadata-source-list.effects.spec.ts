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
import { MetadataSourceListEffects } from './metadata-source-list.effects';
import { MetadataSourceService } from '@app/comic-metadata/services/metadata-source.service';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  loadMetadataSources,
  loadMetadataSourcesFailed,
  metadataSourcesLoaded
} from '@app/comic-metadata/actions/metadata-source-list.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('MetadataSourceListEffects', () => {
  const SOURCES = [METADATA_SOURCE_1];

  let actions$: Observable<any>;
  let effects: MetadataSourceListEffects;
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
        MetadataSourceListEffects,
        provideMockActions(() => actions$),
        {
          provide: MetadataSourceService,
          useValue: {
            loadAll: jasmine.createSpy('MetadataSourceService.loadAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MetadataSourceListEffects);
    metadataSourceService = TestBed.inject(
      MetadataSourceService
    ) as jasmine.SpyObj<MetadataSourceService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list metadata sources', () => {
    it('fires an action on success', () => {
      const serviceResponse = SOURCES;
      const action = loadMetadataSources();
      const outcome = metadataSourcesLoaded({ sources: SOURCES });

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadataSources$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMetadataSources();
      const outcome = loadMetadataSourcesFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadAll.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadataSources$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMetadataSources();
      const outcome = loadMetadataSourcesFailed();

      actions$ = hot('-a', { a: action });
      metadataSourceService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMetadataSources$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
