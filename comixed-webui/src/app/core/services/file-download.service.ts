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

import { Injectable } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { LoggerService } from '@angular-ru/cdk/logger';
import { DownloadDocument } from '@app/core/models/download-document';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  constructor(
    private logger: LoggerService,
    private fileSaverService: FileSaverService
  ) {}

  saveFile(args: { document: DownloadDocument }): void {
    this.logger.trace('Extracting document content');
    const byteChars = atob(args.document.content);
    const byteNumbers = new Array(byteChars.length);
    this.logger.trace('Converting document content');
    for (let index = 0; index < byteChars.length; index++) {
      byteNumbers[index] = byteChars.charCodeAt(index);
    }
    const byteArray = new Uint8Array(byteNumbers);
    this.logger.trace('Saving downloaded document:', args.document.filename);
    this.fileSaverService.save(
      new Blob([byteArray], { type: args.document.mediaType }),
      args.document.filename
    );
  }
}
