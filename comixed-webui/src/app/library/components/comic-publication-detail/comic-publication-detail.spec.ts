/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicPublicationDetail } from './comic-publication-detail';
import { COMIC_1 } from '@app/library/library-fixtures';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, Mock } from 'vitest';

describe('ComicPublicationDetail', () => {
  const TEST_COMIC = COMIC_1;

  let component: ComicPublicationDetail;
  let fixture: ComponentFixture<ComicPublicationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicPublicationDetail],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPublicationDetail);
    component = fixture.componentInstance;
    component.comic = TEST_COMIC;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saving publication changes', () => {
    let emitterSpy: Mock;

    beforeEach(() => {
      emitterSpy = vi.spyOn(component.updateComic, 'emit');
      component.onUpdateComic();
    });

    it('emits the updated comic', () => {
      expect(emitterSpy).toHaveBeenCalled();
    });
  });
});
