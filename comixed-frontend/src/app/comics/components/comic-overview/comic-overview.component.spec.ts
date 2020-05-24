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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { COMIC_1, FORMAT_3, SCAN_TYPE_1 } from 'app/comics/comics.fixtures';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { AppState, LibraryAdaptor } from 'app/library';
import { LoggerModule } from '@angular-ru/logger';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import {
  AutoCompleteModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { ComicOverviewComponent } from './comic-overview.component';
import { BehaviorSubject } from 'rxjs';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { PublisherThumbnailUrlPipe } from 'app/comics/pipes/publisher-thumbnail-url.pipe';
import { PublisherPipe } from 'app/comics/pipes/publisher.pipe';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { SeriesCollectionNamePipe } from 'app/comics/pipes/series-collection-name.pipe';

describe('ComicOverviewComponent', () => {
  const COMIC = Object.assign({}, COMIC_1);

  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;
  let store: Store<AppState>;
  let confirmationService: ConfirmationService;
  let comicAdaptor: ComicAdaptor;
  const publishers = new BehaviorSubject<ComicCollectionEntry[]>([]);
  const series = new BehaviorSubject<ComicCollectionEntry[]>([]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects]),
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        InplaceModule,
        DropdownModule,
        TooltipModule,
        AutoCompleteModule,
        ToolbarModule
      ],
      declarations: [
        ComicOverviewComponent,
        PublisherThumbnailUrlPipe,
        PublisherPipe,
        SeriesCollectionNamePipe
      ],
      providers: [
        ComicAdaptor,
        ConfirmationService,
        MessageService,
        {
          provide: LibraryAdaptor,
          useValue: {
            publishers$: publishers.asObservable(),
            series$: series.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.comic = COMIC;
    component.is_admin = false;
    comicAdaptor = TestBed.get(ComicAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    confirmationService = TestBed.get(ConfirmationService);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subscribes to the available scan types list', () => {
    component.scanTypes = [SCAN_TYPE_1];
    component.loadScanTypeOptions();
    expect(component.scanTypeOptions.length).toEqual(2);
    expect(component.scanTypeOptions[1].value).toEqual(SCAN_TYPE_1);
  });

  it('subscribes to the available format list', () => {
    component.formats = [FORMAT_3];
    component.loadFormatOptions();
    expect(component.formatOptions.length).toEqual(2);
    expect(component.formatOptions[1].value).toEqual(FORMAT_3);
  });

  it('can clean the comic metadata', () => {
    spyOn(comicAdaptor, 'clearMetadata');
    spyOn(
      confirmationService,
      'confirm'
    ).and.callFake((confirm: Confirmation) => confirm.accept());
    component.clearMetadata();
    expect(comicAdaptor.clearMetadata).toHaveBeenCalledWith(COMIC);
  });

  it('can delete a comic', () => {
    spyOn(comicAdaptor, 'deleteComic');
    spyOn(
      confirmationService,
      'confirm'
    ).and.callFake((confirm: Confirmation) => confirm.accept());
    component.deleteComic();
    expect(comicAdaptor.deleteComic).toHaveBeenCalledWith(COMIC);
  });

  describe('undeleting a comic', () => {
    beforeEach(() => {
      spyOn(comicAdaptor, 'restoreComic');
      component.undeleteComic();
    });

    it('fires an action', () => {
      expect(comicAdaptor.restoreComic).toHaveBeenCalledWith(COMIC);
    });
  });

  // this test does not work right now -- needs to be fixed up
  xdescribe('loading the list of publishers and series', () => {
    beforeEach(() => {
      component.publisherNameOptions = [];
      component.seriesNameOptions = [];
      publishers.next([
        {
          name: 'FOO',
          type: CollectionType.SERIES,
          comics: [],
          count: 0,
          last_comic_added: null
        }
      ]);
      series.next([
        {
          name: 'BAR',
          type: CollectionType.SERIES,
          comics: [],
          count: 0,
          last_comic_added: null
        }
      ]);
    });

    it('loads the list of publisher names', () => {
      expect(component.publisherNameOptions).not.toEqual([]);
    });

    it('loads the lit of series names', () => {
      expect(component.seriesNameOptions).not.toEqual([]);
    });
  });

  describe('starting to edit the comic details', () => {
    beforeEach(() => {
      component.editing = false;
      component.comicBackup = null;
      component.startEditing();
    });

    it('sets the editing flag', () => {
      expect(component.editing).toBeTruthy();
    });

    it('makes a backup of the comic', () => {
      expect(component.comicBackup).toEqual(component.comic);
    });
  });

  describe('undoing changes made', () => {
    beforeEach(() => {
      component.editing = true;
      component.comicBackup = COMIC;
      component.comic = null;
      component.undoChanges();
    });

    it('clears the editing flag', () => {
      expect(component.editing).toBeFalsy();
    });

    it('restores the comic state', () => {
      expect(component.comic).toEqual(component.comicBackup);
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      component.editing = true;
      spyOn(
        confirmationService,
        'confirm'
      ).and.callFake((confirm: Confirmation) => confirm.accept());
      spyOn(comicAdaptor, 'saveComic');
      component.saveChanges();
    });

    it('notifies the comic adaptor', () => {
      expect(comicAdaptor.saveComic).toHaveBeenCalledWith(COMIC);
    });

    it('clears the editing flag', () => {
      expect(component.editing).toBeFalsy();
    });
  });

  describe('filtering publishers', () => {
    const PUBLISHER_NAMES = ['One', 'Two', 'three', 'Four', 'five'];
    const QUERY = 't';

    beforeEach(() => {
      component.publisherNameOptions = [];
      component.publishersNames = PUBLISHER_NAMES;
      component.filterPublisherNames(QUERY);
    });

    it('filters the publisher names', () => {
      expect(component.publisherNameOptions).toEqual(
        PUBLISHER_NAMES.filter(name => name.toLowerCase().startsWith(QUERY))
      );
    });
  });

  describe('filtering series', () => {
    const SERIES_NAMES = ['One', 'Two', 'three', 'Four', 'five'];
    const QUERY = 't';

    beforeEach(() => {
      component.seriesNameOptions = [];
      component.seriesNames = SERIES_NAMES;
      component.filterSeriesNames(QUERY);
    });

    it('filters the series names', () => {
      expect(component.seriesNameOptions).toEqual(
        SERIES_NAMES.filter(name => name.toLowerCase().startsWith(QUERY))
      );
    });
  });
});
