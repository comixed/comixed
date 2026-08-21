/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import {
  selectBatchProcessDetail,
  selectBatchProcessList
} from '@app/admin/selectors/batch-processes.selectors';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';
import { filter, tap } from 'rxjs/operators';
import { BATCH_PROCESS_DETAIL_UPDATE_TOPIC } from '@app/app.constants';
import { WebSocketService } from '@app/messaging';
import { interpolate } from '@app/core';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
import {
  loadBatchProcessList,
  setBatchProcessDetail
} from '@app/admin/actions/batch-processes.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleService } from '@app/core/services/title.service';
import { AsyncPipe, DatePipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'cx-batch-process-detail-page',
  templateUrl: './batch-process-detail-page.component.html',
  styleUrls: ['./batch-process-detail-page.component.scss'],
  imports: [DatePipe, KeyValuePipe, TranslateModule, AsyncPipe]
})
export class BatchProcessDetailPageComponent implements OnInit {
  jobId$ = new BehaviorSubject<number | null>(null);
  batchList$ = new BehaviorSubject<BatchProcessDetail[]>([]);
  detail$ = new BehaviorSubject<BatchProcessDetail>(null);

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  webSocketService = inject(WebSocketService);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.jobId$.next(+params.jobId);
          this.logger.debug('Job id:', this.jobId$.value);
          this.loadJobDetail();
        })
      )
      .subscribe();
    this.store
      .select(selectBatchProcessList)
      .pipe(
        tap(list => {
          this.batchList$.next(list);
          this.loadJobDetail();
        })
      )
      .subscribe();
    this.store
      .select(selectBatchProcessDetail)
      .pipe(
        filter(detail => !!detail),
        tap(detail => this.detail$.next(detail))
      )
      .subscribe();
    this.store
      .select(selectMessagingStarted)
      .pipe(
        tap(started => {
          if (started) {
            const topic = interpolate(BATCH_PROCESS_DETAIL_UPDATE_TOPIC, {
              jobId: this.jobId$.value
            });
            this.webSocketService.subscribe(topic, update => {
              this.logger.debug(
                'Received batch process detail update:',
                update
              );
              this.store.dispatch(setBatchProcessDetail({ detail: update }));
            });
          }
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(loadBatchProcessList());
  }

  loadJobDetail(): void {
    this.detail$.next(
      this.batchList$.value.find(entry => entry.jobId === this.jobId$.value)
    );
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'batch-processes.batch-process-detail.page-title',
        {
          jobId: this.detail$.value?.jobId,
          jobName: this.detail$.value?.jobName
        }
      )
    );
  }
}
