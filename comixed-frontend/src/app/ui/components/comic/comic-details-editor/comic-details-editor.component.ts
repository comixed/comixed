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
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from 'app/app.state';
import * as LibraryScrapingActions from 'app/actions/single-comic-scraping.actions';
import * as UserActions from 'app/actions/user.actions';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { Comic } from 'app/models/comics/comic';
import { Volume } from 'app/models/comics/volume';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { User } from 'app/models/user/user';
import { Preference } from 'app/models/user/preference';
import { COMICVINE_API_KEY } from 'app/models/user/preferences.constants';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.css']
})
export class ComicDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() multi_comic_mode = false;
  @Output() update: EventEmitter<Comic> = new EventEmitter();

  fetch_options: Array<MenuItem>;

  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  single_comic_scraping$: Observable<SingleComicScraping>;
  single_comic_scraping_subscription: Subscription;
  single_comic_scraping: SingleComicScraping;

  protected volume_selection_banner: string;
  private date_formatter = Intl.DateTimeFormat('en-us', {
    month: 'short',
    year: 'numeric'
  });

  skip_cache = false;
  form: FormGroup;

  constructor(
    private user_service: UserService,
    private comic_service: ComicService,
    private confirmation_service: ConfirmationService,
    private translate: TranslateService,
    private store: Store<AppState>,
    private form_builder: FormBuilder
  ) {
    this.user$ = store.select('user');
    this.single_comic_scraping$ = store.select('single_comic_scraping');

    this.fetch_options = [
      {
        label: 'Fetch',
        icon: 'fa fa-search',
        command: () => this.fetch_candidates(false)
      },
      {
        label: 'Fetch (Skip Cache)',
        icon: 'fa fa-cloud',
        command: () => this.fetch_candidates(true)
      }
    ];
    this.form = this.form_builder.group({
      api_key: ['', [Validators.required]],
      series: ['', [Validators.required]],
      volume: ['', [Validators.required]],
      issue_number: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe((user: User) => {
      this.user = user;

      const api_key = this.user.preferences.find((preference: Preference) => {
        return preference.name === COMICVINE_API_KEY;
      });

      this.form.controls['api_key'].setValue(api_key ? api_key.value : '');
    });
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
    this.user_subscription.unsubscribe();
    this.single_comic_scraping_subscription.unsubscribe();
  }

  @Input()
  set comic(comic: Comic) {
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingSetup({
        api_key: this.form.controls['api_key'].value,
        comic: comic,
        series: comic.series,
        volume: comic.volume,
        issue_number: comic.issue_number
      })
    );
  }

  get api_key(): string {
    return this.form.controls['api_key'].value;
  }

  fetch_candidates(skip_cache: boolean): void {
    this.skip_cache = skip_cache;
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingFetchVolumes({
        api_key: this.form.controls['api_key'].value,
        series: this.form.controls['series'].value,
        volume: this.form.controls['volume'].value,
        issue_number: this.form.controls['issue_number'].value,
        skip_cache: skip_cache
      })
    );
  }

  select_volume(volume: Volume): void {
    if (volume) {
      this.store.dispatch(
        new LibraryScrapingActions.SingleComicScrapingSetCurrentVolume({
          api_key: this.form.controls['api_key'].value,
          volume: volume,
          issue_number: this.form.controls['issue_number'].value,
          skip_cache: this.skip_cache
        })
      );
    } else {
      this.store.dispatch(
        new LibraryScrapingActions.SingleComicScrapingClearCurrentVolume()
      );
    }
  }

  select_issue(): void {
    this.store.dispatch(
      new LibraryScrapingActions.SingleComicScrapingScrapeMetadata({
        api_key: this.form.controls['api_key'].value,
        comic: this.single_comic_scraping.comic,
        issue_id: this.single_comic_scraping.current_issue.id,
        skip_cache: this.skip_cache,
        multi_comic_mode: this.multi_comic_mode
      })
    );
    this.update.next(this.single_comic_scraping.comic);
  }

  cancel_selection(): void {
    this.confirmation_service.confirm({
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

  save_changes(): void {
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

  reset_changes(): void {
    this.form.controls['series'].setValue(this.single_comic_scraping.series);
    this.form.controls['volume'].setValue(this.single_comic_scraping.volume);
    this.form.controls['issue_number'].setValue(
      this.single_comic_scraping.comic.issue_number
    );
    this.form.markAsPristine();
  }

  save_api_key(): void {
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: COMICVINE_API_KEY,
        value: this.form.controls['api_key'].value.trim()
      })
    );
  }

  is_api_key_valid(): boolean {
    return (this.form.controls['api_key'].value || '').trim().length > 0;
  }
}
