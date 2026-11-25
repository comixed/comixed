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

import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { FileSaverService } from 'ngx-filesaver';
import { DownloadDocument } from '@app/file-transfers/models/download-document';

describe('FileDownloadService', () => {
  let service: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        {
          provide: FileSaverService,
          useValue: {
            save: vi.fn()
          }
        }
      ]
    });
    service = TestBed.inject(FileDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should decode and save the downloaded document', () => {
    const document: DownloadDocument = {
      filename: 'rules.cxrules',
      content: btoa('This is the file content'),
      mediaType: 'text/plain'
    };

    const saveFileContentSpy = vi.spyOn(service, 'saveFileContent');

    service.saveFile({ document });

    expect(saveFileContentSpy).toHaveBeenCalledTimes(1);

    const call = saveFileContentSpy.mock.calls[0][0];

    expect(call.filename).toBe('rules.cxrules');
    expect(call.content).toBeInstanceOf(Blob);
    expect(call.content.type).toBe('text/plain');
  });
});
