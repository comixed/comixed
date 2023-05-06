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
import {
  ALERT_HORZ_POSITION,
  ALERT_VERT_POSITION,
  AlertService,
  ERROR_MESSAGE_DURATION,
  INFO_MESSAGE_DURATION
} from './alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  MatSnackBar,
  MatSnackBarModule,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AlertService', () => {
  const TEST_MESSAGE = 'This is the alert message';

  let service: AlertService;
  let snackbar: MatSnackBar;
  let snackbarRef: jasmine.SpyObj<MatSnackBarRef<TextOnlySnackBar>>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        {
          provide: MatSnackBarRef,
          useValue: {
            afterOpened: jasmine.createSpy('MatSnackBarRef.afterOpened()')
          }
        }
      ]
    });

    service = TestBed.inject(AlertService);
    snackbar = TestBed.inject(MatSnackBar);
    snackbarRef = TestBed.inject(MatSnackBarRef) as jasmine.SpyObj<
      MatSnackBarRef<TextOnlySnackBar>
    >;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showing an information alert', () => {
    beforeEach(() => {
      spyOn(snackbar, 'open');
      service.info(TEST_MESSAGE);
    });

    it('opens the message popup', () => {
      expect(snackbar.open).toHaveBeenCalledWith(
        TEST_MESSAGE,
        jasmine.any(String),
        jasmine.objectContaining({
          duration: INFO_MESSAGE_DURATION,
          horizontalPosition: ALERT_HORZ_POSITION,
          verticalPosition: ALERT_VERT_POSITION
        })
      );
    });
  });

  describe('showing an error alert', () => {
    beforeEach(() => {
      spyOn(router, 'navigateByUrl').and.callThrough();
      spyOn(snackbar, 'open').and.returnValue(snackbarRef);
    });

    describe('without an error url', () => {
      beforeEach(() => {
        service.error(TEST_MESSAGE);
      });

      it('opens the message popup', () => {
        expect(snackbar.open).toHaveBeenCalledWith(
          TEST_MESSAGE,
          jasmine.any(String),
          jasmine.objectContaining({
            duration: ERROR_MESSAGE_DURATION,
            horizontalPosition: ALERT_HORZ_POSITION,
            verticalPosition: ALERT_VERT_POSITION
          })
        );
      });

      it('does not navigate away from the page', () => {
        expect(router.navigateByUrl).not.toHaveBeenCalledWith(
          jasmine.any(String)
        );
      });
    });

    describe('with an error url', () => {
      const ERROR_URL = '/error/url';
      const afterOpenObservable = new BehaviorSubject<void>(null);

      beforeEach(() => {
        snackbarRef.afterOpened.and.returnValue(
          afterOpenObservable.asObservable()
        );
        service.error(TEST_MESSAGE, ERROR_URL);
      });

      it('opens the message popup', () => {
        expect(snackbar.open).toHaveBeenCalledWith(
          TEST_MESSAGE,
          jasmine.any(String),
          jasmine.objectContaining({
            duration: ERROR_MESSAGE_DURATION,
            horizontalPosition: ALERT_HORZ_POSITION,
            verticalPosition: ALERT_VERT_POSITION
          })
        );
      });

      it('navigates to the provided url', () => {
        afterOpenObservable.next(null);
        expect(router.navigateByUrl).toHaveBeenCalledWith(ERROR_URL);
      });
    });
  });
});
