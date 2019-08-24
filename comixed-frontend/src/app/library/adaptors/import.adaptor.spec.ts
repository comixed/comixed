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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ImportAdaptor } from 'app/library/adaptors/import.adaptor';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { reducer } from 'app/library/reducers/import.reducer';

describe('Import', () => {
  let adaptor: ImportAdaptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ import_state: reducer })],
      providers: [ImportAdaptor]
    });

    adaptor = TestBed.get(ImportAdaptor);
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  it('provides updates on the set of comics files loaded', () => {});
});
