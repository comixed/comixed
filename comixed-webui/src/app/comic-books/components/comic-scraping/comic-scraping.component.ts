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

import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { Store } from '@ngrx/store';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { MetadataEvent } from '@app/comic-metadata/models/event/metadata-event';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import { Subscription } from 'rxjs';
import {
  resetScrapedMetadata,
  scrapeMetadataFromFilename
} from '@app/comic-files/actions/scrape-metadata.actions';
import { selectScrapeMetadataState } from '@app/comic-files/selectors/scrape-metadata.selectors';
import { filter } from 'rxjs/operators';
import {
  scrapeComic,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping
} from '@app/comic-metadata/actions/metadata.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ListItem } from '@app/core/models/ui/list-item';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { selectMetadataSourceList } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { selectMetadataState } from '@app/comic-metadata/selectors/metadata.selectors';

@Component({
  selector: 'cx-comic-scraping',
  templateUrl: './comic-scraping.component.html',
  styleUrls: ['./comic-scraping.component.scss']
})
export class ComicScrapingComponent implements OnInit, OnDestroy {
  @Input() skipCache = false;
  @Input() maximumRecords = 0;
  @Input() metadataSource: MetadataSource = null;
  @Input() multimode = false;

  @Output() scrape = new EventEmitter<MetadataEvent>();

  readonly maximumRecordsOptions = [
    { value: 0, label: 'scraping.label.all-records' },
    { value: 100, label: 'scraping.label.100-records' },
    { value: 1000, label: 'scraping.label.1000-records' }
  ];

  comicForm: UntypedFormGroup;
  scrapingMode = false;
  scrapedMetadataSubscription: Subscription;
  metadataSourceListSubscription: Subscription;
  metadataSourceList: ListItem<MetadataSource>[] = [];
  metadataSubscription: Subscription;
  preferredMetadataSource: MetadataSource;
  confirmBeforeScraping = true;
  autoSelectExactMatch = false;

  constructor(
    private logger: LoggerService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicForm = this.formBuilder.group({
      publisher: [''],
      series: ['', [Validators.required]],
      volume: ['', [Validators.pattern('[0-9]{4}')]],
      issueNumber: ['', [Validators.required]],
      referenceId: [''],
      imprint: [''],
      sortName: [''],
      title: [''],
      description: ['']
    });
    this.store.dispatch(resetScrapedMetadata());
    this.scrapedMetadataSubscription = this.store
      .select(selectScrapeMetadataState)
      .pipe(filter(state => state.found))
      .subscribe(state => {
        this.logger.debug('Filename scraping data updated');
        this.comicForm.controls.series.setValue(state.series);
        this.comicForm.controls.volume.setValue(state.volume);
        this.comicForm.controls.issueNumber.setValue(state.issueNumber);
      });
    this.metadataSourceListSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(sources => {
        const preferred = sources.filter(source => source.preferred);
        this.preferredMetadataSource =
          preferred.length > 0 ? preferred[0] : null;
        this.metadataSourceList = sources.map(source => {
          return { label: source.name, value: source };
        });
        this.store.dispatch(
          setChosenMetadataSource({ metadataSource: sources[0] })
        );
      });
    this.metadataSubscription = this.store
      .select(selectMetadataState)
      .subscribe(state => {
        this.logger.debug('Metadata state changed');
        this.confirmBeforeScraping = state.confirmBeforeScraping;
        this.autoSelectExactMatch = state.autoSelectExactMatch;
      });
  }

  private _comic: ComicBook;

  get comic(): ComicBook {
    return this._comic;
  }

  @Input() set comic(comic: ComicBook) {
    this.logger.debug('Loading comic form:', comic);
    this._comic = comic;
    this.logger.debug('Loading form fields');
    if (!!comic.metadata) {
      this.logger.debug('Preselecting metadata source');
      this.store.dispatch(
        setChosenMetadataSource({
          metadataSource: comic.metadata.metadataSource
        })
      );
    }
    this.comicForm.controls.referenceId.setValue(comic.metadata?.referenceId);
    this.comicForm.controls.publisher.setValue(comic.detail.publisher);
    this.comicForm.controls.series.setValue(comic.detail.series);
    this.comicForm.controls.volume.setValue(comic.detail.volume);
    this.comicForm.controls.issueNumber.setValue(comic.detail.issueNumber);
    this.comicForm.controls.imprint.setValue(comic.detail.imprint);
    this.comicForm.updateValueAndValidity();
  }

  get readyToScrape(): boolean {
    return !!this.metadataSource && this.comicForm.valid;
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from scraped metadata updates');
    this.scrapedMetadataSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from metadata source list');
    this.metadataSourceListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.debug('Loading metadata sources');
    this.store.dispatch(loadMetadataSources());
  }

