/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BehaviorSubject } from 'rxjs';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_COVER_MONTH,
  QUERY_PARAM_COVER_YEAR,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE,
  QUERY_PARAM_PAGES_AS_GRID,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION,
  QUERY_PARAM_TAB
} from '@app/core';
import { SortDirection } from '@angular/material/sort';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { archiveTypeFromString } from '@app/comic-books/archive-type.functions';

@Injectable({
  providedIn: 'root'
})
export class QueryParameterService {
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize$ = new BehaviorSubject<number>(PAGE_SIZE_DEFAULT);
  pageIndex$ = new BehaviorSubject<number>(0);
  sortBy$ = new BehaviorSubject<string>(null);
  sortDirection$ = new BehaviorSubject<SortDirection>('');
  currentTab$ = new BehaviorSubject<number>(0);
  coverYear$ = new BehaviorSubject<CoverDateFilter>({
    year: null,
    month: null
  });
  archiveType$ = new BehaviorSubject<ArchiveType>(null);
  pagesAsGrid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.logger.trace('Subscribing to query parameter updates');
    this.activatedRoute.queryParams.subscribe(params => {
      const pageSize = +params[QUERY_PARAM_PAGE_SIZE] || PAGE_SIZE_DEFAULT;
      this.logger.debug('Using parameter for page size:', pageSize);
      this.pageSize$.next(pageSize);

      const pageIndex = +params[QUERY_PARAM_PAGE_INDEX] || 0;
      this.logger.debug('Using parameter for page index:', pageIndex);
      this.pageIndex$.next(pageIndex);

      const sortBy = params[QUERY_PARAM_SORT_BY];
      this.logger.debug('Using parameter for sort field:', sortBy);
      this.sortBy$.next(sortBy);

      const sortDirection = params[QUERY_PARAM_SORT_DIRECTION];
      this.logger.debug('Using parameter for sort direction:', sortDirection);
      this.sortDirection$.next(sortDirection);

      const currentTab = +params[QUERY_PARAM_TAB] || 0;
      this.logger.debug('Using parameter for current tab:', currentTab);
      this.currentTab$.next(currentTab);

      const coverYearFilter = {
        year: +params[QUERY_PARAM_COVER_YEAR] || null,
        month: +params[QUERY_PARAM_COVER_MONTH] || null
      } as CoverDateFilter;
      this.logger.debug('Using parameter for cover year:', coverYearFilter);
      this.coverYear$.next(coverYearFilter);

      const archiveType = params[QUERY_PARAM_ARCHIVE_TYPE] || null;
      this.logger.debug('Using parameter for archive type:', archiveType);
      this.archiveType$.next(archiveTypeFromString(archiveType));

      const pagesAsGrid = params[QUERY_PARAM_PAGES_AS_GRID] === `${true}`;
      this.logger.debug('Using parameter for pages as grid:', pagesAsGrid);
      this.pagesAsGrid$.next(pagesAsGrid);
    });
  }

  onPageChange(
    pageSize: number,
    pageIndex: number,
    previousPageIndex: number
  ): void {
    if (this.pageSize$.getValue() !== pageSize) {
      this.logger.debug('Page size changed:', pageSize);
      this.updateQueryParam([
        { name: QUERY_PARAM_PAGE_SIZE, value: `${pageSize}` }
      ]);
    }
    if (pageIndex !== previousPageIndex) {
      this.logger.debug('Page index changed:', pageIndex);
      this.updateQueryParam([
        {
          name: QUERY_PARAM_PAGE_INDEX,
          value: `${pageIndex}`
        }
      ]);
    }
  }

  onSortChange(active: string, direction: SortDirection): void {
    this.logger.debug('Changing sort:', active, direction);
    this.updateQueryParam([
      {
        name: QUERY_PARAM_SORT_BY,
        value: active
      },
      {
        name: QUERY_PARAM_SORT_DIRECTION,
        value: direction
      }
    ]);
  }

  onTabChange(tab: number): void {
    this.logger.debug('Changing current tab:', tab);
    this.updateQueryParam([{ name: QUERY_PARAM_TAB, value: `${tab}` }]);
  }

  onCoverMonthChanged(month: number): void {
    this.logger.debug('Setting cover month filter:', month);
    this.updateQueryParam([
      {
        name: QUERY_PARAM_COVER_MONTH,
        value: !!month ? `${month}` : null
      }
    ]);
  }

  onCoverYearChanged(year: number): void {
    this.logger.debug('Setting cover year filter:', year);
    this.updateQueryParam([
      {
        name: QUERY_PARAM_COVER_YEAR,
        value: !!year ? `${year}` : null
      }
    ]);
  }

  onTogglePagesAsGrid(): void {
    const showPagesAsGrid = this.pagesAsGrid$.getValue() === false;
    this.logger.debug('Setting show pages as grid:', showPagesAsGrid);
    this.updateQueryParam([
      { name: QUERY_PARAM_PAGES_AS_GRID, value: `${showPagesAsGrid}` }
    ]);
  }

  onArchiveTypeChanged(archiveType: ArchiveType): void {
    this.logger.debug('Setting archive type filter:', archiveType);
    this.updateQueryParam([
      { name: QUERY_PARAM_ARCHIVE_TYPE, value: archiveType }
    ]);
  }

  private updateQueryParam(params: { name: string; value: string }[]): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    params.forEach(entry => (queryParams[entry.name] = entry.value));
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams
    });
  }
}
