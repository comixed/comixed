/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { PublisherListComponent } from '@app/dashboard/components/publisher-list/publisher-list.component';
import { User } from '@app/user/models/user';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { SeriesListComponent } from '@app/dashboard/components/series-list/series-list.component';
import { CharacterListComponent } from '@app/dashboard/components/character-list/character-list.component';
import { TeamListComponent } from '@app/dashboard/components/team-list/team-list.component';
import { LocationListComponent } from '@app/dashboard/components/location-list/location-list.component';
import { StoryListComponent } from '@app/dashboard/components/story-list/story-list.component';
import { StateListComponent } from '@app/dashboard/components/state-list/state-list.component';

@Component({
  selector: 'cx-home',
  imports: [
    PublisherListComponent,
    SeriesListComponent,
    CharacterListComponent,
    TeamListComponent,
    LocationListComponent,
    StoryListComponent,
    StateListComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  store = inject(Store);
  libraryState: LibraryState | null;
  user: User;
  rows = PAGE_SIZE_DEFAULT;

  constructor() {
    this.store.select(selectLibraryState).subscribe(state => {
      this.libraryState = state;
    });
    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      this.rows = parseInt(
        getUserPreference(
          user.preferences,
          PREFERENCE_PAGE_SIZE,
          `${PAGE_SIZE_DEFAULT}`
        ),
        10
      );
    });
  }
}
