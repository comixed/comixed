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

import { Component, inject, OnInit, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { FilenameScrapingRuleListActions } from '@app/metadata/actions/filename-scraping-rule-list.actions';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem } from '@openng/optimus-ui/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleService } from '@app/layout/services/title-service';
import { Button } from '@openng/optimus-ui/button';
import {
  FileUpload,
  FileUploadHandlerEvent
} from '@openng/optimus-ui/fileupload';
import { TableModule } from '@openng/optimus-ui/table';
import {
  selectFilenameScrapingRuleListBusy,
  selectFilenameScrapingRuleListEntries
} from '@app/metadata/selectors/filename-scraping-rule-list.selectors';
import { InputText } from '@openng/optimus-ui/inputtext';
import { FilenameScrapingRule } from '@app/metadata/models/filename-scraping-rule';
import { FormsModule } from '@angular/forms';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';

@Component({
  imports: [
    Card,
    Breadcrumb,
    Button,
    FileUpload,
    TranslatePipe,
    TableModule,
    InputText,
    FormsModule,
    InputNumber,
    InputGroup,
    InputGroupAddon
  ],
  selector: 'app-filename-scraping-rules-page',
  styleUrl: './filename-scraping-rules-page.scss',
  templateUrl: './filename-scraping-rules-page.html'
})
export class FilenameScrapingRulesPage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly confirmationService = inject(ConfirmationService);
  readonly store = inject(Store);
  readonly filenameScrapingRuleListBusy = this.store.selectSignal(
    selectFilenameScrapingRuleListBusy
  );
  readonly filenameScrapingRuleListFirst = signal(0);
  readonly filenameScrapingRuleListRows = signal(10);

  readonly trail = signal<MenuItem[]>([]);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  readonly filenameScrapingRuleListEntries = signal<FilenameScrapingRule[]>([]);

  constructor() {
    this.store
      .select(selectFilenameScrapingRuleListEntries)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: entries =>
          this.filenameScrapingRuleListEntries.set(
            entries.map((entry, index) => {
              return { ...entry, priority: index };
            })
          )
      });
    this.logger.debug('Subscribing to language change events');
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe({ next: () => this.doLoadTranslations() });
    this.doLoadTranslations();
  }

  ngOnInit(): void {
    this.doLoadRules();
  }

  onDownload(): void {
    this.logger.info('Initiating download the filename scraping rules');
    this.store.dispatch(
      FilenameScrapingRuleListActions.downloadFilenameRulesFile()
    );
  }

  onUploadFile(event: FileUploadHandlerEvent): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'filename-scraping-rule-list-page.upload-file.confirmation-title'
      ),
      message: this.translateService.instant(
        'filename-scraping-rule-list-page.upload-file.confirmation-message'
      ),
      accept: () => {
        const file = event.files[0];
        this.logger.info('Initiating uploading filename scraping rules file');
        this.store.dispatch(
          FilenameScrapingRuleListActions.uploadFilenameRulesFile({ file })
        );
      }
    });
  }

  onUpdateRule(priority: number, changes: Partial<FilenameScrapingRule>): void {
    this.filenameScrapingRuleListEntries.update(rules =>
      rules.map(rule =>
        rule.priority === priority ? { ...rule, ...changes } : rule
      )
    );
  }

  onRemoveRule(filenameScrapingRuleId: number): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'filename-scraping-rule-list-page.remove-rule.confirmation-title'
      ),
      message: this.translateService.instant(
        'filename-scraping-rule-list-page.remove-rule.confirmation-message'
      ),
      accept: () => {
        this.logger.info('Removing rule:', filenameScrapingRuleId);
        this.store.dispatch(
          FilenameScrapingRuleListActions.removeRule({ filenameScrapingRuleId })
        );
      }
    });
  }

  onAddRule(): void {
    this.logger.info('Adding empty rule');
    this.store.dispatch(FilenameScrapingRuleListActions.addRule());
  }

  onSaveRules(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'filename-scraping-rule-list-page.save-rules.confirmation-title'
      ),
      message: this.translateService.instant(
        'filename-scraping-rule-list-page.save-rules.confirmation-message'
      ),
      accept: () => {
        const rules = this.filenameScrapingRuleListEntries();
        this.store.dispatch(
          FilenameScrapingRuleListActions.saveFilenameRules({ rules })
        );
      }
    });
  }

  private doLoadRules() {
    this.logger.info('Loading filename scraping rules');
    this.store.dispatch(FilenameScrapingRuleListActions.loadFilenameRules());
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant(
        'filename-scraping-rule-list-page.page-title'
      )
    );
    this.trail.set([
      {
        label: this.translateService.instant('settings.trail-title')
      },
      {
        label: this.translateService.instant(
          'filename-scraping-rule-list-page.trail-title'
        )
      }
    ]);
  }
}
