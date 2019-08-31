/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/backend-status';
import {
  BUILD_DETAILS_FEATURE_KEY,
  BuildDetailsState
} from 'app/backend-status/reducers/build-details.reducer';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { BuildDetails } from 'app/backend-status/models/build-details';
import * as _ from 'lodash';
import { BuildDetailsGet } from 'app/backend-status/actions/build-details.actions';

@Injectable()
export class BuildDetailsAdaptor {
  _build_detail$ = new BehaviorSubject<BuildDetails>(null);
  _updated = new BehaviorSubject<Date>(new Date());

  constructor(private store: Store<AppState>) {
    this.store
      .select(BUILD_DETAILS_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: BuildDetailsState) => {
        if (!_.isEqual(this._build_detail$.getValue(), state.details)) {
          this._build_detail$.next(state.details);
        }

        this._updated.next(new Date());
      });
  }

  get build_detail$(): Observable<BuildDetails> {
    return this._build_detail$.asObservable();
  }

  get_build_details() {
    this.store.dispatch(new BuildDetailsGet());
  }
}
