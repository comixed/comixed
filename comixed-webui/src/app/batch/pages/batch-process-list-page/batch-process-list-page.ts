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
import {
  selectBatchProcessListBusy,
  selectBatchProcessListEntries
} from '@app/batch/selectors/batch-process-list.selectors';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { TableModule } from '@openng/optimus-ui/table';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { TitleService } from '@app/layout/services/title-service';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';

@Component({
  imports: [
    TranslatePipe,
    DatePipe,
    TableModule,
    Card,
    Breadcrumb,
    Button,
    Tooltip
  ],
  selector: 'app-batch-list-page',
  styleUrl: './batch-process-list-page.scss',
  templateUrl: './batch-process-list-page.html'
})
export class BatchProcessListPage {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);
  readonly store = inject(Store);
  readonly batchProcessListBusy = this.store.selectSignal(
    selectBatchProcessListBusy
  );
  readonly batchProcessListEntries = this.store.selectSignal(
    selectBatchProcessListEntries
  );
  readonly batchProcessListRows = signal(10);

  constructor() {
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  onDeleteCompletedProcesses(): void {
    this.logger.debug('Deleting completed batch processes');
    this.store.dispatch(BatchProcessListActions.deleteCompleted());
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('batch-process-list-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant(
          'batch-process-list-page.page-title'
        )
      }
    ]);
  }
}
