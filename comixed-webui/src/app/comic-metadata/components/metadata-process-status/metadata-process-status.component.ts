/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { MetadataUpdateProcessState } from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { LoggerService } from '@angular-ru/cdk/logger';

@Component({
  selector: 'cx-metadata-process-status',
  templateUrl: './metadata-process-status.component.html',
  styleUrls: ['./metadata-process-status.component.scss']
})
export class MetadataProcessStatusComponent {
  current = 0;
  total = 0;

  constructor(private logger: LoggerService) {}

  @Input()
  set processState(state: MetadataUpdateProcessState) {
    this.logger.trace('Calculating metadata process value');
    this.total = state.totalComics;
    this.current = state.completedComics;
  }
}
