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
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Comic } from '@app/comic-books/models/comic';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { MetadataEvent } from '@app/comic-metadata/models/event/metadata-event';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  MAXIMUM_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { updateComic } from '@app/comic-books/actions/comic.actions';
import { Subscription } from 'rxjs';
import { selectImprints } from '@app/comic-books/selectors/imprint-list.selectors';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { loadImprints } from '@app/comic-books/actions/imprint-list.actions';
import { Imprint } from '@app/comic-books/models/imprint';
import {
  resetScrapedMetadata,
  scrapeMetadataFromFilename
} from '@app/comic-files/actions/scrape-metadata.actions';
import { selectScrapeMetadataState } from '@app/comic-files/selectors/scrape-metadata.selectors';
import { filter } from 'rxjs/operators';
import {
  scrapeComic,
  setChosenMetadataSource
} from '@app/comic-metadata/actions/metadata.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ListItem } from '@app/core/models/ui/list-item';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { selectMetadataSourceList } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';

@Component({
  selector: 'cx-comic-edit',
  templateUrl: './comic-edit.component.html',
  styleUrls: ['./comic-edit.component.scss']
})
export class ComicEditComponent implements OnInit, OnDestroy {
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
  comicForm: FormGroup;
  scrapingMode = false;
  scrapedMetadataSubscription: Subscription;
  metadataSourceListSubscription: Subscription;
  metadataSourceList: ListItem<MetadataSource>[] = [];
  imprintSubscription: Subscription;
  imprintOptions: SelectionOption<Imprint>[] = [];
  imprints: Imprint[];

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicForm = this.formBuilder.group({
      publisher: [''],
      series: ['', [Validators.required]],
      volume: ['', [Validators.pattern('[0-9]{4}')]],
      issueNumber: ['', [Validators.required]],
      comicVineId: ['', [Validators.pattern('[0-9]{6}')]],
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
        this.logger.trace('Filename scraping data updated');
        this.comicForm.controls.series.setValue(state.series);
        this.comicForm.controls.volume.setValue(state.volume);
        this.comicForm.controls.issueNumber.setValue(state.issueNumber);
      });
    this.metadataSourceListSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(sources => {
        this.metadataSourceList = sources.map(source => {
          return { label: source.name, value: source };
        });
        this.store.dispatch(
          setChosenMetadataSource({ metadataSource: sources[0] })
        );
      });
    this.imprintSubscription = this.store
      .select(selectImprints)
      .subscribe(imprints => {
        this.logger.trace('Loading imprint options');
        this.imprints = imprints;
        this.imprintOptions = [
          {
            label: '---',
            value: { id: -1, name: '', publisher: '' }
          } as SelectionOption<Imprint>
        ].concat(
          imprints.map(imprint => {
            return {
              label: imprint.name,
              value: imprint
            } as SelectionOption<Imprint>;
          })
        );
      });
  }

  private _comic: Comic;

  get comic(): Comic {
    return this._comic;
  }

  @Input() set comic(comic: Comic) {
    this.logger.trace('Loading comic form:', comic);
    this._comic = comic;
    this.logger.trace('Loading form fields');
    this.comicForm.controls.comicVineId.setValue(comic.comicVineId);
    this.comicForm.controls.publisher.setValue(comic.publisher);
    this.comicForm.controls.series.setValue(comic.series);
    this.comicForm.controls.volume.setValue(comic.volume);
    this.comicForm.controls.issueNumber.setValue(comic.issueNumber);
    this.comicForm.controls.imprint.setValue(comic.imprint);
    this.comicForm.controls.sortName.setValue(comic.sortName);
    this.comicForm.controls.title.setValue(comic.title);
    this.comicForm.controls.description.setValue(comic.description);
    this.comicForm.updateValueAndValidity();
  }

  get readyToScrape(): boolean {
    return !!this.metadataSource && this.comicForm.valid;
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from scraped metadata updates');
    this.scrapedMetadataSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metadata source list');
    this.metadataSourceListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from imprint updates');
    this.imprintSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata sources');
    this.store.dispatch(loadMetadataSources());
    this.logger.trace('Loading imprints');
    this.store.dispatch(loadImprints());
  }

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.undo-changes.title'),
      message: this.translateService.instant('comic-book.undo-changes.message'),
      confirm: () => {
        this.logger.trace('Undoing changes');
        this.comic = this._comic;
        this.comicForm.markAsUntouched();
      }
    });
  }

  onFetchScrapingVolumes(): void {
    this.logger.trace('Loading scraping volumes');
    this.scrape.emit({
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      maximumRecords: this.maximumRecords,
      skipCache: this.skipCache
    });
  }

  onSkipCacheToggle(): void {
    this.logger.trace('Toggling skipping the cache');
    this.skipCache = this.skipCache === false;
    this.store.dispatch(
      saveUserPreference({
        name: SKIP_CACHE_PREFERENCE,
        value: `${this.skipCache}`
      })
    );
  }

  onMaximumRecordsChanged(maximumRecords: number): void {
    this.logger.trace('Changed maximum records');
    this.store.dispatch(
      saveUserPreference({
        name: MAXIMUM_RECORDS_PREFERENCE,
        value: `${maximumRecords}`
      })
    );
  }

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.save-changes.title'),
      message: this.translateService.instant('comic-book.save-changes.message'),
      confirm: () => {
        const comic = this.encodeForm();
        this.logger.debug('Saving changes to comic:', comic);
        this.store.dispatch(updateComic({ comic }));
      }
    });
  }

  onImprintSelected(name: string): void {
    this.logger.trace('Finding imprint');
    const imprint = this.imprints.find(entry => entry.name === name);
    this.logger.trace('Setting publisher name');
    this.comicForm.controls.publisher.setValue(
      imprint?.publisher || this.comic.publisher
    );
    this.logger.trace('Setting imprint name');
    this.comicForm.controls.imprint.setValue(
      imprint?.name || this.comic.imprint
    );
  }

  onScrapeFilename(): void {
    const filename = this.comic.baseFilename;
    this.logger.trace('Scraping the comic filename:', filename);
    this.store.dispatch(scrapeMetadataFromFilename({ filename }));
  }

  onScrapeUsingComicVineId(): void {
    this.logger.trace('Confirming scraping the issue');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.scrape-comic-confirmation-title'
      ),
      message: this.translateService.instant(
        'scraping.scrape-comic-confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Scraping issue using ComicVine ID');
        this.store.dispatch(
          scrapeComic({
            metadataSource: this.metadataSource,
            issueId: this.comic.comicVineId,
            comic: this.comic,
            skipCache: this.skipCache
          })
        );
      }
    });
  }

  onMetadataSourceChosen(metadataSource: MetadataSource): void {
    this.logger.trace('Metadata source selected:', metadataSource);
    console.log('Metadata source selected:', metadataSource);
    this.store.dispatch(setChosenMetadataSource({ metadataSource }));
  }

  private encodeForm(): Comic {
    this.logger.trace('Encoding comic');
    return {
      ...this.comic,
      publisher: this.comicForm.controls.publisher.value,
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      imprint: this.comicForm.controls.imprint.value,
      sortName: this.comicForm.controls.sortName.value,
      title: this.comicForm.controls.title.value,
      description: this.comicForm.controls.description.value,
      comicVineId: this.comicForm.controls.comicVineId.value
    } as Comic;
  }
}
