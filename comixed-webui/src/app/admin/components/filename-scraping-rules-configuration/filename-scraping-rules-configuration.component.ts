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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import {
  selectFilenameScrapingRules,
  selectFilenameScrapingRulesState
} from '@app/admin/selectors/filename-scraping-rule-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';
import {
  loadFilenameScrapingRules,
  saveFilenameScrapingRules
} from '@app/admin/actions/filename-scraping-rule-list.actions';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { EditableListItem } from '@app/core/models/ui/editable-list-item';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { ConfirmationService } from '@tragically-slick/confirmation';

@Component({
  selector: 'cx-scraping-rules-configuration',
  templateUrl: './filename-scraping-rules-configuration.component.html',
  styleUrls: ['./filename-scraping-rules-configuration.component.scss']
})
export class FilenameScrapingRulesConfigurationComponent
  implements OnInit, OnDestroy
{
  langChangeSubscription: Subscription;
  ruleStateSubscription: Subscription;
  rulesSubscription: Subscription;
  dataSource = new MatTableDataSource<EditableListItem<FilenameScrapingRule>>(
    []
  );
  readonly displayedColumns = [
    'priority',
    'name',
    'rule',
    'series-position',
    'volume-position',
    'issue-number-position',
    'cover-date-position',
    'date-format'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translateService: TranslateService,
    private titleService: TitleService,
    private confirmationService: ConfirmationService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.ruleStateSubscription = this.store
      .select(selectFilenameScrapingRulesState)
      .subscribe(state => {
        this.logger.debug('Filename scraping rules state changed');
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.rulesSubscription = this.store
      .select(selectFilenameScrapingRules)
      .subscribe(rules => (this.rules = rules));
  }

  get rules(): FilenameScrapingRule[] {
    return this.dataSource.data.map(entry => entry.editedValue);
  }

  set rules(rules: FilenameScrapingRule[]) {
    this.logger.debug('Setting filename scraping rules:', rules);
    const oldRules = this.dataSource.data;
    this.dataSource.data = rules.map(rule => {
      const oldRule = oldRules.find(entry => entry.item.id === rule.id);

      return {
        item: rule,
        edited: oldRule?.edited || false,
        editedValue: rule
      };
    });
  }

  ngOnInit(): void {
    this.logger.debug('Loading filename scraping rules');
    this.store.dispatch(loadFilenameScrapingRules());
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from rule list state changes');
    this.ruleStateSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from rule list changes');
    this.rulesSubscription.unsubscribe();
  }

  onReorderRules(
    dragDropEvent: CdkDragDrop<EditableListItem<FilenameScrapingRule>[], any>
  ): void {
    this.logger.debug('Filename scraping rules reordered');
    const rules = _.cloneDeep(this.rules);
    moveItemInArray(
      rules,
      dragDropEvent.previousIndex,
      dragDropEvent.currentIndex
    );
    this.logger.debug('Updating priority values');
    rules.forEach((rule, index) => (rule.priority = index + 1));
    this.rules = rules;
  }

  onNameEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.name = value;
    entry.edited = true;
  }

  onRuleEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.rule = value;
    entry.edited = true;
  }

  onDateFormatEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.dateFormat = value;
    entry.edited = true;
  }

  onCoverDatePositionEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.coverDatePosition = parseInt(value, 10);
    entry.edited = true;
  }

  onIssueNumberPositionEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.issueNumberPosition = parseInt(value, 10);
    entry.edited = true;
  }

  onVolumePositionEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.volumePosition = parseInt(value, 10);
    entry.edited = true;
  }

  onSeriesPositionEdited(
    entry: EditableListItem<FilenameScrapingRule>,
    value: string
  ): void {
    entry.editedValue.seriesPosition = parseInt(value, 10);
    entry.edited = true;
  }

  onSaveRules(): void {
    this.logger.debug('Confirming saving filename scraping rules');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'filename-scraping-rules.save-all.confirmation-title'
      ),
      message: this.translateService.instant(
        'filename-scraping-rules.save-all.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Firing action: save filename scraping rules');
        this.store.dispatch(saveFilenameScrapingRules({ rules: this.rules }));
      }
    });
  }

  private loadTranslations(): void {
    this.logger.debug('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('filename-scraping-rules.tab-title')
    );
  }
}
