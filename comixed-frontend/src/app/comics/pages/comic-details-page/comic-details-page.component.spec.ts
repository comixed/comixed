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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { AppState } from 'app/comics';
import { ComicGotIssue } from 'app/comics/actions/comic.actions';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { routes } from 'app/comics/comics-routing.module';
import { COMIC_1 } from 'app/comics/comics.fixtures';
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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import {
  ProgressBarModule,
  SplitButtonModule,
  ToolbarModule
} from 'primeng/primeng';
import { ComicDetailsPageComponent } from './comic-details-page.component';

describe('ComicDetailsPageComponent', () => {
  let component: ComicDetailsPageComponent;
  let fixture: ComponentFixture<ComicDetailsPageComponent>;
  let downloadLink: DebugElement;
  let comicAdaptor: ComicAdaptor;
  let messageService: MessageService;
  let router: Router;
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
        LoggerTestingModule,
        RouterTestingModule.withRoutes(routes),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects]),
        CardModule,
        DropdownModule,
        InplaceModule,
        DataViewModule,
        BlockUIModule,
        ProgressBarModule,
        SplitButtonModule,
        ToolbarModule
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
        ComicTitlePipe,
        ComicCoverUrlPipe,
        ComicDownloadLinkPipe,
        ComicPageUrlPipe,
        ScrapingIssueTitlePipe,
        ScrapingIssueCoverUrlPipe
      ],
      providers: [
        ComicAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsPageComponent);
    component = fixture.componentInstance;
    comicAdaptor = TestBed.get(ComicAdaptor);
    router = TestBed.get(Router);
    messageService = TestBed.get(MessageService);
    store = TestBed.get(Store);

    store.dispatch(new ComicGotIssue({ comic: COMIC_1 }));

    fixture.detectChanges();

    downloadLink = fixture.debugElement.query(By.css('#cx-download-link'));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('download link', () => {
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
