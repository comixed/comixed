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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { ServerRuntimeEffects } from './server-runtime.effects';
import { ServerRuntimeService } from '@app/admin/services/server-runtime.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  loadServerHealth,
  loadServerHealthFailed,
  serverHealthLoaded,
  serverShutdown,
  shutdownServer,
  shutdownServerFailed
} from '@app/admin/actions/server-runtime.actions';
import { hot } from 'jasmine-marbles';
import { SERVER_HEALTH } from '@app/admin/admin.fixtures';

describe('ServerRuntimeEffects', () => {
  const HEALTH = SERVER_HEALTH;

  let actions$: Observable<any>;
  let effects: ServerRuntimeEffects;
  let serverRuntimeService: jasmine.SpyObj<ServerRuntimeService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ServerRuntimeEffects,
        provideMockActions(() => actions$),
        {
          provide: ServerRuntimeService,
          useValue: {
            loadServerHealth: jasmine.createSpy(
              'ServerRuntimeService.loadServerHealth()'
            ),
            shutdownServer: jasmine.createSpy(
              'ServerRuntimeService.shutdownServer()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ServerRuntimeEffects);
    serverRuntimeService = TestBed.inject(
      ServerRuntimeService
    ) as jasmine.SpyObj<ServerRuntimeService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading server health', () => {
    it('fires an action on success', () => {
      const serviceResponse = HEALTH;
      const action = loadServerHealth();
      const outcome = serverHealthLoaded({ health: HEALTH });

      actions$ = hot('-a', { a: action });
      serverRuntimeService.loadServerHealth.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadServerHealth$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadServerHealth();
      const outcome = loadServerHealthFailed();

      actions$ = hot('-a', { a: action });
      serverRuntimeService.loadServerHealth.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadServerHealth$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadServerHealth();
      const outcome = loadServerHealthFailed();

      actions$ = hot('-a', { a: action });
      serverRuntimeService.loadServerHealth.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadServerHealth$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('shutting down the server', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = shutdownServer();
      const outcome = serverShutdown();

      actions$ = hot('-a', { a: action });
      serverRuntimeService.shutdownServer.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.shutdownServer$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = shutdownServer();
      const outcome = shutdownServerFailed();

      actions$ = hot('-a', { a: action });
      serverRuntimeService.shutdownServer.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.shutdownServer$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = shutdownServer();
      const outcome = shutdownServerFailed();

      actions$ = hot('-a', { a: action });
      serverRuntimeService.shutdownServer.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.shutdownServer$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
