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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LibraryModuleState } from 'app/library';
import {
  PUBLISHER_FEATURE_KEY,
  PublisherState
} from 'app/library/reducers/publisher.reducer';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublisherGet } from 'app/library/actions/publisher.actions';
import { Publisher } from 'app/library/models/publisher';
import * as _ from 'lodash';
import { LoggerService } from '@angular-ru/logger';

@Injectable()
export class PublisherAdaptor {
  private _fetchingPublisher$ = new BehaviorSubject<boolean>(false);
  private _noSuchPublisher$ = new BehaviorSubject<boolean>(false);
  private _publisher$ = new BehaviorSubject<Publisher>(null);

  constructor(private logger: LoggerService, private store: Store<LibraryModuleState>) {
    this.store
      .select(PUBLISHER_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: PublisherState) => {
        if (state.fetchingPublisher !== this._fetchingPublisher$.getValue()) {
          this._fetchingPublisher$.next(state.fetchingPublisher);
        }
        if (state.noSuchPublisher !== this._noSuchPublisher$.getValue()) {
          this._noSuchPublisher$.next(state.noSuchPublisher);
        }
        if (!_.isEqual(state.publisher, this._publisher$.getValue())) {
          this._publisher$.next(state.publisher);
        }
      });
  }

  getPublisherByName(name: string) {
    this.logger.debug('action: getting publisher by name:', name);
    this.store.dispatch(new PublisherGet({ name: name }));
  }

  get fetchingPublisher$(): Observable<boolean> {
    return this._fetchingPublisher$.asObservable();
  }

  get noSuchPublisher$(): Observable<boolean> {
    return this._noSuchPublisher$.asObservable();
  }

  get publisher$(): Observable<Publisher> {
    return this._publisher$.asObservable();
  }
}
