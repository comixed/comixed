/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import {
  selectServerRuntimeHealth,
  selectServerRuntimeState
} from '@app/admin/selectors/server-runtime.selectors';
import {
  loadServerHealth,
  shutdownServer
} from '@app/admin/actions/server-runtime.actions';
import { ServerHealth } from '@app/admin/models/server-health';

@Component({
  selector: 'cx-server-runtime',
  templateUrl: './server-runtime.component.html',
  styleUrls: ['./server-runtime.component.scss']
})
export class ServerRuntimeComponent implements OnInit, OnDestroy {
  shuttingDown = false;
  serverHealthSubscription: Subscription;
  health: ServerHealth;
  runtimeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.serverHealthSubscription = this.store
      .select(selectServerRuntimeHealth)
      .subscribe(health => (this.health = health));
    this.runtimeSubscription = this.store
      .select(selectServerRuntimeState)
      .subscribe(state => (this.shuttingDown = state.shuttingDown));
  }

  ngOnInit(): void {
    this.logger.trace('Loading server health');
    console.log('*** GOT HERE!');
    this.store.dispatch(loadServerHealth());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from runtime updates');
    this.runtimeSubscription.unsubscribe();
  }

  onShutdown(): void {
    this.logger.trace('Confirming shutdown request');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'shutdown-server.confirmation-title'
      ),
      message: this.translateService.instant(
        'shutdown-server.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Shutdown confirmed');
        this.store.dispatch(shutdownServer());
      }
    });
  }

  onRefresh(): void {
    this.logger.trace('Reloading server status');
    this.store.dispatch(loadServerHealth());
  }
}
