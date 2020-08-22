/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { RestAuditLogPageComponent } from './rest-audit-log-page.component';
import { TableModule } from 'primeng/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { StoreModule } from '@ngrx/store';
import * as fromLoadRestAuditLogEntries from 'app/backend-status/reducers/load-rest-audit-log.reducer';
import { LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY } from 'app/backend-status/reducers/load-rest-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LoadRestAuditLogEffects } from 'app/backend-status/effects/load-rest-audit-log.effects';
import { LoggerModule } from '@angular-ru/logger';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/backend-status.fixtures';
import { Title } from '@angular/platform-browser';
import { ScrollPanelModule, SidebarModule } from 'primeng/primeng';

describe('RestAuditLogPageComponent', () => {
  const ENTRY = REST_AUDIT_LOG_ENTRY_1;

  let component: RestAuditLogPageComponent;
  let fixture: ComponentFixture<RestAuditLogPageComponent>;
  let breadcrumbAdaptor: BreadcrumbAdaptor;
  let titleService: Title;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY,
          fromLoadRestAuditLogEntries.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LoadRestAuditLogEffects]),
        TableModule,
        PanelModule,
        SidebarModule,
        ScrollPanelModule
      ],
      declarations: [RestAuditLogPageComponent],
      providers: [MessageService, BreadcrumbAdaptor, Title]
    }).compileComponents();

    fixture = TestBed.createComponent(RestAuditLogPageComponent);
    component = fixture.componentInstance;
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);
    spyOn(breadcrumbAdaptor, 'loadEntries');
    titleService = TestBed.get(Title);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.get(TranslateService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting a row with request content', () => {
    const MY_ENTRY = { ...ENTRY, requestContent: 'Some content' };

    beforeEach(() => {
      component.currentEntry = null;
      component.showEntryDetails(MY_ENTRY);
    });

    it('sets the current entry', () => {
      expect(component.currentEntry).toEqual(MY_ENTRY);
    });

    it('displays the entry details', () => {
      expect(component.showDetailsDialog).toBeTruthy();
    });
  });

  describe('selecting a row with response content', () => {
    const MY_ENTRY = { ...ENTRY, responseContent: 'Some content' };

    beforeEach(() => {
      component.currentEntry = null;
      component.showEntryDetails(MY_ENTRY);
    });

    it('sets the current entry', () => {
      expect(component.currentEntry).toEqual(MY_ENTRY);
    });

    it('displays the entry details', () => {
      expect(component.showDetailsDialog).toBeTruthy();
    });
  });

  describe('selecting a row with a stacktrace', () => {
    const MY_ENTRY = { ...ENTRY, exception: 'Some content' };

    beforeEach(() => {
      component.currentEntry = null;
      component.showEntryDetails(MY_ENTRY);
    });

    it('sets the current entry', () => {
      expect(component.currentEntry).toEqual(MY_ENTRY);
    });

    it('displays the entry details', () => {
      expect(component.showDetailsDialog).toBeTruthy();
    });
  });

  describe('selecting a row with no displayable content', () => {
    beforeEach(() => {
      component.currentEntry = null;
      component.showEntryDetails(ENTRY);
    });

    it('sets the current entry', () => {
      expect(component.currentEntry).toEqual(ENTRY);
    });

    it('does not display the entry details', () => {
      expect(component.showDetailsDialog).toBeFalsy();
    });
  });

  describe('deselecting a row', () => {
    beforeEach(() => {
      component.currentEntry = ENTRY;
      component.showDetailsDialog = true;
      component.hideEntryDetails();
    });

    it('clears the current entry', () => {
      expect(component.currentEntry).toBeNull();
    });

    it('hides the entry details', () => {
      expect(component.showDetailsDialog).toBeFalsy();
    });
  });

  it('can parse a JSON string', () => {
    expect(component.asJson(JSON.stringify(ENTRY))).toEqual(ENTRY);
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('changes the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('reloads the breadcrumb trail', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });
  });
});