  @HostListener('window:keydown.shift.control.u', ['$event'])
  onHotkeyUndoChanges(event: KeyboardEvent): void {
    this.logger.debug('Undoing changes from hotkey');
    event.preventDefault();
    this.onUndoChanges();
  }

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.undo-changes.title'),
      message: this.translateService.instant('comic-book.undo-changes.message'),
      confirm: () => {
        this.logger.debug('Undoing changes');
        this.comic = this._comic;
        this.comicForm.markAsUntouched();
      }
    });
  }

  @HostListener('window:keydown.shift.control.m', ['$event'])
  onHotKeyFetchScrapingVolumes(event: KeyboardEvent): void {
    this.logger.debug('Loading scraping volumes from hotkey');
    event.preventDefault();
    this.onFetchScrapingVolumes();
  }

  onFetchScrapingVolumes(): void {
    this.logger.debug('Loading scraping volumes');
    this.scrape.emit({
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      maximumRecords: this.maximumRecords,
      skipCache: this.skipCache
    });
  }

  @HostListener('window:keydown.shift.control.c', ['$event'])
  onHotKeySkipCacheToggle(event: KeyboardEvent): void {
    this.logger.debug('Toggling skipping the cache from hotkey');
    event.preventDefault();
    this.onSkipCacheToggle();
  }

  onSkipCacheToggle(): void {
    this.logger.debug('Toggling skipping the cache');
    this.skipCache = this.skipCache === false;
    this.store.dispatch(
      saveUserPreference({
        name: SKIP_CACHE_PREFERENCE,
        value: `${this.skipCache}`
      })
    );
  }

  onMaximumRecordsChanged(maximumRecords: number): void {
    this.logger.debug('Changed maximum records');
    this.store.dispatch(
      saveUserPreference({
        name: MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
        value: `${maximumRecords}`
      })
    );
  }

  @HostListener('window:keydown.shift.control.s', ['$event'])
  onHotKeySaveChanges(event: KeyboardEvent): void {
    this.logger.debug('Saving changes to comic from hotkey');
    event.preventDefault();
    this.onSaveChanges();
  }

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.save-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.save-changes.confirmation-message'
      ),
      confirm: () => {
        const comic = this.encodeForm();
        this.logger.debug('Saving changes to comic:', comic);
        this.store.dispatch(updateComicBook({ comicBook: comic }));
      }
    });
  }

  @HostListener('window:keydown.shift.control.f', ['$event'])
  onHotKeyScrapeFilename(event: KeyboardEvent): void {
    this.logger.debug('Scraping filename from hotkey');
    event.preventDefault();
    this.onScrapeFilename();
  }

  onScrapeFilename(): void {
    const filename = this.comic.detail.baseFilename;
    this.logger.debug('Scraping the comic filename:', filename);
    this.store.dispatch(scrapeMetadataFromFilename({ filename }));
  }

  onMetadataSourceChosen(id: number): void {
    const metadataSource = this.metadataSourceList.find(
      entry => entry.value.id === id
    ).value;
    this.logger.debug('Metadata source selected:', metadataSource);
    this.store.dispatch(setChosenMetadataSource({ metadataSource }));
  }

  onScrapeWithReferenceId(): void {
    const referenceId = this.comicForm.controls.referenceId.value;
    this.logger.debug('Confirming scrape coming using reference id');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.scrape-comic-confirmation-title'
      ),
      message: this.translateService.instant(
        'scraping.scrape-comic-confirmation-message'
      ),
      confirm: () => {
        this.store.dispatch(
          scrapeComic({
            comic: this.comic,
            metadataSource: this.metadataSource,
            issueId: referenceId,
            skipCache: this.skipCache
          })
        );
      }
    });
  }

  @HostListener('window:keydown.shift.control.o', ['$event'])
  onHotkeyToggleConfirmBeforeScrape(event: KeyboardEvent): void {
    this.logger.debug('Toggling confirm before scrape from hotkey');
    event.preventDefault();
    this.onToggleConfirmBeforeScrape();
  }

  onToggleConfirmBeforeScrape(): void {
    this.logger.debug('Firing event: toggling confirm before scrape');
    this.store.dispatch(
      setConfirmBeforeScraping({
        confirmBeforeScraping: !this.confirmBeforeScraping
      })
    );
  }

  @HostListener('window:keydown.shift.control.x', ['$event'])
  onHotKeyToggleAutoSelectExactMatch(event: KeyboardEvent): void {
    this.logger.debug('Toggling auto select exact match from hotkey');
    event.preventDefault();
    this.onToggleAutoSelectExactMatch();
  }

  onToggleAutoSelectExactMatch(): void {
    this.logger.debug('Firing event: toggle auto select exact match');
    this.store.dispatch(
      setAutoSelectExactMatch({
        autoSelectExactMatch: !this.autoSelectExactMatch
      })
    );
  }

  encodeForm(): ComicBook {
    this.logger.debug('Encoding comic');
    return {
      ...this.comic,
      detail: {
        ...this.comic.detail,
        id: undefined,
        publisher: this.comicForm.controls.publisher.value,
        series: this.comicForm.controls.series.value,
        volume: this.comicForm.controls.volume.value,
        issueNumber: this.comicForm.controls.issueNumber.value
      }
    } as ComicBook;
  }
}
