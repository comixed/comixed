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
import { FilenameScrapingRulesPage } from './filename-scraping-rules-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { Confirmation, ConfirmationService } from '@openng/optimus-ui/api';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY,
  filenameScrapingRuleListAdapter,
  initialFilenameScrapingRuleListState
} from '@app/metadata/reducers/filename-scraping-rule-list.reducer';
import { provideRouter } from '@angular/router';
import { beforeEach, Mock } from 'vitest';
import { FilenameScrapingRuleListActions } from '@app/metadata/actions/filename-scraping-rule-list.actions';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2
} from '@app/metadata/metadata-fixtures';

describe('FilenameScrapingRulesPage', () => {
  const TEST_FILENAME_SCRAPING_RULE_LIST = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2
  ];
  const initialState = {
    [FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY]:
      filenameScrapingRuleListAdapter.setAll(
        TEST_FILENAME_SCRAPING_RULE_LIST,
        initialFilenameScrapingRuleListState
      )
  };

  let component: FilenameScrapingRulesPage;
  let fixture: ComponentFixture<FilenameScrapingRulesPage>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilenameScrapingRulesPage],
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

    fixture = TestBed.createComponent(FilenameScrapingRulesPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add an empty rule', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '#add-rule-button button'
    );
    button.click();
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      FilenameScrapingRuleListActions.addRule()
    );
  });

  describe('uploading a file', () => {
    const file = new File(['file contents'], 'rules.csv', {
      type: 'application/csv'
    });
    let confirmSpy: Mock;
    let dispatchSpy: Mock;

    beforeEach(() => {
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const fileInput: HTMLInputElement = fixture.nativeElement.querySelector(
        'p-fileupload input[type="file"]'
      );
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });
      fileInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const uploadButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('#upload-rules-file-button button');
      uploadButton.click();
      fixture.detectChanges();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action to upload the file', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        FilenameScrapingRuleListActions.uploadFilenameRulesFile({ file })
      );
    });
  });

  describe('removing a rules', () => {
    const TEST_RULE = TEST_FILENAME_SCRAPING_RULE_LIST[0];

    let confirmSpy: Mock;
    let dispatchSpy: Mock;

    beforeEach(() => {
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        `#delete-rule-button-${TEST_RULE.filenameScrapingRuleId} button`
      );
      button.click();
      fixture.detectChanges();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action to upload the file', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        FilenameScrapingRuleListActions.removeRule({
          filenameScrapingRuleId: TEST_RULE.filenameScrapingRuleId
        })
      );
    });
  });

  describe('saving the rules', () => {
    let confirmSpy: Mock;
    let dispatchSpy: Mock;

    beforeEach(() => {
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#save-rules-button button'
      );
      button.click();
      fixture.detectChanges();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action to upload the file', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        FilenameScrapingRuleListActions.saveFilenameRules({
          rules: TEST_FILENAME_SCRAPING_RULE_LIST
        })
      );
    });
  });
});
