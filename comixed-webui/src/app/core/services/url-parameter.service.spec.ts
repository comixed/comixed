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

import { TestBed } from '@angular/core/testing';
import { UrlParameterService } from './url-parameter.service';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('UrlParameterService', () => {
  let service: UrlParameterService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        }
      ]
    });

    service = TestBed.inject(UrlParameterService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updating the query parameters', () => {
    beforeEach(() => {
      service.updateQueryParam([
        { name: 'parameter.net', value: 'parameter.value' }
      ]);
    });

    it('redirects the browser', () => {
      expect(router.navigateByUrl).toHaveBeenCalled();
    });
  });
});
