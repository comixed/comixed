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
import { AppState, Comic } from 'app/comics';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
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
import { Store } from '@ngrx/store';
import {
  selectScrapingIssue,
  selectScrapingIssuesFetching
} from 'app/comics/selectors/scraping-issue.selectors';
import { getScrapingIssue } from 'app/comics/actions/scraping-issue.actions';
import {
  selectScrapingVolumes,
  selectScrapingVolumesFetching
} from 'app/comics/selectors/scraping-volumes.selectors';
import { getScrapingVolumes } from 'app/comics/actions/scraping-volumes.actions';
import { scrapeComic } from 'app/comics/actions/scrape-comic.actions';
import {
  selectScrapeComicScraping,
  selectScrapeComicSuccess
} from 'app/comics/selectors/scrape-comic.selectors';

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
  fetchingVolumesSubscription: Subscription;
  fetchingVolumes = false;
  volumesSubscription: Subscription;
  volumes: ScrapingVolume[] = [];
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
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private store: Store<AppState>
  ) {
    this.comicDetailsForm = this.formBuilder.group({
      apiKey: ['', [Validators.required]],
      seriesName: ['', [Validators.required]],
      volumeName: [''],
      issueNumber: ['', [Validators.required]],
      maxRecords: ['', [Validators.required]]
    });
    this.fetchingVolumesSubscription = this.store
      .select(selectScrapingVolumesFetching)
      .subscribe(fetching => (this.fetchingVolumes = fetching));
    this.volumesSubscription = this.store
      .select(selectScrapingVolumes)
      .subscribe(volumes => (this.volumes = volumes));
    this.fetchingIssueSubscription = this.store
      .select(selectScrapingIssuesFetching)
      .subscribe(fetching => (this.fetchingIssue = fetching));
    this.currentIssueSubscription = this.store
      .select(selectScrapingIssue)
      .subscribe(issue => (this.currentIssue = issue));
    this.store.select(selectScrapeComicSuccess).subscribe(success => {
      if (success) {
        this.volumes = [];
      }
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
    this.store
      .select(selectScrapeComicScraping)
      .subscribe(scraping => (this.scraping = scraping));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslatedOptions()
    );
    this.loadTranslatedOptions();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.fetchingVolumesSubscription.unsubscribe();
    this.fetchingIssueSubscription.unsubscribe();
    this.currentIssueSubscription.unsubscribe();
  }

  @Input()
  set comic(comic: Comic) {
    this._comic = comic;
    this.loadComicDetailsForm();
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
    this.store.dispatch(
      getScrapingVolumes({
        apiKey: this.apiKey,
        series: this.seriesName,
        volume: this.volume,
        maxRecords: this.maxRecords,
        skipCache: this.skipCache
      })
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
    this.comicDetailsForm.controls['volumeName'].setValue(volume);
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
      this.logger.trace('Fetch scraping issue');
      this.store.dispatch(
        getScrapingIssue({
          apiKey: this.apiKey,
          volumeId: volume.id,
          issueNumber: this.issueNumber,
          skipCache: this.skipCache
        })
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
        this.store.dispatch(
          scrapeComic({
            apiKey: this.apiKey,
            comicId: this.comic.id,
            issueNumber: `${issue.id}`,
            skipCache: this.skipCache
          })
        )
    });
  }

  selectionCancelled() {
    this.volumes = [];
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
