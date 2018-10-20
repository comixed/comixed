/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import {
  async,
  fakeAsync,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ImportComicListComponent } from './import-comic-list.component';
import { FileDetails } from '../file-details.model';

describe('ImportComicListComponent', () => {
  let component: ImportComicListComponent;
  let fixture: ComponentFixture<ImportComicListComponent>;
  let file_details: FileDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComicListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportComicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    file_details = new FileDetails();
  });

  describe('import_selected_files()', () => {

    it('clears the selected file', fakeAsync(() => {
      component.selected_file_detail = file_details;

      component.import_selected_files();

      expect(component.selected_file_detail).toBe(null);
    }));

  });
});
