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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
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
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from 'app/app.state';
import * as LibraryScrapingActions from 'app/actions/single-comic-scraping.actions';
import { Comic } from 'app/library';
import { Volume } from 'app/comics/models/volume';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor, COMICVINE_API_KEY, User } from 'app/user';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.scss']
})
export class ComicDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() multi_comic_mode = false;
  @Output() update: EventEmitter<Comic> = new EventEmitter();

  private _comic: Comic;

  fetchOptions: MenuItem[];

  single_comic_scraping$: Observable<SingleComicScraping>;
  single_comic_scraping_subscription: Subscription;
  single_comic_scraping: SingleComicScraping;

  user: User;
  authStateSubscription: Subscription;
  skipCache = false;
  form: FormGroup;

  constructor(
    private authenticationAdaptor: AuthenticationAdaptor,
    private comicAdaptor: ComicAdaptor,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) {
    this.single_comic_scraping$ = store.select('single_comic_scraping');

    this.fetchOptions = [
      {
        label: 'Fetch',
        icon: 'fa fa-search',
        command: () => this.fetchCandidates(false)
      },
      {
        label: 'Fetch (Skip Cache)',
        icon: 'fa fa-cloud',
        command: () => this.fetchCandidates(true)
      }
    ];
    this.form = this.formBuilder.group({
      api_key: ['', [Validators.required]],
      series: ['', [Validators.required]],
      volume: ['', [Validators.required]],
      issue_number: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.authStateSubscription = this.authenticationAdaptor.user$.subscribe(
      () => {
        const api_key = this.authenticationAdaptor.getPreference(
          COMICVINE_API_KEY
        );
        this.form.controls['api_key'].setValue(api_key || '');
      }
    );
    this.single_comic_scraping_subscription = this.single_comic_scraping$.subscribe(
      (library_scrape: SingleComicScraping) => {
        this.single_comic_scraping = library_scrape;

        if (this.single_comic_scraping.api_key.length) {
          this.form.controls['api_key'].setValue(
            this.single_comic_scraping.api_key
          );
        }
        this.form.controls['series'].setValue(
          this.single_comic_scraping.series
        );
        this.form.controls['volume'].setValue(
          this.single_comic_scraping.volume
        );
        this.form.controls['issue_number'].setValue(
          this.single_comic_scraping.issue_number
        );
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
    this.single_comic_scraping_subscription.unsubscribe();
  }

  @Input()
  set comic(comic: Comic) {
    this._comic = comic;
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingSetup({
        api_key: this.form.controls['api_key'].value,
        comic: comic,
        series: comic.series,
        volume: comic.volume,
        issue_number: comic.issueNumber
      })
    );
  }

  get comic(): Comic {
    return this._comic;
  }

  get api_key(): string {
    return this.form.controls['api_key'].value;
  }

  fetchCandidates(skipCache: boolean): void {
    this.skipCache = skipCache;
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingFetchVolumes({
        api_key: this.form.controls['api_key'].value,
        series: this.form.controls['series'].value,
        volume: this.form.controls['volume'].value,
        issue_number: this.form.controls['issue_number'].value,
        skip_cache: skipCache
      })
    );
  }

  selectVolume(volume: Volume): void {
    if (volume) {
      this.store.dispatch(
        new LibraryScrapingActions.SingleComicScrapingSetCurrentVolume({
          api_key: this.form.controls['api_key'].value,
          volume: volume,
          issue_number: this.form.controls['issue_number'].value,
          skip_cache: this.skipCache
        })
      );
    } else {
      this.store.dispatch(
        new LibraryScrapingActions.SingleComicScrapingClearCurrentVolume()
      );
    }
  }

  selectIssue(): void {
    this.comicAdaptor.scrapeComic(
      this.single_comic_scraping.comic,
      this.form.controls['api_key'].value,
      this.single_comic_scraping.current_issue.id,
      this.skipCache
    );
    /*
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingScrapeMetadata({
        api_key: this.form.controls['api_key'].value,
        comic: this.single_comic_scraping.comic,
        issue_id: this.single_comic_scraping.current_issue.id,
        skip_cache: this.skipCache,
        multi_comic_mode: this.multi_comic_mode
      })
    );*/
    this.update.next(this.single_comic_scraping.comic);
  }

  cancelSelection(): void {
    this.confirmationService.confirm({
      header: this.translate.instant('comic-details-editor.cancel.header'),
      message: this.translate.instant('comic-details-editor.cancel.message'),
      icon: 'fa fa-exclamation',
      accept: () => {
        this.store.dispatch(
          new LibraryScrapingActions.SingleComicScrapingSetup({
            api_key: this.form.controls['api_key'].value,
            comic: this.comic,
            series: this.form.controls['series'].value,
            volume: this.form.controls['volume'].value,
            issue_number: this.form.controls['issue_number'].value
          })
        );
        this.update.next(this.single_comic_scraping.comic);
      }
    });
  }

  saveChanges(): void {
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingSaveLocalChanges({
        api_key: this.form.controls['api_key'].value,
        comic: this.single_comic_scraping.comic,
        series: this.form.controls['series'].value,
        volume: this.form.controls['volume'].value,
        issue_number: this.form.controls['issue_number'].value
      })
    );
  }

  resetChanges(): void {
    this.form.controls['series'].setValue(this.single_comic_scraping.series);
    this.form.controls['volume'].setValue(this.single_comic_scraping.volume);
    this.form.controls['issue_number'].setValue(
      this.single_comic_scraping.comic.issueNumber
    );
    this.form.markAsPristine();
  }

  saveApiKey(): void {
    this.authenticationAdaptor.setPreference(
      COMICVINE_API_KEY,
      this.form.controls['api_key'].value.trim()
    );
  }

  isApiKeyValid(): boolean {
    return (this.form.controls['api_key'].value || '').trim().length > 0;
  }
}
