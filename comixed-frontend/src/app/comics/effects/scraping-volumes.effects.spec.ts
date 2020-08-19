/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { ScrapingVolumesEffects } from './scraping-volumes.effects';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { AlertService, ApiResponse } from 'app/core';
import { CoreModule } from 'app/core/core.module';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import {
  getScrapingVolumes,
  getScrapingVolumesFailed,
  scrapingVolumesReceived
} from 'app/comics/actions/scraping-volumes.actions';
import { hot } from 'jasmine-marbles';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/comics.fixtures';

describe('ScrapingVolumesEffects', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const MAX_RECORDS = 55;
  const VOLUME = '2019';
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];

  let actions$: Observable<any>;
  let effects: ScrapingVolumesEffects;
  let scrapingService: jasmine.SpyObj<ScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ScrapingVolumesEffects,
        provideMockActions(() => actions$),
        {
          provide: ScrapingService,
          useValue: {
            getVolumes: jasmine.createSpy('ScrapingService.getVolumes()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ScrapingVolumesEffects>(ScrapingVolumesEffects);
    scrapingService = TestBed.get(ScrapingService) as jasmine.SpyObj<
      ScrapingService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('fetching scraping volumes', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true, result: VOLUMES } as ApiResponse<
        ScrapingVolume[]
      >;
      const action = getScrapingVolumes({
        apiKey: API_KEY,
        volume: VOLUME,
        series: SERIES,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapingVolumesReceived({ volumes: VOLUMES });

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingVolumes$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<
        ScrapingVolume[]
      >;
      const action = getScrapingVolumes({
        apiKey: API_KEY,
        volume: VOLUME,
        series: SERIES,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = getScrapingVolumes({
        apiKey: API_KEY,
        volume: VOLUME,
        series: SERIES,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = getScrapingVolumes({
        apiKey: API_KEY,
        volume: VOLUME,
        series: SERIES,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
