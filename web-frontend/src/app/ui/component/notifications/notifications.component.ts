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
import { MessageService } from 'primeng/api';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  constructor(
    private alert_service: AlertService,
    private message_service: MessageService,
  ) {
    this.alert_service.error_messages.subscribe(
      (message: string) => {
        this.message_service.add({ severity: 'error', summary: 'Error', detail: message });
      }
    );

    this.alert_service.info_messages.subscribe(
      (message: string) => {
        this.message_service.add({ severity: 'info', summary: 'Info', detail: message });
      }
    );


  }

  ngOnInit() {
  }

}
