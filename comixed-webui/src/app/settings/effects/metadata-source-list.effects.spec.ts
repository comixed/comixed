/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { MetadataSourceListEffects } from './metadata-source-list.effects';
import { MetadataSourceService } from '@app/settings/services/metadata-source-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { expect, vi } from 'vitest';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/settings/settings-fixtures';
import { MetadataSourceListActions } from '@app/settings/actions/metadata-source-list.actions';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { HttpErrorResponse } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';

describe('MetadataSourceListEffects', () => {
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_METADATA_SOURCE_LIST = [METADATA_SOURCE_1, METADATA_SOURCE_2];

  let actions$: Observable<unknown>;
  let effects: MetadataSourceListEffects;
  let metadataSourceService: MetadataSourceService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetadataSourceListEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MetadataSourceService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(MetadataSourceListEffects);
    metadataSourceService = TestBed.inject(MetadataSourceService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the metadata source list', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_METADATA_SOURCE_LIST;
      const action = MetadataSourceListActions.load();
      const outcome = MetadataSourceListActions.loadSuccess({
        entries: TEST_METADATA_SOURCE_LIST
      });

      const loadSpy = vi
        .spyOn(metadataSourceService, 'load')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MetadataSourceListActions.load();
      const outcome = MetadataSourceListActions.loadFailure();

      const loadSpy = vi
        .spyOn(metadataSourceService, 'load')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = MetadataSourceListActions.load();
      const outcome = MetadataSourceListActions.loadFailure();

      const loadSpy = vi
        .spyOn(metadataSourceService, 'load')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saving the metadata source list', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_METADATA_SOURCE;
      const action = MetadataSourceListActions.save({
        source: TEST_METADATA_SOURCE
      });
      const outcome = MetadataSourceListActions.saveSuccess({
        entry: TEST_METADATA_SOURCE
      });

      const loadSpy = vi
        .spyOn(metadataSourceService, 'save')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MetadataSourceListActions.save({
        source: TEST_METADATA_SOURCE
      });
      const outcome = MetadataSourceListActions.saveFailure();

      const loadSpy = vi
        .spyOn(metadataSourceService, 'save')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = MetadataSourceListActions.save({
        source: TEST_METADATA_SOURCE
      });
      const outcome = MetadataSourceListActions.saveFailure();

      const loadSpy = vi
        .spyOn(metadataSourceService, 'save')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
