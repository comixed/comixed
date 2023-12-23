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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectLibraryPluginList,
  selectLibraryPluginState
} from '@app/library-plugins/selectors/library-plugin.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { loadLibraryPlugins } from '@app/library-plugins/actions/library-plugin.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatDialog } from '@angular/material/dialog';
import { CreatePluginDialogComponent } from '@app/admin/components/create-plugin-dialog/create-plugin-dialog.component';

@Component({
  selector: 'cx-library-plugins-configuration',
  templateUrl: './library-plugins-configuration.component.html',
  styleUrls: ['./library-plugins-configuration.component.scss']
})
export class LibraryPluginsConfigurationComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['name', 'language', 'property-count'];

  dataSource = new MatTableDataSource<LibraryPlugin>();
  libraryPluginStateSubscription: Subscription;
  libraryPluginListSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private dialog: MatDialog,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscription to library plugin list state updates');
    this.libraryPluginStateSubscription = this.store
      .select(selectLibraryPluginState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscription to library plugin list updates');
    this.libraryPluginListSubscription = this.store
      .select(selectLibraryPluginList)
      .subscribe(pluginList => (this.dataSource.data = pluginList));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from library plugin list state updates');
    this.libraryPluginStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from library plugin list updates');
    this.libraryPluginListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading the plugin list');
    this.store.dispatch(loadLibraryPlugins());
  }

  onShowCreatePluginForm(): void {
    this.logger.trace('Opening the creating plugin dialog');
    this.dialog.open(CreatePluginDialogComponent);
  }
}
