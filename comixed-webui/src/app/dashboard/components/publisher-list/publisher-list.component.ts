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

import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'cx-publisher-list',
  imports: [TableModule, TranslatePipe],
  templateUrl: './publisher-list.component.html',
  styleUrl: './publisher-list.component.scss'
})
export class PublisherListComponent {
  @Input() publishers: RemoteLibrarySegmentState[];
  @Input() rows;
}
