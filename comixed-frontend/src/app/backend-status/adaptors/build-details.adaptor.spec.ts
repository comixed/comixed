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

import { BuildDetailsAdaptor } from './build-details.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  BUILD_DETAILS_FEATURE_KEY,
  reducer
} from 'app/backend-status/reducers/build-details.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BuildDetailsEffects } from 'app/backend-status/effects/build-details.effects';
import { MessageService } from 'primeng/api';
import { BuildDetailsReceive } from 'app/backend-status/actions/build-details.actions';
import { BUILD_DETAILS } from 'app/backend-status/models/build-details.fixtures';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/backend-status';

describe('BuildDetailsAdaptor', () => {
  let adaptor: BuildDetailsAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(BUILD_DETAILS_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([BuildDetailsEffects])
      ],
      providers: [BuildDetailsAdaptor, MessageService]
    });

    adaptor = TestBed.get(BuildDetailsAdaptor);
    store = TestBed.get(Store);
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  it('provides updates when the build details change', () => {
    store.dispatch(new BuildDetailsReceive({ build_details: BUILD_DETAILS }));
    adaptor.build_detail$.subscribe(result =>
      expect(result).toEqual(BUILD_DETAILS)
    );
  });
});
