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
import { LoggerService } from '@angular-ru/logger';
import { LibraryAdaptor, ReadingListAdaptor } from 'app/library';
import { TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { NavigationDataPayload } from 'app/library/models/navigation-data-payload';
import { ReadingList } from 'app/library/models/reading-list/reading-list';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { Router } from '@angular/router';

const PUBLISHER_NODE = 0;
const SERIES_NODE = 1;
const CHARACTER_NODE = 2;
const TEAM_NODE = 3;
const LOCATION_NODE = 4;
const STORY_NODE = 5;
const READING_LISTS = 6;

const LABEL_KEYS = [
  'publishers',
  'series',
  'characters',
  'teams',
  'locations',
  'stories',
  'reading-lists'
];

@Component({
  selector: 'app-library-navigation-tree',
  templateUrl: './library-navigation-tree.component.html',
  styleUrls: ['./library-navigation-tree.component.scss']
})
export class LibraryNavigationTreeComponent implements OnInit, OnDestroy {
  private comicSubscription: Subscription;
  private publisherSubscription: Subscription;
  private seriesSubscription: Subscription;
  private characterSubscription: Subscription;
  private teamSubscription: Subscription;
  private locationSubscription: Subscription;
  private storiesSubscription: Subscription;
  private readingListSubscription: Subscription;

  nodes: TreeNode[];
  treeFilter = '';

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private readingListAdaptor: ReadingListAdaptor,
    private router: Router
  ) {
    this.nodes = [
      {
        // all comics
        label: '',
        icon: 'pi pi-folder',
        selectable: true,
        children: [
          {
            // publishers
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // series
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // characters
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // teams
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // locations
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // stories
            label: '',
            icon: 'pi pi-folder'
          } as TreeNode,
          {
            // reading lists
            label: this.translateService.instant(
              'library-navigation-tree.label.reading-lists',
              { count: 0 }
            ),
            icon: 'pi pi-folder',
            selectable: false
          } as TreeNode
        ]
      } as TreeNode
    ];
    this.comicSubscription = this.libraryAdaptor.comic$.subscribe(
      comics =>
        (this.nodes[0] = {
          ...this.nodes[0],
          label: this.translateService.instant(
            'library-navigation-tree.label.all-comics',
            { count: comics.length }
          ),
          data: {
            type: CollectionType.ALL_COMICS,
            name: null
          } as NavigationDataPayload,
          children: this.nodes[0].children
        })
    );
    this.publisherSubscription = this.libraryAdaptor.publishers$.subscribe(
      publishers =>
        this.createChildNodes(
          CollectionType.PUBLISHERS,
          PUBLISHER_NODE,
          publishers
        )
    );
    this.seriesSubscription = this.libraryAdaptor.series$.subscribe(series =>
      this.createChildNodes(CollectionType.SERIES, SERIES_NODE, series)
    );
    this.characterSubscription = this.libraryAdaptor.characters$.subscribe(
      characters =>
        this.createChildNodes(
          CollectionType.CHARACTERS,
          CHARACTER_NODE,
          characters
        )
    );
    this.teamSubscription = this.libraryAdaptor.teams$.subscribe(teams =>
      this.createChildNodes(CollectionType.TEAMS, TEAM_NODE, teams)
    );
    this.locationSubscription = this.libraryAdaptor.locations$.subscribe(
      locations =>
        this.createChildNodes(
          CollectionType.LOCATIONS,
          LOCATION_NODE,
          locations
        )
    );
    this.storiesSubscription = this.libraryAdaptor.stories$.subscribe(stories =>
      this.createChildNodes(CollectionType.STORIES, STORY_NODE, stories)
    );
    this.readingListSubscription = this.readingListAdaptor.reading_list$.subscribe(
      lists => this.loadReadingLists(lists)
    );
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.publisherSubscription.unsubscribe();
    this.seriesSubscription.unsubscribe();
    this.characterSubscription.unsubscribe();
    this.teamSubscription.unsubscribe();
    this.locationSubscription.unsubscribe();
    this.storiesSubscription.unsubscribe();
  }

  private createChildNodes(
    type: CollectionType,
    index: number,
    collection: ComicCollectionEntry[]
  ): void {
    this.nodes[0].children[index] = {
      ...this.nodes[0].children[index],
      label: this.translateService.instant(
        `library-navigation-tree.label.${LABEL_KEYS[index]}`,
        {
          count: collection.length
        }
      ),
      selectable: false,
      children: collection.map(entry => {
        let entryName = entry.name;
        if (!entryName || entryName.length === 0) {
          entryName = this.translateService.instant(
            'library-navigation-tree.label.unnamed-entry'
          );
        }
        const title = this.translateService.instant(
          'library-navigation-tree.label.leaf-entry',
          {
            name: entryName,
            count: entry.count
          }
        );
        return {
          label: title,
          key: entry.name || 'unnammed',
          data: {
            type: type,
            name: entryName
          } as NavigationDataPayload,
          icon: 'pi pi-list',
          expanded: this.nodes[0].children[index].expanded
        } as TreeNode;
      })
    } as TreeNode;
  }

  showSelectedCollection(node: TreeNode) {
    const nodeData = node.data as NavigationDataPayload;
    switch (nodeData.type) {
      case CollectionType.PUBLISHERS:
      case CollectionType.SERIES:
      case CollectionType.CHARACTERS:
      case CollectionType.TEAMS:
      case CollectionType.LOCATIONS:
      case CollectionType.STORIES:
        this.router.navigate(['comics', nodeData.type, nodeData.name]);
        break;
    }
  }

  private loadReadingLists(lists: ReadingList[]) {
    this.nodes[0].children[READING_LISTS] = {
      label: this.translateService.instant(
        'library-navigation-tree.label.reading-lists',
        { count: lists.length }
      ),
      children: lists.map(list => {
        return {
          label: this.translateService.instant(
            'library-navigation-tree.label.reading-list',
            {
              name: list.name,
              count: list.entries.length
            }
          ),
          key: list.name,
          data: {
            type: CollectionType.READING_LISTS,
            name: list.name
          } as NavigationDataPayload,
          icon: 'pi pi-list',
          expanded: false,
          selectable: list.entries.length > 0
        } as TreeNode;
      })
    } as TreeNode;
  }
}
