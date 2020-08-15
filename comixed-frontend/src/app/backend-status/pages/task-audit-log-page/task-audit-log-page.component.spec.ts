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
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { StoreModule } from '@ngrx/store';
import {
  reducer,
  TASK_AUDIT_LOG_FEATURE_KEY
} from 'app/backend-status/reducers/task-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TaskAuditLogEffects } from 'app/backend-status/effects/task-audit-log.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { LibraryModule } from 'app/library/library.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ScrollPanelModule } from 'primeng/primeng';

describe('TaskAuditLogPageComponent', () => {
  let component: TaskAuditLogPageComponent;
  let fixture: ComponentFixture<TaskAuditLogPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(TASK_AUDIT_LOG_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([TaskAuditLogEffects]),
        TableModule,
        ScrollPanelModule
      ],
      declarations: [TaskAuditLogPageComponent],
      providers: [MessageService, BreadcrumbAdaptor]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAuditLogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
