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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { CollectionAdaptor } from 'app/library/adaptors/collection.adaptor';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { CollectionEffects } from 'app/library/effects/collection.effects';
import { CollectionType } from 'app/library/models/collection-type.enum';
import {
  COLLECTION_FEATURE_KEY,
  reducer
} from 'app/library/reducers/collection.reducer';
import { AuthenticationAdaptor } from 'app/user';
import { DataViewModule } from 'primeng/dataview';
import {
  ButtonModule,
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ContextMenuModule,
  DropdownModule,
  MessageService,
  ProgressSpinnerModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { BehaviorSubject } from 'rxjs';
import { CollectionDetailsPageComponent } from './collection-details-page.component';
import objectContaining = jasmine.objectContaining;

describe('CollectionDetailsPageComponent', () => {
  const COLLECTION_NAME = 'Displayed Collection';

  let component: CollectionDetailsPageComponent;
  let fixture: ComponentFixture<CollectionDetailsPageComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let messageService: MessageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COLLECTION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([CollectionEffects]),
        SidebarModule,
        ContextMenuModule,
        DataViewModule,
        TooltipModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        ToolbarModule,
        CardModule,
        ProgressSpinnerModule
      ],
      declarations: [
        CollectionDetailsPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      providers: [
        CollectionAdaptor,
        ComicAdaptor,
        AuthenticationAdaptor,
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        SelectionAdaptor,
        ReadingListAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ConfirmationService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({}),
            queryParams: new BehaviorSubject<{}>({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    spyOn(router, 'navigateByUrl');
    activatedRoute = TestBed.get(ActivatedRoute);
    (activatedRoute.params as BehaviorSubject<{}>).next({
      collectionType: CollectionType.CHARACTERS,
      collectionName: 'Superman'
    });
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the collection type is invalid', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: 'farkle',
        collectionName: COLLECTION_NAME
      });
    });

    it('redirects the user to the root page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('shows an error message', () => {
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
