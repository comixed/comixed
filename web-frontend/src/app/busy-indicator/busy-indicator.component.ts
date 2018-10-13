/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';
import { LoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-busy-indicator',
  templateUrl: './busy-indicator.component.html',
  styleUrls: ['./busy-indicator.component.css']
})
export class BusyIndicatorComponent implements OnInit {
  protected busy_message: string;

  constructor(
    private alert_service: AlertService,
  ) {
    this.busy_message = '';
  }

  ngOnInit() {
    const that = this;
    this.alert_service.busy_messages.subscribe(
      (message: string) => {
        that.busy_message = message || '';
      });
  }

  is_busy(): boolean {
    return this.busy_message.length > 0;
  }
}
