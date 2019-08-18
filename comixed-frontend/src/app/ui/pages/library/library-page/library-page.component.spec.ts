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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { COMIC_1 } from 'app/library';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { SliderModule } from 'primeng/slider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { LibraryFilterPipe } from 'app/pipes/library-filter.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { UserService } from 'app/services/user.service';
import { UserServiceMock } from 'app/services/user.service.mock';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { LibraryPageComponent } from './library-page.component';
import { REDUCERS } from 'app/app.reducers';
import { ContextMenuModule } from 'primeng/primeng';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { LibraryModule } from 'app/library/library.module';

describe('LibraryPageComponent', () => {
  const COMIC = COMIC_1;

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        ConfirmDialogModule,
        DataViewModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        OverlayPanelModule,
        CardModule,
        ContextMenuModule,
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS)
      ],
      declarations: [
        LibraryPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        LibraryFilterComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicCoverComponent,
        LibraryFilterPipe,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      providers: [
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService,
        ComicService,
        UserService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
