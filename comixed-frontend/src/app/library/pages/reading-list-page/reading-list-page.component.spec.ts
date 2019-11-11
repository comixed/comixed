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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingListPageComponent } from './reading-list-page.component';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DataViewModule } from 'primeng/dataview';
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
  ProgressSpinnerModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationAdaptor } from 'app/user';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'app/services/user.service';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import { LibraryFilterComponent } from 'app/library/components/library-filter/library-filter.component';
import { ComicFilterPipe } from 'app/library/pipes/comic-filter.pipe';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ComicsModule } from 'app/comics/comics.module';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';
import { UserModule } from 'app/user/user.module';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { LibraryEffects } from 'app/library/effects/library.effects';

describe('ReadingListPageComponent', () => {
  let component: ReadingListPageComponent;
  let fixture: ComponentFixture<ReadingListPageComponent>;
  let activated_route: ActivatedRoute;
  let reading_list_name: AbstractControl;
  let reading_list_summary: AbstractControl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        UserModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
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
        ToolbarModule,
        TooltipModule,
        ProgressSpinnerModule
      ],
      declarations: [
        ReadingListPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryFilterComponent,
        ComicFilterPipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        BreadcrumbAdaptor,
        SelectionAdaptor,
        ReadingListAdaptor,
        FilterAdaptor,
        ConfirmationService,
        MessageService,
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
    activated_route = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
    reading_list_name = component.readingListForm.controls['name'];
    reading_list_summary = component.readingListForm.controls['summary'];
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
