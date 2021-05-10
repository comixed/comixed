/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { LibraryEffects } from './library.effects';
import { COMIC_1, COMIC_2, COMIC_3, COMIC_4 } from '@app/comic/comic.fixtures';
import { LibraryService } from '@app/library/services/library.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core/services/alert.service';

describe('LibraryEffects', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4];
  const READ = Math.random() > 0.5;

  const actions$: Observable<any> = null;
  let effects: LibraryEffects;
  let comicService: jasmine.SpyObj<LibraryService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        LibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {}
        }
      ]
    });

    effects = TestBed.inject(LibraryEffects);
    comicService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
