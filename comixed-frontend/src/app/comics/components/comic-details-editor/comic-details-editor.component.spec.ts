/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import { ComicDetailsEditorComponent } from './comic-details-editor.component';
import { BlockUIModule } from 'primeng/blockui';
import {
  CardModule,
  ConfirmationService,
  InplaceModule,
  MessageService,
  ProgressBarModule,
  SplitButtonModule,
  TooltipModule
} from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { TableModule } from 'primeng/table';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { UserModule } from 'app/user/user.module';
import { StoreModule } from '@ngrx/store';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';

describe('ComicDetailsEditorComponent', () => {
  const API_KEY = '1234567890';

  let component: ComicDetailsEditorComponent;
  let fixture: ComponentFixture<ComicDetailsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects]),
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        InplaceModule,
        SplitButtonModule,
        TableModule,
        CardModule
      ],
      declarations: [
        ComicDetailsEditorComponent,
        VolumeListComponent,
        ScrapingIssueTitlePipe
      ],
      providers: [ComicAdaptor, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsEditorComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
