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
import { Observable } from 'rxjs';

import { ScanTypeEffects } from './scan-type.effects';
import { ScanTypeService } from '@app/library/services/scan-type.service';

describe('ScanTypeEffects', () => {
  const actions$: Observable<any> = null;
  let effects: ScanTypeEffects;
  let scanTypeService: jasmine.SpyObj<ScanTypeService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScanTypeEffects,
        provideMockActions(() => actions$),
        {
          provide: ScanTypeService,
          useValue: {}
        }
      ]
    });

    effects = TestBed.inject(ScanTypeEffects);
    scanTypeService = TestBed.inject(
      ScanTypeService
    ) as jasmine.SpyObj<ScanTypeService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
