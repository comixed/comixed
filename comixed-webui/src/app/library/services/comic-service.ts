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
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Observable } from 'rxjs';
import {
  LOAD_COMIC_URL,
  UPDATE_COMIC_URL
} from '@app/library/library-constants';
import { interpolate } from '@app/app-functions';
import { LoadComicDetailResponse } from '@app/library/models/net/load-comic-detail-response';
import { ComicType } from '@app/library/models/comic-type';
import { UpdateComicRequest } from '@app/library/models/net/update-comic-request';

@Service()
export class ComicService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);

  load(args: { comicId: number }): Observable<LoadComicDetailResponse> {
    this.logger.debug('Loading comic:', args);
    return this.client.get<LoadComicDetailResponse>(
      interpolate(LOAD_COMIC_URL, { comicId: args.comicId })
    );
  }

  save(args: {
    comicId: number;
    comicType?: ComicType;
    publisher: string;
    series: string;
    volume: string;
    issueNumber: string;
    imprint?: string;
    sortName?: string;
    title?: string;
    coverDate: number | null;
    storeDate: number | null;
  }): Observable<LoadComicDetailResponse> {
    this.logger.debug('Service: updating one comic:', args);
    return this.client.put<LoadComicDetailResponse>(
      interpolate(UPDATE_COMIC_URL, { id: args.comicId }),
      {
        comicType: args.comicType,
        publisher: args.publisher,
        series: args.series,
        volume: args.volume,
        issueNumber: args.issueNumber,
        imprint: args.imprint,
        sortName: args.sortName,
        title: args.title,
        coverDate: args.coverDate,
        storeDate: args.storeDate
      } as UpdateComicRequest
    );
  }
}
