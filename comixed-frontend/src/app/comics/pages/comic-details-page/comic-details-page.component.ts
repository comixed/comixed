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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationAdaptor } from 'app/user';
import { Comic } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { MenuItem, MessageService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

export const PAGE_SIZE_PARAMETER = 'pagesize';
export const CURRENT_PAGE_PARAMETER = 'page';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details-page.component.html',
  styleUrls: ['./comic-details-page.component.scss']
})
export class ComicDetailsPageComponent implements OnInit, OnDestroy {
  comicSubscription: Subscription;
  comic: Comic;
  langChangeSubscription: Subscription;

  id = -1;
  characters: string[];
  teams: string[];
  locations: string[];
  storyArcs: string[];

  readonly TAB_PARAMETER = 'tab';

  authSubscription: Subscription;
  isAdmin = false;
  protected currentTab: number;
  protected pageSize: number;
  protected currentPage: number;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private messageService: MessageService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private comicAdaptor: ComicAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = +params['id'];
        this.comicAdaptor.getComicById(+params['id']);
      } else {
        this.router.navigateByUrl('/home');
      }
    });
    activatedRoute.queryParams.subscribe(params => {
      this.currentTab = this.loadParameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnInit() {
    this.authSubscription = this.authenticationAdaptor.role$.subscribe(
      roles => (this.isAdmin = roles.admin)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.comicSubscription = this.comicAdaptor.comic$.subscribe(comic => {
      if (comic) {
        this.comic = comic;
        this.loadTranslations();
        this.characters = comic.characters;
        this.teams = comic.teams;
        this.locations = comic.locations;
        this.storyArcs = comic.storyArcs;

        this.titleService.setTitle(
          this.translateService.instant('comic-details-page.title', {
            id: this.comic.id,
            series: this.comic.series,
            volume: this.comic.volume,
            issue_number: this.comic.issueNumber
          })
        );
      } else {
        this.messageService.add({
          severity: 'error',
          detail: this.translateService.instant(
            'comic-details-page.error.no-such-comic.detail',
            { id: this.id }
          )
        });
        this.router.navigateByUrl('/home');
      }
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.setPageSize(
        parseInt(this.loadParameter(params[PAGE_SIZE_PARAMETER], '100'), 10)
      );
      this.setCurrentPage(
        parseInt(this.loadParameter(params[CURRENT_PAGE_PARAMETER], '0'), 10)
      );
      this.currentTab = this.loadParameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.comicSubscription) {
      this.comicSubscription.unsubscribe();
    }
  }

  setPageSize(page_size: number): void {
    this.pageSize = page_size;
    this.updateParams(PAGE_SIZE_PARAMETER, `${this.pageSize}`);
  }

  setCurrentPage(current_page: number): void {
    this.currentPage = current_page;
    this.updateParams(CURRENT_PAGE_PARAMETER, `${this.currentPage}`);
  }

  setCurrentTab(current_tab: number): void {
    this.currentTab = current_tab;
    this.updateParams(this.TAB_PARAMETER, `${this.currentTab}`);
  }

  hasNextComic(): boolean {
    return this.comic.nextIssueId !== -1;
  }

  hasPreviousComic(): boolean {
    return this.comic.previousIssueId !== -1;
  }

  gotToNextComic(): void {
    this.navigateToComic(this.comic.nextIssueId);
  }

  goToPreviousComic(): void {
    this.navigateToComic(this.comic.previousIssueId);
  }

  private updateParams(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }

  private loadParameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }

  private navigateToComic(id: number): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );

    this.router.navigate(['comics', id], { queryParams: queryParams });
  }

  private loadTranslations() {
    this.loadComicBreadcrumbs();
  }

  private loadComicBreadcrumbs() {
    if (!this.comic) {
      return;
    }

    const entries: MenuItem[] = [
      {
        label: this.translateService.instant('breadcrumb.entry.library-page'),
        routerLink: ['/comics']
      }
    ];

    if (this.comic.publisher) {
      entries.push({
        label: this.translateService.instant(
          'breadcrumb.entry.comic-details-page.publisher',
          { name: this.comic.publisher }
        ),
        routerLink: ['/publishers', this.comic.publisher]
      });
    } else {
      entries.push({ label: '?' });
    }
    if (this.comic.series) {
      entries.push({
        label: this.translateService.instant(
          'breadcrumb.entry.comic-details-page.series',
          { name: this.comic.series }
        ),
        routerLink: ['/series', this.comic.series]
      });
    } else {
      entries.push({ label: '?' });
    }
    if (this.comic.volume) {
      entries.push({
        label: this.translateService.instant(
          'breadcrumb.entry.comic-details-page.volume',
          { volume: this.comic.volume }
        )
      });
    } else {
      entries.push({ label: '?' });
    }
    if (this.comic.issueNumber) {
      entries.push({
        label: this.translateService.instant(
          'breadcrumb.entry.comic-details-page.issue-number',
          { issue: this.comic.issueNumber }
        )
      });
    } else {
      entries.push({ label: '?' });
    }

    this.breadcrumbAdaptor.loadEntries(entries);
  }
}
