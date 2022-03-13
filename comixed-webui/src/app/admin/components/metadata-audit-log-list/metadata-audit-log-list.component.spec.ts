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
import { MetadataAuditLogListComponent } from './metadata-audit-log-list.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  USER_FEATURE_KEY,
  initialState as initialUserState
} from '@app/user/reducers/user.reducer';
import {
  METADATA_AUDIT_LOG_FEATURE_KEY,
  initialState as initialMetadataAuditLogState
} from '@app/comic-metadata/reducers/metadata-audit-log.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  clearMetadataAuditLog,
  loadMetadataAuditLog
} from '@app/comic-metadata/actions/metadata-audit-log.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';
import { METADATA_AUDIT_LOG_ENTRY_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('MetadataAuditLogListComponent', () => {
  const ENTRY = METADATA_AUDIT_LOG_ENTRY_1;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [METADATA_AUDIT_LOG_FEATURE_KEY]: initialMetadataAuditLogState
  };

  let component: MetadataAuditLogListComponent;
  let fixture: ComponentFixture<MetadataAuditLogListComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataAuditLogListComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatToolbarModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatPaginatorModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataAuditLogListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reloading the log entries', () => {
    beforeEach(() => {
      component.onReloadEntries();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(loadMetadataAuditLog());
    });
  });

  describe('clearing the log entries', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onClearEntries();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(clearMetadataAuditLog());
    });
  });

  describe('changes in pagination', () => {
    const PAGE_SIZE = 25;

    beforeEach(() => {
      component.onPageChange({ pageSize: PAGE_SIZE } as PageEvent);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: PAGE_SIZE_PREFERENCE,
          value: `${PAGE_SIZE}`
        })
      );
    });
  });

  describe('sorting entries', () => {
    it('can sort by created date', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'created-on')
      ).toEqual(ENTRY.createdOn);
    });

    it('can sort by metadata source name', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'metadata-source')
      ).toEqual(ENTRY.metadataSource.name);
    });

    it('can sort by comic', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'comic')).toEqual(
        ENTRY.comic.series
      );
    });
  });
});
