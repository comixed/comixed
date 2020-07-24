/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Comic } from 'app/comics';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ScrapingAdaptor } from 'app/comics/adaptors/scraping.adaptor';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import { AuthenticationAdaptor, COMICVINE_API_KEY } from 'app/user';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  USER_PREFERENCE_MAX_SCRAPING_RECORDS,
  USER_PREFERENCE_SKIP_CACHE
} from 'app/user/user.constants';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.scss']
})
export class ComicDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() multiComicMode = false;

  @Output() skipComic = new EventEmitter<Comic>();

  private _comic: Comic;

  userSubscription: Subscription;
  scrapingComicsSubscription: Subscription;
  scrapingComics = [];
  fetchingVolumesSubscription: Subscription;
  fetchingVolumes = false;
  volumesSubscription: Subscription;
  volumes: ScrapingVolume[];
  fetchingIssueSubscription: Subscription;
  fetchingIssue = false;
  scrapingSubscription: Subscription;
  scraping = false;
  currentVolume: ScrapingVolume;
  currentIssueSubscription: Subscription;
  currentIssue: ScrapingIssue;
  langChangeSubscription: Subscription;

  comicDetailsForm: FormGroup;
  fetchOptions: MenuItem[] = [];
  editingApiKey = false;
  skipCache = false;
  maxRecordsOptions: SelectItem[] = [];

  constructor(
    private logger: LoggerService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private comicAdaptor: ComicAdaptor,
    private scrapingAdaptor: ScrapingAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.comicDetailsForm = this.formBuilder.group({
      apiKey: ['', [Validators.required]],
      seriesName: ['', [Validators.required]],
      volumeName: [''],
      issueNumber: ['', [Validators.required]],
      maxRecords: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.userSubscription = this.authenticationAdaptor.user$.subscribe(user => {
      this.comicDetailsForm.controls['apiKey'].setValue(
        this.authenticationAdaptor.getPreference(COMICVINE_API_KEY)
      );
      this.skipCache =
        (this.authenticationAdaptor.getPreference(USER_PREFERENCE_SKIP_CACHE) ||
          'false') === 'true';
      this.maxRecords = parseInt(
        this.authenticationAdaptor.getPreference(
          USER_PREFERENCE_MAX_SCRAPING_RECORDS
        ) || '0',
        10
      );
    });
    this.scrapingComicsSubscription = this.scrapingAdaptor.comics$.subscribe(
      comics => (this.scrapingComics = comics)
    );
    this.fetchingVolumesSubscription = this.scrapingAdaptor.fetchingVolumes$.subscribe(
      fetching => (this.fetchingVolumes = fetching)
    );
    this.volumesSubscription = this.scrapingAdaptor.volumes$.subscribe(
      volumes => (this.volumes = volumes)
    );
    this.fetchingIssueSubscription = this.scrapingAdaptor.fetchingIssue$.subscribe(
      fetching => (this.fetchingIssue = fetching)
    );
    this.scrapingSubscription = this.scrapingAdaptor.scraping$.subscribe(
      scraping => (this.scraping = scraping)
    );
    this.currentIssueSubscription = this.scrapingAdaptor.issue$.subscribe(
      issue => (this.currentIssue = issue)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslatedOptions()
    );
    this.loadTranslatedOptions();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.scrapingComicsSubscription.unsubscribe();
    this.fetchingVolumesSubscription.unsubscribe();
    this.fetchingIssueSubscription.unsubscribe();
    this.currentIssueSubscription.unsubscribe();
    this.scrapingSubscription.unsubscribe();
  }

  @Input()
  set comic(comic: Comic) {
    this._comic = comic;
    this.loadComicDetailsForm();
    if (!this.multiComicMode) {
      this.scrapingAdaptor.startScraping([comic]);
    }
  }

  get comic(): Comic {
    return this._comic;
  }

  private loadTranslatedOptions() {
    this.loadFetchOptions();
    this.loadMaxRecordsOptions();
  }

  private loadFetchOptions() {
    this.fetchOptions = [
      {
        label: this.translateService.instant(
          'comic-details-editor.option.fetch.with-cache'
        ),
        icon: 'fa fa-fw fa-search',
        command: () => this.getVolumes(false)
      },
      {
        label: this.translateService.instant(
          'comic-details-editor.option.fetch.skip-cache'
        ),
        icon: 'fa fa-fw fa-search',
        command: () => this.getVolumes(true)
      }
    ];
  }

  private loadMaxRecordsOptions() {
    this.maxRecordsOptions = [
      {
        label: this.translateService.instant(
          'comic-details-editor.option.max-records.all-records'
        ),
        value: 0
      },
      {
        label: this.translateService.instant(
          'comic-details-editor.option.max-records.100-records'
        ),
        value: 100
      },
      {
        label: this.translateService.instant(
          'comic-details-editor.option.max-records.1000-records'
        ),
        value: 1000
      }
    ];
  }

  getVolumes(skipCache: boolean): void {
    if (skipCache !== this.skipCache) {
      this.logger.info(`getting volumes for comic: skipCache=${skipCache}`);
      this.authenticationAdaptor.setPreference(
        USER_PREFERENCE_SKIP_CACHE,
        `${skipCache}`
      );
    }
    this.scrapingAdaptor.getVolumes(
      this.apiKey,
      this.seriesName,
      this.issueNumber,
      this.maxRecords,
      skipCache
    );
  }

  saveApiKey() {
    this.authenticationAdaptor.setPreference(COMICVINE_API_KEY, this.apiKey);
    this.editingApiKey = false;
  }

  resetApiKey() {
    this.comicDetailsForm.controls['apiKey'].reset(
      this.authenticationAdaptor.getPreference(COMICVINE_API_KEY)
    );
    this.editingApiKey = false;
  }

  private loadComicDetailsForm() {
    this.comicDetailsForm.controls['seriesName'].setValue(this._comic.series);
    this.comicDetailsForm.controls['volumeName'].setValue(this._comic.volume);
    this.comicDetailsForm.controls['issueNumber'].setValue(
      this._comic.issueNumber
    );
    this.comicDetailsForm.markAsPristine();
  }

  saveDetails() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-details-editor.save-changes.header'
      ),
      message: this.translateService.instant(
        'comic-details-editor.save-changes.message'
      ),
      accept: () => {
        this.comicAdaptor.saveComic({
          ...this._comic,
          series: this.seriesName,
          volume: this.volume,
          issueNumber: this.issueNumber
        });
        this.comicDetailsForm.markAsPristine();
      }
    });
  }

  resetDetails() {
    this.loadComicDetailsForm();
  }

  set seriesName(seriesName: string) {
    this.comicDetailsForm.controls['seriesName'].setValue(seriesName);
  }

  get seriesName(): string {
    return this.comicDetailsForm.controls['seriesName'].value;
  }

  set volume(volume: string) {
    this.comicDetailsForm.controls['volume'].setValue(volume);
  }

  get volume(): string {
    return this.comicDetailsForm.controls['volumeName'].value;
  }

  set issueNumber(issueNumber: string) {
    this.comicDetailsForm.controls['issueNumber'].setValue(issueNumber);
  }

  get issueNumber(): string {
    let result = this.comicDetailsForm.controls['issueNumber'].value;
    // strip any leading 0s
    while (
      !!result &&
      result.length > 0 &&
      result !== '0' &&
      result.startsWith('0')
    ) {
      result = result.substring(1);
    }

    return result;
  }

  set maxRecords(maxRecords: number) {
    this.comicDetailsForm.controls['maxRecords'].setValue(maxRecords);
  }

  get maxRecords(): number {
    return this.comicDetailsForm.controls['maxRecords'].value;
  }

  set apiKey(apiKey: string) {
    this.comicDetailsForm.controls['apiKey'].setValue(apiKey);
  }

  get apiKey() {
    return this.comicDetailsForm.controls['apiKey'].value;
  }

  volumeSelected(volume: ScrapingVolume) {
    this.currentVolume = volume;
    if (!!volume) {
      this.scrapingAdaptor.getIssue(
        this.apiKey,
        volume.id,
        this.issueNumber,
        this.skipCache
      );
    } else {
      this.currentIssue = null;
    }
  }

  issueSelected(issue: ScrapingIssue) {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-details-editor.issue-selected.header'
      ),
      message: this.translateService.instant(
        'comic-details-editor.issue-selected.message'
      ),
      accept: () =>
        this.scrapingAdaptor.loadMetadata(
          this.apiKey,
          this.comic.id,
          `${issue.id}`,
          this.skipCache
        )
    });
  }

  selectionCancelled() {
    this.scrapingAdaptor.resetVolumes();
  }

  skipCurrentComic() {
    this.skipComic.next(this.comic);
  }

  doFetchVolumes() {
    this.getVolumes(this.skipCache);
  }

  changedMaxRecords(maxRecords: any) {
    this.logger.debug('saving maximum scraping records preference');
    this.authenticationAdaptor.setPreference(
      USER_PREFERENCE_MAX_SCRAPING_RECORDS,
      `${maxRecords}`
    );
  }
}
