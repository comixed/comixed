/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-library-admin-page',
  templateUrl: './library-admin-page.component.html',
  styleUrls: ['./library-admin-page.component.css']
})
export class LibraryAdminPageComponent implements OnInit, OnDestroy {
  import_count_subscription: Subscription;
  import_count = 0;
  rescan_count_subscription: Subscription;
  rescan_count = 0;

  constructor(private library_adaptor: LibraryAdaptor) {}

  ngOnInit() {
    this.import_count_subscription = this.library_adaptor.pending_import$.subscribe(
      import_count => (this.import_count = import_count)
    );
    this.rescan_count_subscription = this.library_adaptor.pending_rescan$.subscribe(
      rescan_count => (this.rescan_count = rescan_count)
    );
  }

  ngOnDestroy() {
    this.import_count_subscription.unsubscribe();
    this.rescan_count_subscription.unsubscribe();
  }

  rescan_library(): void {
    this.library_adaptor.start_rescan();
  }
}
