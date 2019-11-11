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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LibraryPageComponent } from 'app/library/pages/library-page/library-page.component';
import { AdminGuard, ReaderGuard } from 'app/user';
import { PublishersPageComponent } from 'app/library/pages/publishers-page/publishers-page.component';
import { PublisherDetailsPageComponent } from 'app/library/pages/publisher-details-page/publisher-details-page.component';
import { SeriesPageComponent } from 'app/library/pages/series-page/series-page.component';
import { SeriesDetailsPageComponent } from 'app/library/pages/series-details-page/series-details-page.component';
import { CharactersPageComponent } from 'app/library/pages/characters-page/characters-page.component';
import { CharacterDetailsPageComponent } from 'app/library/pages/character-details-page/character-details-page.component';
import { TeamsPageComponent } from 'app/library/pages/teams-page/teams-page.component';
import { TeamDetailsPageComponent } from 'app/library/pages/team-details-page/team-details-page.component';
import { LocationsPageComponent } from 'app/library/pages/locations-page/locations-page.component';
import { LocationDetailsPageComponent } from 'app/library/pages/location-details-page/location-details-page.component';
import { StoryArcsPageComponent } from 'app/library/pages/story-arcs-page/story-arcs-page.component';
import { StoryArcDetailsPageComponent } from 'app/library/pages/story-arc-details-page/story-arc-details-page.component';
import { MissingComicsPageComponent } from 'app/library/pages/missing-comics-page/missing-comics-page.component';
import { MultiComicScrapingPageComponent } from 'app/library/pages/multi-comic-scraping-page/multi-comic-scraping-page.component';
import { ReadingListPageComponent } from 'app/library/pages/reading-list-page/reading-list-page.component';
import { ReadingListsPageComponent } from 'app/library/pages/reading-lists-page/reading-lists-page.component';
import { DuplicatesPageComponent } from 'app/library/pages/duplicates-page/duplicates-page.component';

const routes: Routes = [
  {
    path: 'comics',
    component: LibraryPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'publishers',
    component: PublishersPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'publishers/:name',
    component: PublisherDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'series',
    component: SeriesPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'series/:name',
    component: SeriesDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'characters',
    component: CharactersPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'characters/:name',
    component: CharacterDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'teams',
    component: TeamsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'teams/:name',
    component: TeamDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'locations',
    component: LocationsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'locations/:name',
    component: LocationDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'stories',
    component: StoryArcsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'stories/:name',
    component: StoryArcDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'comics/missing',
    component: MissingComicsPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'scraping',
    component: MultiComicScrapingPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'lists/new',
    component: ReadingListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'lists/:id',
    component: ReadingListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'lists',
    component: ReadingListsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'duplicates',
    component: DuplicatesPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LibraryRoutingModule {}
