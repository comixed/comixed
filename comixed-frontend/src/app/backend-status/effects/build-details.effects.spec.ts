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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { BuildDetailsEffects } from './build-details.effects';
import { BuildDetailsService } from 'app/backend-status/services/build-details.service';
import { BUILD_DETAILS } from 'app/backend-status/models/build-details.fixtures';
import {
  BuildDetailsGet,
  BuildDetailsGetFailed,
  BuildDetailsReceive
} from 'app/backend-status/actions/build-details.actions';
import { hot } from 'jasmine-marbles';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import objectContaining = jasmine.objectContaining;
import { HttpErrorResponse } from '@angular/common/http';

describe('BuildDetailsEffects', () => {
  let actions$: Observable<any>;
  let effects: BuildDetailsEffects;
  let build_details_service: jasmine.SpyObj<BuildDetailsService>;
  let message_service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        BuildDetailsEffects,
        provideMockActions(() => actions$),
        {
          provide: BuildDetailsService,
          useValue: {
            get_build_details: jasmine.createSpy(
              'BuildDetailsService.get_build_details'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(BuildDetailsEffects);
    build_details_service = TestBed.get(BuildDetailsService);
    message_service = TestBed.get(MessageService);
    spyOn(message_service, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting the build details', () => {
    it('fires an action on success', () => {
      const service_response = BUILD_DETAILS;
      const action = new BuildDetailsGet();
      const outcome = new BuildDetailsReceive({
        build_details: service_response
      });

      actions$ = hot('-a', { a: action });
      build_details_service.get_build_details.and.returnValue(
        of(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.get_build_details$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new BuildDetailsGet();
      const outcome = new BuildDetailsGetFailed();

      actions$ = hot('-a', { a: action });
      build_details_service.get_build_details.and.returnValue(
        throwError(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.get_build_details$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new BuildDetailsGet();
      const outcome = new BuildDetailsGetFailed();

      actions$ = hot('-a', { a: action });
      build_details_service.get_build_details.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.get_build_details$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
