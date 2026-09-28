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
import { ComicFilesStore } from '@app/library/stores/comic-files-store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import {
  LOAD_COMIC_FILES_FROM_SESSION_URL,
  LOAD_COMIC_FILES_URL,
  SEND_COMIC_FILES_URL,
  TOGGLE_COMIC_FILE_SELECTIONS_URL
} from '@app/library/library-constants';
import { LoadComicFilesRequest } from '@app/library/models/net/load-comic-files-request';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import { ToggleComicFileSelectionRequest } from '@app/library/models/net/toggle-comic-file-selection-request';

@Service()
export class ComicFileService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly comicFilesStore = inject(ComicFilesStore);

  loadComicFiles(args: { directory: string; maximum: number }): void {
    this.logger.trace('Loading comic files:', args);
    this.comicFilesStore.setLoading(true);
    this.client
      .post<LoadComicFilesResponse>(interpolate(LOAD_COMIC_FILES_URL), {
        directory: args.directory,
        maximum: args.maximum
      } as LoadComicFilesRequest)
      .subscribe({
        next: response => {
          this.logger.debug('Response received:', response);
          this.comicFilesStore.update(response.groups);
        },
        error: error => this.logger.error('Failed to load comic files:', error)
      });
    this.comicFilesStore.setLoading(false);
  }

  loadComicFilesFromSession(): void {
    this.logger.trace('Getting session files from server');
    this.comicFilesStore.setLoading(true);
    this.client
      .get<LoadComicFilesResponse>(
        interpolate(LOAD_COMIC_FILES_FROM_SESSION_URL)
      )
      .subscribe({
        next: response => {
          this.logger.debug('Response received:', response);
          this.comicFilesStore.update(response.groups);
        },
        error: error =>
          this.logger.error('Failed to load comic files from session:', error)
      });
    this.comicFilesStore.setLoading(false);
  }

  setComicFileSelected(args: {
    filename: string;
    selected: boolean;
    single: boolean;
  }) {
    this.logger.trace('Toggling comic file selections:', args);
    this.comicFilesStore.setLoading(true);
    this.client
      .post<LoadComicFilesResponse>(
        interpolate(TOGGLE_COMIC_FILE_SELECTIONS_URL),
        {
          filename: args.filename,
          selected: args.selected,
          single: args.single
        } as ToggleComicFileSelectionRequest
      )
      .subscribe({
        next: response => {
          this.logger.debug('Response received:', response);
          this.comicFilesStore.update(response.groups);
        },
        error: error =>
          this.logger.error('Failed to toggle comic file selections:', error)
      });
    this.comicFilesStore.setLoading(false);
  }

  importComicFiles(): void {
    this.logger.trace('Starting the comic file import process');
    this.client
      .post<unknown>(interpolate(SEND_COMIC_FILES_URL), {} as unknown)
      .subscribe({
        next: () => this.logger.debug('Import process started'),
        error: error =>
          this.logger.error('Failed to start import process:', error)
      });
  }
}
