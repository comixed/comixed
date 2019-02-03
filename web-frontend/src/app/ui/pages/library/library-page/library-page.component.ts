/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute, Params } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { Library } from "../../../../models/actions/library";
import * as LibraryActions from "../../../../actions/library.actions";
import { LibraryFilter } from "../../../../models/library/library-filter";
import * as FilterActions from "../../../../actions/library-filter.actions";
import { LibraryDisplay } from "../../../../models/library-display";
import { MultipleComicsScraping } from "../../../../models/scraping/multiple-comics-scraping";
import * as LibraryDisplayActions from "../../../../actions/library-display.actions";
import * as ScrapingActions from "../../../../actions/multiple-comics-scraping.actions";
import { Observable, Subscription } from "rxjs";
import { Comic } from "../../../../models/comics/comic";
import * as UserActions from "../../../../actions/user.actions";
import { User } from "../../../../models/user/user";
import { Preference } from "../../../../models/user/preference";
import { UserService } from "../../../../services/user.service";
import { ComicService } from "../../../../services/comic.service";
import { ConfirmationService } from "primeng/api";
import { SelectItem } from "primeng/api";
import {
  LIBRARY_SORT,
  LIBRARY_ROWS,
  LIBRARY_COVER_SIZE,
  LIBRARY_CURRENT_TAB
} from "../../../../models/user/preferences.constants";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-library-page",
  templateUrl: "./library-page.component.html",
  styleUrls: ["./library-page.component.css"]
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  readonly ROWS_PARAMETER = "rows";
  readonly SORT_PARAMETER = "sort";
  readonly COVER_PARAMETER = "coversize";
  readonly GROUP_BY_PARAMETER = "groupby";
  readonly TAB_PARAMETER = "tab";

  private user$: Observable<User>;
  private user_subscription: Subscription;
  user: User;

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  private library_filter$: Observable<LibraryFilter>;
  private library_filter_subscription: Subscription;
  library_filter: LibraryFilter;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  library_display: LibraryDisplay;

  comics: Array<Comic>;

  rows_options: Array<SelectItem>;
  rows: number;

  sort_options: Array<SelectItem>;
  sort_by: string;

  group_options: Array<SelectItem>;
  group_by: string;

  cover_size: number;
  current_tab: number;

  protected busy = false;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private confirm_service: ConfirmationService,
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.user$ = store.select("user");
    this.library$ = store.select("library");
    this.library_filter$ = store.select("library_filter");
    this.activated_route.queryParams.subscribe((params: Params) => {
      this.sort_by = params[this.SORT_PARAMETER] || "series";
      this.rows = parseInt(params[this.ROWS_PARAMETER] || "10", 10);
      this.cover_size = parseInt(params[this.COVER_PARAMETER] || "200", 10);
      this.current_tab = parseInt(params[this.TAB_PARAMETER] || "0", 10);
    });
    this.library_display$ = store.select("library_display");
    this.scraping$ = store.select("multiple_comic_scraping");
    this.sort_options = [
      { label: "Publisher", value: "publisher" },
      { label: "Series", value: "series" },
      { label: "Volume", value: "volume" },
      { label: "Issue #", value: "issue_number" },
      { label: "Date Added", value: "added_date" },
      { label: "Cover Date", value: "cover_date" }
    ];
    this.group_options = [
      { label: "None", value: "none" },
      { label: "Series", value: "series" },
      { label: "Publisher", value: "publisher" },
      { label: "Year", value: "year" }
    ];
    this.rows_options = [
      { label: "10 comics", value: 10 },
      { label: "25 comics", value: 25 },
      { label: "50 comics", value: 50 },
      { label: "100 comics", value: 100 }
    ];
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe((user: User) => {
      this.user = user;
    });
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;
      this.comics = library.comics;
    });
    this.library_filter_subscription = this.library_filter$.subscribe(
      (library_filter: LibraryFilter) => {
        if (!this.library_filter || library_filter.changed) {
          this.library_filter = library_filter;
        }
      }
    );
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      }
    );
    this.store.dispatch(
      new ScrapingActions.MultipleComicsScrapingSetup({
        api_key: this.user_service.get_user_preference("api_key", "")
      })
    );
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
    this.library_subscription.unsubscribe();
    this.library_filter_subscription.unsubscribe();
  }

  get_download_link(comic: Comic): string {
    return this.comic_service.get_download_link_for_comic(comic.id);
  }

  set_current_tab(current_tab: number): void {
    //    this.store.dispatch(new UserActions.UserSetPreference({
    //      name: LIBRARY_CURRENT_TAB,
    //      value: `${current_tab}`
    //    }));
    this.update_params(this.TAB_PARAMETER, `${current_tab}`);
  }

  set_sort_order(sort_order: string): void {
    this.sort_by = sort_order;
    //    this.store.dispatch(new UserActions.UserSetPreference({
    //      name: LIBRARY_SORT,
    //      value: sort_order,
    //    }));
    this.update_params(this.SORT_PARAMETER, sort_order);
  }

  set_group_by(group_by: string): void {
    this.group_by = group_by;
    this.update_params(this.GROUP_BY_PARAMETER, this.group_by);
  }

  set_rows(rows: number): void {
    //    this.store.dispatch(new UserActions.UserSetPreference({
    //      name: LIBRARY_ROWS,
    //      value: `${rows}`,
    //    }));
    this.update_params(this.ROWS_PARAMETER, `${rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  save_cover_size(cover_size: number): void {
    //    this.store.dispatch(new UserActions.UserSetPreference({
    //      name: LIBRARY_COVER_SIZE,
    //      value: `${cover_size}`,
    //    }));
    this.update_params(this.COVER_PARAMETER, `${cover_size}`);
  }

  delete_comic(comic: Comic): void {
    this.confirm_service.confirm({
      header: this.translate.instant("library.messages.delete-comic-title"),
      message: this.translate.instant("library.messages.delete-comic-question"),
      icon: "fa fa-exclamation",
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryRemoveComic({ comic: comic })
        );
      }
    });
  }

  open_comic(comic: Comic): void {
    this.router.navigate(["comics", `${comic.id}`]);
  }

  rescan_library(): void {
    this.confirm_service.confirm({
      header: this.translate.instant("library.messages.rescan-library-title"),
      message: this.translate.instant(
        "library.messages.rescan-library-message"
      ),
      icon: "fa fa-exclamation",
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryRescanFiles({
            last_comic_date: this.library.last_comic_date
          })
        );
      }
    });
  }

  can_rescan(): boolean {
    return (
      this.library.library_state.rescan_count === 0 &&
      this.library.library_state.import_count === 0
    );
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activated_route.snapshot.queryParams
    );
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], {
      relativeTo: this.activated_route,
      queryParams: queryParams
    });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }

  private get_parameter(name: string): string {
    const which = this.user.preferences.find((preference: Preference) => {
      return preference.name === name;
    });

    if (which) {
      return which.value;
    } else {
      return null;
    }
  }
}
