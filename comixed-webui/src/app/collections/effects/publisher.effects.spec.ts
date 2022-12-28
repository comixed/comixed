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
import { PublisherEffects } from './publisher.effects';
import {
  PUBLISHER_1,
  PUBLISHER_2,
  PUBLISHER_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';
import { PublisherService } from '@app/collections/services/publisher.service';
import {
  loadPublisherDetail,
  loadPublisherDetailFailed,
  loadPublishers,
  loadPublishersFailed,
  publisherDetailLoaded,
  publishersLoaded
} from '@app/collections/actions/publisher.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('PublisherEffects', () => {
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const PUBLISHER = PUBLISHER_3;
  const DETAIL = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];

  let actions$: Observable<any>;
  let effects: PublisherEffects;
  let publisherService: jasmine.SpyObj<PublisherService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        PublisherEffects,
        provideMockActions(() => actions$),
        {
          provide: PublisherService,
          useValue: {
            loadPublishers: jasmine.createSpy(
              'PublisherService.loadPublishers()'
            ),
            loadPublisherDetail: jasmine.createSpy(
              'PublisherService.loadPublisherDetail()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(PublisherEffects);
    publisherService = TestBed.inject(
      PublisherService
    ) as jasmine.SpyObj<PublisherService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading all publishers', () => {
    it('fires an action on success', () => {
      const serviceResponse = PUBLISHERS;
      const action = loadPublishers();
      const outcome = publishersLoaded({ publishers: PUBLISHERS });

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadPublishers();
      const outcome = loadPublishersFailed();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadPublishers();
      const outcome = loadPublishersFailed();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a single publisher', () => {
    it('fires an action on success', () => {
      const serviceResponse = DETAIL;
      const action = loadPublisherDetail({ name: PUBLISHER.name });
      const outcome = publisherDetailLoaded({ detail: DETAIL });

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({ name: PUBLISHER.name })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadPublisherDetail({ name: PUBLISHER.name });
      const outcome = loadPublisherDetailFailed();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({ name: PUBLISHER.name })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadPublisherDetail({ name: PUBLISHER.name });
      const outcome = loadPublisherDetailFailed();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({ name: PUBLISHER.name })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
