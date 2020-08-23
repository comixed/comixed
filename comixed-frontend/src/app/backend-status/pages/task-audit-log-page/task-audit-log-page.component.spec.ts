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

import { TaskAuditLogPageComponent } from './task-audit-log-page.component';
import { TableModule } from 'primeng/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { Store, StoreModule } from '@ngrx/store';
import * as fromLoadTaskAuditLog from 'app/backend-status/reducers/load-task-audit-log.reducer';
import { LOAD_TASK_AUDIT_LOG_FEATURE_KEY } from 'app/backend-status/reducers/load-task-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { LibraryModule } from 'app/library/library.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ScrollPanelModule } from 'primeng/primeng';
import { CoreModule } from 'app/core/core.module';
import { ToolbarModule, TooltipModule } from 'primeng/primeng';
import { CLEAR_TASK_AUDIT_LOG_FEATURE_KEY } from 'app/backend-status/reducers/clear-task-audit-log.reducer';
import * as fromClearTaskAuditLog from 'app/backend-status/reducers/build-details.reducer';
import { ClearTaskAuditLogEffects } from 'app/backend-status/effects/clear-task-audit-log.effects';
import { AppState } from 'app/backend-status';
import { clearTaskAuditLog } from 'app/backend-status/actions/clear-task-audit-log.actions';
import { Title } from '@angular/platform-browser';

describe('TaskAuditLogPageComponent', () => {
  let component: TaskAuditLogPageComponent;
  let fixture: ComponentFixture<TaskAuditLogPageComponent>;
  let store: Store<AppState>;
  let confirmationService: ConfirmationService;
  let titleService: Title;
  let breadcrumbAdaptor: BreadcrumbAdaptor;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          LOAD_TASK_AUDIT_LOG_FEATURE_KEY,
          fromLoadTaskAuditLog.reducer
        ),
        StoreModule.forFeature(
          CLEAR_TASK_AUDIT_LOG_FEATURE_KEY,
          fromClearTaskAuditLog.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ClearTaskAuditLogEffects]),
        TableModule,
        ScrollPanelModule,
        ToolbarModule,
        TooltipModule
      ],
      declarations: [TaskAuditLogPageComponent],
      providers: [MessageService, BreadcrumbAdaptor, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAuditLogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    confirmationService = TestBed.get(ConfirmationService);
    titleService = TestBed.get(Title);
    spyOn(titleService, 'setTitle');
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);
    spyOn(breadcrumbAdaptor, 'loadEntries');
    translateService = TestBed.get(TranslateService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('resets the title', () => {
      expect(titleService.setTitle).toHaveBeenCalled();
    });

    it('reloads the breadcrumb trail', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });
  });

  describe('clearing the task audit log', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      component.doClearAuditLog();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('notifies the store', () => {
      expect(store.dispatch).toHaveBeenCalledWith(clearTaskAuditLog());
    });
  });
});
