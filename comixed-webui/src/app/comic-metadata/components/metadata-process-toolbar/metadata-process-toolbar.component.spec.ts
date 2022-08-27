/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataProcessToolbarComponent } from './metadata-process-toolbar.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { startMetadataUpdateProcess } from '@app/comic-metadata/actions/metadata.actions';

describe('MetadataProcessToolbarComponent', () => {
  const initialState = {};
  const IDS = [3, 20, 96, 9, 21, 98, 4, 17, 6];

  let component: MetadataProcessToolbarComponent;
  let fixture: ComponentFixture<MetadataProcessToolbarComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataProcessToolbarComponent],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProcessToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('starting the metadata update process', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selectedIds = IDS;
      component.onStartBatchProcess();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        startMetadataUpdateProcess({ ids: IDS, skipCache: false })
      );
    });
  });
});
