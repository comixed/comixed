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

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Comic } from '@app/library/models/comic';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'comicDetailTrail'
})
export class ComicDetailTrailPipe implements PipeTransform {
  readonly translateService = inject(TranslateService);

  transform(comic: Comic): MenuItem[] {
    return [
      {
        label: comic!.publisher || 'Unknown',
        routerLink: ['/library/publishers', comic!.publisher]
      },
      {
        label: `${comic!.series || 'Unknown'} V${comic!.volume || '????'}`,
        routerLink: [
          '/library/publishers',
          comic!.publisher!,
          'series',
          comic!.series,
          comic!.volume
        ]
      },
      {
        label: `#${comic!.issueNumber || '??'}`
      }
    ];
  }
}
