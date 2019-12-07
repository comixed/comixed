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
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicsModule } from 'app/comics/comics.module';
import { ScrapingEffects } from 'app/comics/effects/scraping.effects';
import {
  reducer,
  SCRAPING_FEATURE_KEY
} from 'app/comics/reducers/scraping.reducer';
import { ScrapingComicListComponent } from 'app/library/components/scraping-comic-list/scraping-comic-list.component';
import { MessageService } from 'primeng/api';
import { MultiComicScrapingPageComponent } from './multi-comic-scraping-page.component';

describe('MultiComicScrapingPageComponent', () => {
  let component: MultiComicScrapingPageComponent;
  let fixture: ComponentFixture<MultiComicScrapingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(SCRAPING_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ScrapingEffects])
      ],
      declarations: [
        MultiComicScrapingPageComponent,
        ScrapingComicListComponent
      ],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiComicScrapingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
