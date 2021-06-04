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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WebAuditLogPageComponent } from './web-audit-log-page.component';
import {
  initialState as initialWebAuditLogState,
  WEB_AUDIT_LOG_FEATURE_KEY
} from '@app/admin/reducers/web-audit-log.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  clearWebAuditLog,
  loadWebAuditLogEntries
} from '@app/admin/actions/web-audit-log.actions';
import { WEB_AUDIT_LOG_ENTRY_1 } from '@app/admin/admin.fixtures';
import { Confirmation } from '@app/core/models/confirmation';
import { ConfirmationService } from '@app/core/services/confirmation.service';

describe('WebAuditLogPageComponent', () => {
  const TIMESTAMP = new Date().getTime();
  const ITEM = WEB_AUDIT_LOG_ENTRY_1;
  const initialState = { [WEB_AUDIT_LOG_FEATURE_KEY]: initialWebAuditLogState };

  let component: WebAuditLogPageComponent;
  let fixture: ComponentFixture<WebAuditLogPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;
  let sidenav: MatSidenav;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebAuditLogPageComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatPaginatorModule,
        MatIconModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTableModule,
        MatFormFieldModule
      ],
      providers: [
        provideMockStore({ initialState }),
        ConfirmationService,
        {
          provide: MatSidenav,
          useValue: { open: jasmine.createSpy('MatSidenav.open()') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WebAuditLogPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    confirmationService = TestBed.inject(ConfirmationService);
    sidenav = TestBed.inject(MatSidenav);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.paginator._intl.itemsPerPageLabel = '';
      translateService.use('fr');
    });

    it('updates the items per page label', () => {
      expect(component.paginator._intl.itemsPerPageLabel).not.toEqual('');
    });
  });

  describe('when updates are received', () => {
    describe('if not loading data', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [WEB_AUDIT_LOG_FEATURE_KEY]: {
            ...initialWebAuditLogState,
            loading: false,
            latest: TIMESTAMP
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadWebAuditLogEntries({ timestamp: TIMESTAMP })
        );
      });
    });

    describe('currently loading data', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [WEB_AUDIT_LOG_FEATURE_KEY]: {
            ...initialWebAuditLogState,
            loading: true,
            latest: TIMESTAMP
          }
        });
      });

      it('does not fires an action', () => {
        expect(store.dispatch).not.toHaveBeenCalledWith(
          loadWebAuditLogEntries({ timestamp: TIMESTAMP })
        );
      });
    });
  });

  describe('sorting data', () => {
    it('can sort by remote ip', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'remote-ip')
      ).toEqual(ITEM.remoteIp);
    });

    it('can sort by start time', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'started')).toEqual(
        `${ITEM.startTime}`
      );
    });

    it('can sort by email', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'email')).toEqual(
        ITEM.email
      );
    });
  });

  describe('clearing the audit log', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onClearLog();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(clearWebAuditLog());
    });
  });

  describe('request content', () => {
    beforeEach(() => {
      component.onShowRequestContent(ITEM, sidenav);
    });

    it('sets the content to display', () => {
      expect(component.content).toEqual(JSON.parse(ITEM.requestContent));
    });

    it('shows the sidenav container', () => {
      expect(sidenav.open).toHaveBeenCalled();
    });
  });

  describe('response content', () => {
    beforeEach(() => {
      component.onShowResponseContent(ITEM, sidenav);
    });

    it('sets the content to display', () => {
      expect(component.content).toEqual(JSON.parse(ITEM.responseContent));
    });

    it('shows the sidenav container', () => {
      expect(sidenav.open).toHaveBeenCalled();
    });
  });
});
