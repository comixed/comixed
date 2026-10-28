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

import { Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { selectBatchProcessListEntries } from '@app/batch/selectors/batch-process-list.selectors';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { TableModule } from '@openng/optimus-ui/table';
import { Card } from '@openng/optimus-ui/card';

@Component({
  imports: [TranslatePipe, DatePipe, TableModule, Card],
  selector: 'app-batch-list-page',
  styleUrl: './batch-process-list-page.scss',
  templateUrl: './batch-process-list-page.html'
})
export class BatchProcessListPage {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly batchProcessListEntries = this.store.selectSignal(
    selectBatchProcessListEntries
  );
  readonly batchProcessListRows = signal(10);
}
