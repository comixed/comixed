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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ReadingListEffects } from 'app/library/effects/reading-list.effects';
import {
  READING_LIST_FEATURE_KEY,
  reducer
} from 'app/library/reducers/reading-list.reducer';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MessageService } from 'primeng/api';
import { ReadingListAdaptor } from './reading-list.adaptor';

describe('ReadingListAdaptor', () => {
  let adaptor: ReadingListAdaptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(READING_LIST_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ReadingListEffects])
      ],
      providers: [ReadingListAdaptor, MessageService]
    });

    adaptor = TestBed.get(ReadingListAdaptor);
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });
});
