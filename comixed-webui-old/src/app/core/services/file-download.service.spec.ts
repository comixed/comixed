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

import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download.service';
import { FileSaverService } from 'ngx-filesaver';
import { DownloadDocument } from '@app/core/models/download-document';
import { LoggerModule } from '@angular-ru/cdk/logger';

describe('FileDownloadService', () => {
  const DOWNLOADED_FILE = {
    filename: 'Filename',
    content: 'content',
    mediaType: 'text/csv'
  } as DownloadDocument;

  let service: FileDownloadService;
  let fileSaverService: FileSaverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [FileSaverService]
    });
    service = TestBed.inject(FileDownloadService);
    fileSaverService = TestBed.inject(FileSaverService);
    spyOn(fileSaverService, 'save');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saving a file', () => {
    beforeEach(() => {
      service.saveFile({ document: DOWNLOADED_FILE });
    });

    it('saves the file', () => {
      expect(fileSaverService.save).toHaveBeenCalledWith(
        jasmine.anything(),
        DOWNLOADED_FILE.filename
      );
    });
  });
});
