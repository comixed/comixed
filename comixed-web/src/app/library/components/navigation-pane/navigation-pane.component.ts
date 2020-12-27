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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import {
  selectCharacters,
  selectLocations,
  selectPublishers,
  selectSeries,
  selectStories,
  selectTeams
} from '@app/library/selectors/library.selectors';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { NavigationTreeNode } from '@app/library/models/ui/navigation-tree-node';

@Component({
  selector: 'cx-navigation-pane',
  templateUrl: './navigation-pane.component.html',
  styleUrls: ['./navigation-pane.component.scss']
})
export class NavigationPaneComponent implements OnInit, OnDestroy {
  publisherSubscription: Subscription;
  seriesSubscription: Subscription;
  characterSubscription: Subscription;
  teamSubscription: Subscription;
  locationSubscription: Subscription;
  storySubscription: Subscription;
  treeControl = new NestedTreeControl<NavigationTreeNode>(
    node => node.children
  );
  dataSource = new MatTreeNestedDataSource<NavigationTreeNode>();

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.publisherSubscription = this.store
      .select(selectPublishers)
      .subscribe(publishers => (this.publishers = publishers));
    this.seriesSubscription = this.store
      .select(selectSeries)
      .subscribe(series => (this.series = series));
    this.characterSubscription = this.store
      .select(selectCharacters)
      .subscribe(characters => (this.characters = characters));
    this.teamSubscription = this.store
      .select(selectTeams)
      .subscribe(teams => (this.teams = teams));
    this.locationSubscription = this.store
      .select(selectLocations)
      .subscribe(locations => (this.locations = locations));
    this.storySubscription = this.store
      .select(selectStories)
      .subscribe(stories => (this.stories = stories));
  }

  private _series: string[] = [];

  get series(): string[] {
    return this._series;
  }

  set series(series: string[]) {
    this._series = series;
    this.loadTreeData();
  }

  private _characters: string[] = [];

  get characters(): string[] {
    return this._characters;
  }

  set characters(characters: string[]) {
    this._characters = characters;
    this.loadTreeData();
  }

  private _teams: string[] = [];

  get teams(): string[] {
    return this._teams;
  }

  set teams(teams: string[]) {
    this._teams = teams;
    this.loadTreeData();
  }

  private _locations: string[] = [];

  get locations(): string[] {
    return this._locations;
  }

  set locations(locations: string[]) {
    this._locations = locations;
    this.loadTreeData();
  }

  private _stories: string[] = [];

  get stories(): string[] {
    return this._stories;
  }

  set stories(stories: string[]) {
    this._stories = stories;
    this.loadTreeData();
  }

  private _publishers: string[] = [];

  get publishers(): string[] {
    return this._publishers;
  }

  set publishers(publishers: string[]) {
    this._publishers = publishers;
    this.loadTreeData();
  }

  hasChild = (_: number, node: NavigationTreeNode) => !!node.children;

  ngOnInit(): void {
    this.loadTreeData();
  }

  ngOnDestroy(): void {
    this.publisherSubscription.unsubscribe();
    this.seriesSubscription.unsubscribe();
    this.characterSubscription.unsubscribe();
    this.teamSubscription.unsubscribe();
    this.locationSubscription.unsubscribe();
    this.storySubscription.unsubscribe();
  }

  private loadTreeData(): void {
    this.logger.trace('Reloading navigation tree data');
    this.dataSource.data = [
      {
        label: 'library.navigation.publishers',
        childCount: this.publishers.length,
        children: this.publishers.map(publisher => {
          return { label: publisher } as NavigationTreeNode;
        })
      },
      {
        label: 'library.navigation.series',
        childCount: this.series.length,
        children: this.series.map(series => {
          return { label: series } as NavigationTreeNode;
        })
      },
      {
        label: 'library.navigation.characters',
        childCount: this.characters.length,
        children: this.characters.map(character => {
          return { label: character } as NavigationTreeNode;
        })
      },
      {
        label: 'library.navigation.teams',
        childCount: this.teams.length,
        children: this.teams.map(team => {
          return { label: team } as NavigationTreeNode;
        })
      },
      {
        label: 'library.navigation.locations',
        childCount: this.locations.length,
        children: this.locations.map(location => {
          return { label: location } as NavigationTreeNode;
        })
      },
      {
        label: 'library.navigation.stories',
        childCount: this.stories.length,
        children: this.stories.map(story => {
          return { label: story } as NavigationTreeNode;
        })
      }
    ];
  }
}
