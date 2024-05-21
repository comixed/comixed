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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import {
  selectBatchProcessDetail,
  selectBatchProcessList
} from '@app/admin/selectors/batch-processes.selectors';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';
import { filter } from 'rxjs/operators';
import { BATCH_PROCESS_DETAIL_UPDATE_TOPIC } from '@app/app.constants';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import { interpolate } from '@app/core';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  loadBatchProcessList,
  setBatchProcessDetail
} from '@app/admin/actions/batch-processes.actions';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleService } from '@app/core/services/title.service';

@Component({
  selector: 'cx-batch-process-detail-page',
  templateUrl: './batch-process-detail-page.component.html',
  styleUrls: ['./batch-process-detail-page.component.scss']
})
export class BatchProcessDetailPageComponent implements OnInit, OnDestroy {
  paramSubscription: Subscription;
  jobId = 0;
  batchListSubscription: Subscription;
  batchList: BatchProcessDetail[] = [];
  detailSubscription: Subscription;
  messagingSubscription: Subscription;
  detailUpdateSubscription: MessagingSubscription;
  detail: BatchProcessDetail;
  messagingStarted = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private webSocketService: WebSocketService,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.jobId = +params.jobId;
      this.logger.debug('Job id:', this.jobId);
      this.loadJobDetail();
    });
    this.batchListSubscription = this.store
      .select(selectBatchProcessList)
      .subscribe(list => {
        this.batchList = list;
        this.loadJobDetail();
      });
    this.detailSubscription = this.store
      .select(selectBatchProcessDetail)
      .pipe(filter(detail => !!detail))
      .subscribe(detail => {
        this.detail = detail;
        this.subscribeToUpdates();
      });
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        if (state.started) {
          this.subscribeToUpdates();
        } else {
          this.unsubscribeFromUpdates();
        }
      });
  }

  ngOnInit(): void {
    this.store.dispatch(loadBatchProcessList());
  }

  ngOnDestroy(): void {
    this.unsubscribeFromUpdates();
    this.logger.debug('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from batch list updates');
    this.batchListSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from messaging updates');
    this.messagingSubscription.unsubscribe();
  }

  unsubscribeFromUpdates(): void {
    if (!!this.detailUpdateSubscription) {
      this.logger.debug('Unsubscribing from batch process detail updates');
      this.detailUpdateSubscription.unsubscribe();
    }
  }

  subscribeToUpdates(): void {
    if (!this.detailUpdateSubscription) {
      const topic = interpolate(BATCH_PROCESS_DETAIL_UPDATE_TOPIC, {
        jobId: this.jobId
      });
      this.logger.trace('Subscribing to batch process updates:', topic);
      this.detailUpdateSubscription =
        this.webSocketService.subscribe<BatchProcessDetail>(topic, update => {
          this.logger.debug('Received batch process detail update:', update);
          this.store.dispatch(setBatchProcessDetail({ detail: update }));
        });
    }
  }

  loadJobDetail(): void {
    this.detail = this.batchList.find(entry => entry.jobId === this.jobId);
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'batch-processes.batch-process-detail.page-title',
        { jobId: this.detail?.jobId, jobName: this.detail?.jobName }
      )
    );
  }
}
