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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingListPageComponent } from './reading-list-page.component';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { AppState } from 'app/app.state';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { DataViewModule } from 'primeng/dataview';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import {
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  DropdownModule,
  MessageService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule
} from 'primeng/primeng';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { REDUCERS } from 'app/app.reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';

describe('ReadingListPageComponent', () => {
  let component: ReadingListPageComponent;
  let fixture: ComponentFixture<ReadingListPageComponent>;
  let store: Store<AppState>;
  let activated_route: ActivatedRoute;
  let reading_list_name: AbstractControl;
  let reading_list_summary: AbstractControl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
        BrowserAnimationsModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        ButtonModule,
        DataViewModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule,
        ContextMenuModule
      ],
      declarations: [
        ReadingListPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryFilterComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe,
        ComicCoverComponent
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService,
        ComicService,
        UserService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({}),
            queryParams: new BehaviorSubject<{}>({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    activated_route = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
    reading_list_name = component.reading_list_form.controls['name'];
    reading_list_summary = component.reading_list_form.controls['summary'];
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
