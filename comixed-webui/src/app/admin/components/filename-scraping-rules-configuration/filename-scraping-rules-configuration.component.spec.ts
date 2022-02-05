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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FilenameScrapingRulesConfigurationComponent } from './filename-scraping-rules-configuration.component';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3
} from '@app/admin/admin.fixtures';
import {
  FILENAME_SCRAPING_RULES_FEATURE_KEY,
  initialState as initialFilenameScrapingRulesState
} from '@app/admin/reducers/filename-scraping-rule-list.reducer';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TitleService } from '@app/core/services/title.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { saveFilenameScrapingRules } from '@app/admin/actions/filename-scraping-rule-list.actions';
import { EditableListItem } from '@app/core/models/ui/editable-list-item';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';

describe('FilenameScrapingRulesConfigurationComponent', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];
  const initialState = {
    [FILENAME_SCRAPING_RULES_FEATURE_KEY]: {
      ...initialFilenameScrapingRulesState,
      rules: RULES
    }
  };

  let component: FilenameScrapingRulesConfigurationComponent;
  let fixture: ComponentFixture<FilenameScrapingRulesConfigurationComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FilenameScrapingRulesConfigurationComponent],
        imports: [
          NoopAnimationsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          DragDropModule,
          MatTableModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          MatToolbarModule,
          MatDialogModule
        ],
        providers: [
          provideMockStore({ initialState }),
          TitleService,
          ConfirmationService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(
        FilenameScrapingRulesConfigurationComponent
      );
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('loads the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the rules', () => {
    beforeEach(() => {
      component.dataSource.data = [
        { item: RULES[0], editedValue: RULES[0], edited: true }
      ];
      component.rules = RULES;
    });

    it('loads the entries', () => {
      expect(component.dataSource.data.length).toEqual(RULES.length);
    });

    it('maintains previous edits', () => {
      expect(component.dataSource.data[0].edited).toBeTrue();
    });
  });

  describe('reordering the rules', () => {
    const COPY = [].concat(RULES);

    beforeEach(() => {
      component.rules = COPY;
      component.onReorderRules({
        previousIndex: 0,
        currentIndex: 1,
        container: COPY
      } as any);
    });

    it('reorders the rules', () => {
      expect(component.rules[0].id).toEqual(RULES[1].id);
      expect(component.rules[1].id).toEqual(RULES[0].id);
    });

    it('updates the rule priorities', () => {
      component.rules.forEach((rule, index) =>
        expect(rule.priority).toEqual(index + 1)
      );
    });
  });

  describe('saving the rules', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.rules = RULES;
      component.onSaveRules();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveFilenameScrapingRules({ rules: RULES })
      );
    });
  });

  describe('editing a rule', () => {
    const VALUE = Math.random();
    let rule: EditableListItem<FilenameScrapingRule>;

    beforeEach(() => {
      component.rules = RULES;
      rule = component.dataSource.data[0];
    });

    describe('the rule name', () => {
      beforeEach(() => {
        component.onNameEdited(rule, `${VALUE}`);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.name).toEqual(`${VALUE}`);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the rule', () => {
      beforeEach(() => {
        component.onRuleEdited(rule, `${VALUE}`);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.rule).toEqual(`${VALUE}`);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the series position', () => {
      beforeEach(() => {
        component.onSeriesPositionEdited(rule, VALUE);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.seriesPosition).toEqual(VALUE);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the volume position', () => {
      beforeEach(() => {
        component.onVolumePositionEdited(rule, VALUE);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.volumePosition).toEqual(VALUE);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the issue number position', () => {
      beforeEach(() => {
        component.onIssueNumberPositionEdited(rule, VALUE);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.issueNumberPosition).toEqual(VALUE);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the cover date position', () => {
      beforeEach(() => {
        component.onCoverDatePositionEdited(rule, VALUE);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.coverDatePosition).toEqual(VALUE);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });

    describe('the date format', () => {
      beforeEach(() => {
        component.onDateFormatEdited(rule, `${VALUE}`);
      });

      it('updates the edited value', () => {
        expect(rule.editedValue.dateFormat).toEqual(`${VALUE}`);
      });

      it('sets the edited flag', () => {
        expect(rule.edited).toBeTrue();
      });
    });
  });
});
