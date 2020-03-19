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

import { PublisherEffects } from './publisher.effects';
import { MessageService } from 'primeng/api';
import { PublisherService } from 'app/library/services/publisher.service';
import { TranslateModule } from '@ngx-translate/core';
import { PUBLISHER_1 } from 'app/library/models/publisher.fixtures';
import {
  PublisherGet,
  PublisherGetFailed,
  PublisherReceived
} from 'app/library/actions/publisher.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/logger';
import objectContaining = jasmine.objectContaining;

describe('PublisherEffects', () => {
  const PUBLISHER = PUBLISHER_1;
  const PUBLISHER_NAME = PUBLISHER.name;

  let actions$: Observable<any>;
  let effects: PublisherEffects;
  let publisherService: jasmine.SpyObj<PublisherService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        PublisherEffects,
        provideMockActions(() => actions$),
        {
          provide: PublisherService,
          useValue: {
            getPublisherByName: jasmine.createSpy(
              'PublisherService.getPublisherByName()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<PublisherEffects>(PublisherEffects);
    publisherService = TestBed.get(PublisherService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting a publisher', () => {
    it('fires an action on success', () => {
      const serviceResponse = PUBLISHER;
      const action = new PublisherGet({ name: PUBLISHER_NAME });
      const outcome = new PublisherReceived({ publisher: PUBLISHER });

      actions$ = hot('-a', { a: action });
      publisherService.getPublisherByName.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getPublisherByName$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new PublisherGet({ name: PUBLISHER_NAME });
      const outcome = new PublisherGetFailed();

      actions$ = hot('-a', { a: action });
      publisherService.getPublisherByName.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getPublisherByName$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new PublisherGet({ name: PUBLISHER_NAME });
      const outcome = new PublisherGetFailed();

      actions$ = hot('-a', { a: action });
      publisherService.getPublisherByName.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getPublisherByName$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
