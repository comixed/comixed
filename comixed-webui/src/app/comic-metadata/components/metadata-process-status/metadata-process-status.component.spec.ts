/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { MetadataProcessStatusComponent } from './metadata-process-status.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataUpdateProcessState } from '@app/comic-metadata/reducers/metadata-update-process.reducer';

describe('MetadataProcessStatusComponent', () => {
  let component: MetadataProcessStatusComponent;
  let fixture: ComponentFixture<MetadataProcessStatusComponent>;
  let processState: MetadataUpdateProcessState = {
    active: Math.random() > 0.5,
    completedComics: Math.abs(Math.floor(Math.random())),
    totalComics: Math.abs(Math.floor(Math.random()))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataProcessStatusComponent],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProcessStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the processing state', () => {
    beforeEach(() => {
      component.current = 0;
      component.total = 0;
      component.processState = processState;
    });

    it('sets the completed comics', () => {
      expect(component.current).toEqual(processState.completedComics);
    });

    it('sets the total comics', () => {
      expect(component.total).toEqual(processState.totalComics);
    });
  });
});
