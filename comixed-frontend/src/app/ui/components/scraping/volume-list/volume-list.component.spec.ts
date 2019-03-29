/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { libraryReducer } from '../../../../reducers/library.reducer';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { VolumeListComponent } from './volume-list.component';
import { TooltipModule } from 'primeng/primeng';

describe('VolumeListComponent', () => {
  let component: VolumeListComponent;
  let fixture: ComponentFixture<VolumeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        TableModule,
        CardModule,
        ButtonModule,
        TooltipModule
      ],
      declarations: [VolumeListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when setting volumes', () => {
    xit('finds the best candidates');
  });

  describe('#set_current_volume()', () => {
    xit('notifies components of the current volume');
    xit('loads the details for the volume');
  });

  describe('#return_to_editing()', () => {
    xit('resets the current list of volumes');
  });

  describe('#select_current_issue()', () => {
    xit('notifies of the selection');
  });

  describe('#cancel_selection()', () => {
    xit('notifies of the cancellation');
  });
});
