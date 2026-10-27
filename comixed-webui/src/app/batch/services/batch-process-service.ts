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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
import { BATCH_PROCESS_LIST_UPDATE_TOPIC } from '@app/batch/batch-constants';
import { BatchProcess } from '@app/batch/models/batch-process';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';

@Service()
class BatchProcessService {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly webSocketService = inject(WebSocketService);

  constructor() {
    this.store.select(selectMessagingStarted).subscribe({
      next: started => {
        if (started) {
          this.logger.trace('Subscribing to batch process updates');
          this.webSocketService.subscribe<BatchProcess>(
            BATCH_PROCESS_LIST_UPDATE_TOPIC,
            update => {
              this.logger.debug('Batch process update received');
              this.store.dispatch(BatchProcessListActions.update({ update }));
            }
          );
        }
      }
    });
  }
}

export default BatchProcessService;
