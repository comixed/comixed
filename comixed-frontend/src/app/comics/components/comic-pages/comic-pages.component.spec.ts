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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/components/common/messageservice';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { ComicPagesComponent } from './comic-pages.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { AppState } from 'app/comics';
import { ComicGotPageTypes } from 'app/comics/actions/comic.actions';
import { BACK_COVER, FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import { PAGE_1, PAGE_2 } from 'app/comics/models/page.fixtures';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('ComicPagesComponent', () => {
  let component: ComicPagesComponent;
  let fixture: ComponentFixture<ComicPagesComponent>;
  let store: Store<AppState>;
  let comicAdaptor: ComicAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects]),
        CardModule,
        DropdownModule,
        DataViewModule,
        ButtonModule,
        MessagesModule
      ],
      declarations: [ComicPagesComponent, ComicPageUrlPipe],
      providers: [ComicAdaptor, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
    comicAdaptor = TestBed.get(ComicAdaptor);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subscribes to page type list upates', () => {
    store.dispatch(new ComicGotPageTypes({ pageTypes: [FRONT_COVER] }));
    expect(component.pageTypes).not.toEqual([]);
  });

  it('can change the type of a page', () => {
    spyOn(comicAdaptor, 'savePage');
    component.setPageType(PAGE_2, BACK_COVER);
    expect(comicAdaptor.savePage).toHaveBeenCalledWith({
      ...PAGE_2,
      page_type: BACK_COVER
    });
  });

  it('can block a page hash', () => {
    spyOn(comicAdaptor, 'blockPageHash');
    component.blockPage(PAGE_1);
    expect(comicAdaptor.blockPageHash).toHaveBeenCalledWith(PAGE_1);
  });

  it('can unblock a page hash', () => {
    spyOn(comicAdaptor, 'unblockPageHash');
    component.unblockPage(PAGE_1);
    expect(comicAdaptor.unblockPageHash).toHaveBeenCalledWith(PAGE_1);
  });
});
