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
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { AppState } from 'app/comics';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicCreditsComponent } from 'app/comics/components/comic-credits/comic-credits.component';
import { ComicDetailsEditorComponent } from 'app/comics/components/comic-details-editor/comic-details-editor.component';
import { ComicGroupingCardComponent } from 'app/comics/components/comic-grouping-card/comic-grouping-card.component';
import { ComicOverviewComponent } from 'app/comics/components/comic-overview/comic-overview.component';
import { ComicPagesComponent } from 'app/comics/components/comic-pages/comic-pages.component';
import { ComicStoryComponent } from 'app/comics/components/comic-story/comic-story.component';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicDownloadLinkPipe } from 'app/comics/pipes/comic-download-link.pipe';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ScrapingIssueCoverUrlPipe } from 'app/comics/pipes/scraping-issue-cover-url.pipe';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { UserModule } from 'app/user/user.module';
import { LoggerModule } from '@angular-ru/logger';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import {
  AutoCompleteModule,
  DialogModule,
  ProgressBarModule,
  ScrollPanelModule,
  SplitButtonModule,
  ToolbarModule
} from 'primeng/primeng';
import { ComicDetailsPageComponent } from './comic-details-page.component';
import { LibraryAdaptor } from 'app/library';
import { BehaviorSubject } from 'rxjs';
import { COMIC_2 } from 'app/comics/comics.fixtures';
import {
  ComicGetIssueFailed,
  ComicGotIssue
} from 'app/comics/actions/comic.actions';
import { PublisherThumbnailUrlPipe } from 'app/comics/pipes/publisher-thumbnail-url.pipe';
import { PublisherPipe } from 'app/comics/pipes/publisher.pipe';
import { SeriesCollectionNamePipe } from 'app/comics/pipes/series-collection-name.pipe';
import { FileEntryListComponent } from 'app/comics/components/file-entry-list/file-entry-list.component';
import { TableModule } from 'primeng/table';
import * as fromScrapingVolumes from 'app/comics/reducers/scraping-volumes.reducer';
import { SCRAPING_VOLUMES_FEATURE_KEY } from 'app/comics/reducers/scraping-volumes.reducer';
import * as fromScrapingIssue from 'app/comics/reducers/scraping-issue.reducer';
import { SCRAPING_ISSUE_FEATURE_KEY } from 'app/comics/reducers/scraping-issue.reducer';
import * as fromScrapeComic from 'app/comics/reducers/scrape-comic.reducer';
import { SCRAPE_COMIC_FEATURE_KEY } from 'app/comics/reducers/scrape-comic.reducer';
import { ScrapingVolumesEffects } from 'app/comics/effects/scraping-volumes.effects';
import { ScrapingIssueEffects } from 'app/comics/effects/scraping-issue.effects';
import { ScrapeComicEffects } from 'app/comics/effects/scrape-comic.effects';

describe('ComicDetailsPageComponent', () => {
  const COMIC = COMIC_2;

  let component: ComicDetailsPageComponent;
  let fixture: ComponentFixture<ComicDetailsPageComponent>;
  let comicAdaptor: ComicAdaptor;
  let messageService: MessageService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        StoreModule.forFeature(
          SCRAPING_VOLUMES_FEATURE_KEY,
          fromScrapingVolumes.reducer
        ),
        StoreModule.forFeature(
          SCRAPING_ISSUE_FEATURE_KEY,
          fromScrapingIssue.reducer
        ),
        StoreModule.forFeature(
          SCRAPE_COMIC_FEATURE_KEY,
          fromScrapeComic.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([
          ComicEffects,
          ScrapingVolumesEffects,
          ScrapingIssueEffects,
          ScrapeComicEffects
        ]),
        CardModule,
        DropdownModule,
        InplaceModule,
        DataViewModule,
        BlockUIModule,
        ProgressBarModule,
        SplitButtonModule,
        ToolbarModule,
        AutoCompleteModule,
        DialogModule,
        ScrollPanelModule,
        TableModule
      ],
      declarations: [
        ComicDetailsPageComponent,
        ComicOverviewComponent,
        ComicStoryComponent,
        ComicCreditsComponent,
        ComicPagesComponent,
        ComicDetailsEditorComponent,
        ComicGroupingCardComponent,
        VolumeListComponent,
        FileEntryListComponent,
        ComicTitlePipe,
        ComicCoverUrlPipe,
        ComicDownloadLinkPipe,
        ComicPageUrlPipe,
        ScrapingIssueTitlePipe,
        ScrapingIssueCoverUrlPipe,
        PublisherThumbnailUrlPipe,
        PublisherPipe,
        SeriesCollectionNamePipe
      ],
      providers: [
        ComicAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ConfirmationService,
        LibraryAdaptor,
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({}),
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {
              queryParams: new BehaviorSubject<{}>({})
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsPageComponent);
    component = fixture.componentInstance;
    comicAdaptor = TestBed.get(ComicAdaptor);
    router = TestBed.get(Router);
    activatedRoute = TestBed.get(ActivatedRoute);
    messageService = TestBed.get(MessageService);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comic from the id provided', () => {
    beforeEach(() => {
      component.id = -1;
      spyOn(comicAdaptor, 'getComicById');
      (activatedRoute.params as BehaviorSubject<{}>).next({
        id: `${COMIC.id}`
      });
    });

    it('sets the id', () => {
      expect(component.id).toEqual(COMIC.id);
    });

    it('fetches the comic', () => {
      expect(comicAdaptor.getComicById).toHaveBeenCalledWith(COMIC.id);
    });

    describe('when the id is invalid', () => {
      beforeEach(() => {
        spyOn(router, 'navigateByUrl');
        store.dispatch(new ComicGetIssueFailed());
      });

      it('redirects the browser', () => {
        expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
      });
    });
  });

  describe('download link', () => {
    let downloadLink: DebugElement;

    beforeEach(() => {
      store.dispatch(new ComicGotIssue({ comic: COMIC }));
      fixture.detectChanges();
      downloadLink = fixture.debugElement.query(By.css('#cx-download-link'));
    });

    it('contains a link', () => {
      expect(downloadLink).toBeTruthy();
    });

    it('the link text is accurate', () => {
      expect(downloadLink.nativeElement.innerText).toEqual(
        'comic-details-page.text.download-link'
      );
    });
  });
});
