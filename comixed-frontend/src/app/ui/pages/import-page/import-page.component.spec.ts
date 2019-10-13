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
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { DataViewModule } from 'primeng/dataview';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicFileCoverUrlPipe } from 'app/pipes/comic-file-cover-url.pipe';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { ImportPageComponent } from './import-page.component';
import { By } from '@angular/platform-browser';
import { ComicFileListComponent } from 'app/ui/components/import/comic-file-list/comic-file-list.component';
import { ComicFileListToolbarComponent } from 'app/ui/components/import/comic-file-list-toolbar/comic-file-list-toolbar.component';
import { ComicFileGridItemComponent } from 'app/ui/components/import/comic-file-grid-item/comic-file-grid-item.component';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import {
  CheckboxModule,
  ConfirmationService,
  ContextMenuModule,
  MessageService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS } from 'app/app.reducers';
import { UserPreferencePipe } from 'app/pipes/user-preference.pipe';
import { ComicFileListItemComponent } from 'app/ui/components/import/comic-file-list-item/comic-file-list-item.component';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/library';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { UserService } from 'app/services/user.service';
import { ImportAdaptor, LibraryAdaptor } from 'app/library';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

const DIRECTORY_TO_USE = '/OldUser/comixed/Downloads';

describe('ImportPageComponent', () => {
  let component: ImportPageComponent;
  let fixture: ComponentFixture<ImportPageComponent>;
  let library_adaptor: LibraryAdaptor;
  let import_adaptor: ImportAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        EffectsModule.forRoot(EFFECTS),
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        DataViewModule,
        SliderModule,
        ButtonModule,
        DropdownModule,
        ProgressBarModule,
        CardModule,
        SplitButtonModule,
        ToolbarModule,
        CheckboxModule,
        SidebarModule,
        ScrollPanelModule,
        OverlayPanelModule,
        PanelModule,
        ContextMenuModule
      ],
      declarations: [
        ImportPageComponent,
        ComicFileListComponent,
        ComicFileGridItemComponent,
        ComicFileListItemComponent,
        ComicFileListToolbarComponent,
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicFileCoverUrlPipe,
        UserPreferencePipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        BreadcrumbAdaptor,
        ConfirmationService,
        MessageService,
        UserService,
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPageComponent);
    component = fixture.componentInstance;
    library_adaptor = TestBed.get(LibraryAdaptor);
    import_adaptor = TestBed.get(ImportAdaptor);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when not importing comics', () => {
    beforeEach(() => {
      library_adaptor._processingCount$.next(0);
      fixture.detectChanges();
    });

    it('does not show the progress indicator', () => {
      expect(
        fixture.debugElement.query(By.css('#import-busy-indicator-container'))
      ).toBeFalsy();
    });

    it('shows the comic file view', () => {
      expect(
        fixture.debugElement.query(By.css('#comic-file-list-container'))
      ).toBeTruthy();
    });
  });

  describe('when importing comics', () => {
    beforeEach(() => {
      library_adaptor._processingCount$.next(17);
      fixture.detectChanges();
    });

    it('does not show the comic file view', () => {
      expect(
        fixture.debugElement.query(By.css('#comic-file-list-container'))
      ).toBeFalsy();
    });

    it('shows the progress indicator', () => {
      expect(
        fixture.debugElement.query(By.css('#import-busy-indicator-container'))
      ).toBeTruthy();
    });
  });
});
