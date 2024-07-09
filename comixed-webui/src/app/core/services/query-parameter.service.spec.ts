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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { QueryParameterService } from './query-parameter.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterModule
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_COMIC_TYPE,
  QUERY_PARAM_COVER_MONTH,
  QUERY_PARAM_COVER_YEAR,
  QUERY_PARAM_FILTER_TEXT,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE,
  QUERY_PARAM_PAGES_AS_GRID,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION,
  QUERY_PARAM_TAB
} from '@app/core';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';

describe('QueryParameterService', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 0;
  const PREVIOUS_PAGE_INDEX = 1;

  let service: QueryParameterService;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let routerNavigateSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {
              queryParams: {}
            } as ActivatedRouteSnapshot
          }
        }
      ]
    });

    service = TestBed.inject(QueryParameterService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    routerNavigateSpy = spyOn(router, 'navigate');
    routerNavigateSpy = spyOn(router, 'navigateByUrl');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when the page size changes', () => {
    beforeEach(() => {
      service.pageSize$.next(PAGE_SIZE - 1);
      service.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { [QUERY_PARAM_PAGE_SIZE]: `${PAGE_SIZE}` }
      });
    });
  });

  describe('when the page index changes', () => {
    beforeEach(() => {
      service.pageSize$.next(PAGE_SIZE);
      service.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX - 1);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { [QUERY_PARAM_PAGE_INDEX]: `${PAGE_INDEX}` }
      });
    });
  });

  describe('when the sorting changes', () => {
    const SORT_FIELD = 'name';
    const SORT_DIRECTION = 'asc';

    beforeEach(() => {
      service.onSortChange(SORT_FIELD, SORT_DIRECTION);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          [QUERY_PARAM_SORT_BY]: SORT_FIELD,
          [QUERY_PARAM_SORT_DIRECTION]: SORT_DIRECTION
        }
      });
    });
  });

  describe('when the tab changes', () => {
    const TAB = 3;

    beforeEach(() => {
      service.onTabChange(TAB);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          [QUERY_PARAM_TAB]: `${TAB}`
        }
      });
    });
  });

  describe('when the cover month changes', () => {
    const MONTH = Math.round(Math.random() * 12.0) + 1;

    beforeEach(() => {
      service.onCoverMonthChanged(MONTH);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          [QUERY_PARAM_COVER_MONTH]: `${MONTH}`
        }
      });
    });

    describe('when the cover month is cleared', () => {
      beforeEach(() => {
        routerNavigateSpy.calls.reset();
        service.onCoverMonthChanged(null);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_COVER_MONTH]: null
          }
        });
      });
    });
  });

  describe('when the cover year changes', () => {
    const YEAR = Math.round(Math.random() * 70.0) + 1950;

    beforeEach(() => {
      service.onCoverYearChanged(YEAR);
    });

    it('updates the URL', () => {
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          [QUERY_PARAM_COVER_YEAR]: `${YEAR}`
        }
      });
    });

    describe('when the cover year is cleared', () => {
      beforeEach(() => {
        routerNavigateSpy.calls.reset();
        service.onCoverYearChanged(null);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_COVER_YEAR]: null
          }
        });
      });
    });
  });

  describe('setting the filter text', () => {
    const FILTER_TEXT = 'Farkle';

    describe('when it is set', () => {
      beforeEach(() => {
        service.onFilterTextChanged(FILTER_TEXT);
      });

      it(
        'updates the URL',
        waitForAsync(() => {
          setTimeout(function () {
            expect(router.navigate).toHaveBeenCalledWith([], {
              relativeTo: activatedRoute,
              queryParams: { [QUERY_PARAM_FILTER_TEXT]: FILTER_TEXT }
            });
          }, 1000);
        })
      );
    });
  });

  describe('clearing the filter text', () => {
    describe('when it is set', () => {
      beforeEach(() => {
        service.onFilterTextChanged('');
      });

      it(
        'updates the URL',
        waitForAsync(() => {
          setTimeout(function () {
            expect(router.navigate).toHaveBeenCalledWith([], {
              relativeTo: activatedRoute,
              queryParams: { [QUERY_PARAM_FILTER_TEXT]: null }
            });
          }, 1000);
        })
      );
    });
  });

  describe('toggling show pages are a grid', () => {
    describe('toggling it on', () => {
      beforeEach(() => {
        service.pagesAsGrid$.next(false);
        service.onTogglePagesAsGrid();
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_PAGES_AS_GRID]: `${true}`
          }
        });
      });
    });

    describe('toggling it off', () => {
      beforeEach(() => {
        service.pagesAsGrid$.next(true);
        service.onTogglePagesAsGrid();
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_PAGES_AS_GRID]: `${false}`
          }
        });
      });
    });
  });

  describe('when the archive type changes', () => {
    describe('when set', () => {
      const ARCHIVE_TYPE = ArchiveType.CBR;

      beforeEach(() => {
        service.onArchiveTypeChanged(ARCHIVE_TYPE);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_ARCHIVE_TYPE]: ARCHIVE_TYPE
          }
        });
      });
    });

    describe('when cleared', () => {
      beforeEach(() => {
        service.onArchiveTypeChanged(null);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_ARCHIVE_TYPE]: null
          }
        });
      });
    });
  });

  describe('when the comic type changes', () => {
    describe('when set', () => {
      const COMIC_TYPE = ComicType.ISSUE;

      beforeEach(() => {
        service.onComicTypeChanged(COMIC_TYPE);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_COMIC_TYPE]: COMIC_TYPE
          }
        });
      });
    });

    describe('when cleared', () => {
      beforeEach(() => {
        service.onComicTypeChanged(null);
      });

      it('updates the URL', () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            [QUERY_PARAM_COMIC_TYPE]: null
          }
        });
      });
    });
  });
});
