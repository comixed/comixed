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

import { Component, inject, Input } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BarChartModule } from '@swimlane/ngx-charts';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Card } from '@openng/optimus-ui/card';

@Component({
  imports: [BarChartModule, TranslatePipe, RouterLink, Card],
  selector: 'app-collection-statistics',
  styleUrl: './collection-statistics.scss',
  templateUrl: './collection-statistics.html'
})
export class CollectionStatistics {
  @Input() title = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() detailUrl = '';

  readonly logger = inject(LoggerService);
}
