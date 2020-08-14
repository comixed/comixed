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

import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';
import { MessageService } from 'primeng/api';
import objectContaining = jasmine.objectContaining;

describe('AlertService', () => {
  const TEXT = 'This is the message';

  let alertService: AlertService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService]
    });

    alertService = TestBed.get(AlertService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(alertService).toBeTruthy();
  });

  it('can display informational messages', () => {
    alertService.info(TEXT);
    expect(messageService.add).toHaveBeenCalledWith(
      objectContaining({ severity: 'info', detail: TEXT })
    );
  });

  it('can display error messages', () => {
    alertService.error(TEXT);
    expect(messageService.add).toHaveBeenCalledWith(
      objectContaining({ severity: 'error', detail: TEXT })
    );
  });
});
