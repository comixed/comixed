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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  comicFileListAdaptor,
  initialComicFileListState
} from '@app/library/reducers/comic-file-list.reducer';
import { ImportComicsPage } from '@app/library/pages/import-comics-page/import-comics-page';
import { Confirmation, ConfirmationService } from '@openng/optimus-ui/api';
import { USER_ADMIN } from '@app/account/account-fixtures';
import { IMPORT_ROOT_DIRECTORY_PREFERENCE } from '@app/account/user-preferences';
import { beforeEach, Mock } from 'vitest';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';
import { COMIC_FILE_1 } from '@app/library/library-fixtures';

describe('ImportComicsPage', () => {
  const TEST_IMPORT_DIRECTORY = '/home/comixed/library/imports';
  const TEST_COMIC_FILE = COMIC_FILE_1;
  const initialState = {
    [USER_FEATURE_KEY]: {
      ...initialUserState,
      user: {
        ...USER_ADMIN,
        preferences: [
          {
            name: IMPORT_ROOT_DIRECTORY_PREFERENCE,
            value: TEST_IMPORT_DIRECTORY
          }
        ]
      }
    },
    [COMIC_FILE_LIST_FEATURE_KEY]: comicFileListAdaptor.setAll(
      [
        {
          directory: TEST_IMPORT_DIRECTORY,
          files: [TEST_COMIC_FILE]
        }
      ],
      {
        ...initialComicFileListState
      }
    )
  };

  let component: ImportComicsPage;
  let fixture: ComponentFixture<ImportComicsPage>;
  let store: MockStore;
  let dispatchSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportComicsPage],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        ConfirmationService
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ImportComicsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  it('should preload the preferred directory', () => {
    expect(
      component.importComicsForm.controls['directory'].value
    ).toStrictEqual(TEST_IMPORT_DIRECTORY);
  });

  it('should automatically fetch the comic files from the session', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(
      ComicFileListActions.loadFromSession()
    );
  });

  describe('loading comics', () => {
    beforeEach(() => {
      dispatchSpy.mockClear();
      component.importComicsForm.controls['maximum'].setValue(0);
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#load-comic-files-button button'
      );
      button.click();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ComicFileListActions.loadFromDisk({
          directory: TEST_IMPORT_DIRECTORY,
          maximum: 0
        })
      );
    });
  });

  function setSelectedState(isSelected: boolean) {
    store.setState({
      ...initialState,
      [COMIC_FILE_LIST_FEATURE_KEY]: comicFileListAdaptor.setAll(
        [
          {
            directory: TEST_IMPORT_DIRECTORY,
            files: [{ ...TEST_COMIC_FILE, selected: isSelected }]
          }
        ],
        {
          ...initialComicFileListState
        }
      )
    });
    fixture.detectChanges();
  }

  describe('selecting a single comic', () => {
    beforeEach(() => {
      dispatchSpy.mockClear();
      setSelectedState(false);
      const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
        `#select-comic-file-checkbox-${TEST_COMIC_FILE.id} input`
      );
      expect(checkbox.checked).toBeFalsy();
      checkbox.click();
      fixture.detectChanges();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ComicFileListActions.select({
          filename: TEST_COMIC_FILE.filename,
          selected: true,
          single: true
        })
      );
    });
  });

  describe.todo('deselecting a single comic', () => {
    beforeEach(() => {
      dispatchSpy.mockClear();
      setSelectedState(true);
      const checkbox = fixture.nativeElement.querySelector(
        `#select-comic-file-checkbox-${TEST_COMIC_FILE.id} input[type="checkbox"]`
      ) as HTMLInputElement;
      checkbox.click();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ComicFileListActions.select({
          filename: TEST_COMIC_FILE.filename,
          selected: false,
          single: true
        })
      );
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      dispatchSpy.mockClear();
      setSelectedState(false);
      const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
        `#select-all-comic-files input`
      );
      checkbox.click();
      fixture.detectChanges();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ComicFileListActions.select({
          filename: '',
          selected: true,
          single: false
        })
      );
    });
  });

  describe('importing selected comics', () => {
    let confirmSpy: Mock;

    beforeEach(() => {
      dispatchSpy.mockClear();
      setSelectedState(true);
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#import-comic-files-button button'
      );
      button.click();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(ComicFileListActions.import());
    });
  });
});
