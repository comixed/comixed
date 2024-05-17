/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { BatchProcessListPageComponent } from './batch-process-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  initialState as initialBatchProcessState
} from '@app/admin/reducers/batch-processes.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  BATCH_PROCESS_DETAIL_1,
  BATCH_PROCESS_DETAIL_2
} from '@app/admin/admin.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  deleteCompletedBatchJobs,
  deleteSelectedBatchJobs
} from '@app/admin/actions/batch-processes.actions';
import { MatListModule } from '@angular/material/list';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('BatchProcessListPageComponent', () => {
  const DETAIL1 = BATCH_PROCESS_DETAIL_1;
  const DETAIL2 = BATCH_PROCESS_DETAIL_2;
  const initialState = {
    [BATCH_PROCESSES_FEATURE_KEY]: initialBatchProcessState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState
  };

  let component: BatchProcessListPageComponent;
  let fixture: ComponentFixture<BatchProcessListPageComponent>;
  let store: MockStore;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchProcessListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        MatListModule,
        MatIconModule,
        MatCheckboxModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    const ELEMENT = {
      item: DETAIL1,
      selected: Math.random() > 0.5
    } as SelectableListItem<BatchProcessDetail>;

    it('can sort by selection', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'selection')
      ).toEqual(`${ELEMENT.selected}`);
    });

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'job-name')
      ).toEqual(ELEMENT.item.jobName);
    });

    it('can sort by job id', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'job-id')
      ).toEqual(ELEMENT.item.jobId);
    });

    it('can sort by status', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'status')
      ).toEqual(ELEMENT.item.status);
    });

    it('can sort by start time', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'start-time')
      ).toEqual(ELEMENT.item.startTime);
    });

    it('can sort by end time', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'end-time')
      ).toEqual(ELEMENT.item.endTime);
    });

    it('can sort by exit code', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'exit-code')
      ).toEqual(ELEMENT.item.exitStatus);
    });

    it('returns job id on an unknown column', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'farkle')
      ).toEqual(ELEMENT.item.jobId);
    });
  });

  describe('language change', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting completed batch jobs', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteCompletedJobs();
    });

    it('prompts the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(deleteCompletedBatchJobs());
    });
  });

  describe('deleting selected batch jobs', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.dataSource.data = [
        { item: DETAIL1, selected: false },
        { item: DETAIL2, selected: true }
      ];
      component.onDeleteSelectedJobs();
    });

    it('prompts the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteSelectedBatchJobs({
          jobIds: component.dataSource.data
            .filter(entry => entry.selected)
            .map(entry => entry.item.jobId)
        })
      );
    });
  });

  describe('when the list changes', () => {
    beforeEach(() => {
      component.dataSource.data = [
        {
          item: DETAIL1,
          selected: true
        },
        {
          item: DETAIL2,
          selected: false
        }
      ];
      store.setState({
        ...initialState,
        [BATCH_PROCESSES_FEATURE_KEY]: {
          ...initialBatchProcessState,
          entries: [DETAIL1, DETAIL2]
        }
      });
    });

    it('maintains existing selections', () => {
      expect(component.dataSource.data[0].selected).toBeTrue();
    });

    it('maintains existing non-selections', () => {
      expect(component.dataSource.data[1].selected).toBeFalse();
    });
  });

  describe('selections', () => {
    beforeEach(() => {
      component.dataSource.data = [
        {
          item: DETAIL1,
          selected: false
        },
        {
          item: DETAIL2,
          selected: false
        }
      ];
    });

    describe('selecting one element', () => {
      beforeEach(() => {
        component.dataSource.data[0].selected = false;
        component.anySelected = false;
        component.onSelectOne(component.dataSource.data[0], true);
      });

      it('marks the entry as selected', () => {
        expect(component.dataSource.data[0].selected).toBeTrue();
      });

      it('sets the any selected flag', () => {
        expect(component.anySelected).toBeTrue();
      });
    });

    describe('deselecting one element', () => {
      beforeEach(() => {
        component.dataSource.data[0].selected = true;
        component.anySelected = true;
        component.onSelectOne(component.dataSource.data[0], false);
      });

      it('marks the entry as unselected', () => {
        expect(component.dataSource.data[0].selected).toBeFalse();
      });

      it('clears the any selected flag', () => {
        expect(component.anySelected).toBeFalse();
      });
    });

    describe('selecting all elements', () => {
      beforeEach(() => {
        component.dataSource.data.forEach(entry => (entry.selected = false));
        component.allSelected = false;
        component.onSelectAll(true);
      });

      it('marks the entry as selected', () => {
        expect(
          component.dataSource.data.every(entry => entry.selected)
        ).toBeTrue();
      });

      it('sets the all selected flag', () => {
        expect(component.allSelected).toBeTrue();
      });
    });

    describe('deselecting all elements', () => {
      beforeEach(() => {
        component.dataSource.data.forEach(entry => (entry.selected = true));
        component.allSelected = true;
        component.onSelectAll(false);
      });

      it('marks the entry as unselected', () => {
        expect(
          component.dataSource.data.every(entry => entry.selected)
        ).toBeFalse();
      });

      it('clears the all selected flag', () => {
        expect(component.allSelected).toBeFalse();
      });
    });
  });
});
