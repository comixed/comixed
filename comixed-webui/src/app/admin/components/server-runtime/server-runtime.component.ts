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

import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  selectServerRuntimeHealth,
  selectServerRuntimeState
} from '@app/admin/selectors/server-runtime.selectors';
import {
  loadServerHealth,
  shutdownServer
} from '@app/admin/actions/server-runtime.actions';
import { ServerHealth } from '@app/admin/models/server-health';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-server-runtime',
  templateUrl: './server-runtime.component.html',
  styleUrls: ['./server-runtime.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    MatCard,
    MatCardTitle,
    MatCardContent,
    DecimalPipe,
    TranslateModule,
    AsyncPipe
  ]
})
export class ServerRuntimeComponent implements OnInit {
  shuttingDown$ = new BehaviorSubject(false);
  health$ = new BehaviorSubject<ServerHealth | null>(null);

  logger = inject(LoggerService);
  store = inject(Store<any>);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);

  constructor() {
    this.store
      .select(selectServerRuntimeHealth)
      .pipe(tap(health => this.health$.next(health)))
      .subscribe();
    this.store
      .select(selectServerRuntimeState)
      .pipe(tap(state => this.shuttingDown$.next(state.shuttingDown)))
      .subscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading server health');
    this.store.dispatch(loadServerHealth());
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
