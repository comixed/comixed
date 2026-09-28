/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ReadStateDialog } from './read-state-dialog';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { provideTranslateService } from '@ngx-translate/core';

describe('ReadStateDialog', () => {
  let component: ReadStateDialog;
  let fixture: ComponentFixture<ReadStateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadStateDialog],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        DynamicDialogRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadStateDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
