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

import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Button } from '@openng/optimus-ui/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Store } from '@ngrx/store';
import {
  selectUserAuthenticated,
  selectUserIsAdmin
} from '@app/account/selectors/user.selectors';
import { Menubar } from '@openng/optimus-ui/menubar';
import { MenuItem } from '@openng/optimus-ui/api';
import { selectSelectedComicListCount } from '@app/library/selectors/selected-comic-list.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';

@Component({
  imports: [Button, TranslatePipe, Tooltip, Menubar],
  selector: 'app-topbar',
  styleUrl: './topbar.scss',
  templateUrl: './topbar.html'
})
export class Topbar {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly store = inject(Store);
  readonly menuitems = signal<MenuItem[]>([]);
  readonly isAuthenticated = signal(false);
  private isAdmin = false;
  private selectedCount = 0;

  constructor() {
    this.store
      .select(selectUserAuthenticated)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: authenticated => {
          this.isAuthenticated.set(authenticated);
          this.doLoadTranslations();
        }
      });
    this.store
      .select(selectUserIsAdmin)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: isAdmin => {
          this.isAdmin = isAdmin.passed;
          this.doLoadTranslations();
        }
      });
    this.store
      .select(selectSelectedComicListCount)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: count => {
          this.selectedCount = count;
          this.doLoadTranslations();
        }
      });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  private doLoadTranslations() {
    this.menuitems.set([
      {
        label: this.translateService.instant('topbar.menu.home.item'),
        icon: 'pi pi-home',
        routerLink: '/',
        visible: this.isAuthenticated()
      },
      {
        label: this.translateService.instant(
          'topbar.menu.selected-comics.item'
        ),
        icon: 'pi pi-filter',
        items: [
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.read.item'
            ),
            icon: 'pi pi-bookmark',
            items: [
              {
                id: 'topbar-mark-comics-read',
                label: this.translateService.instant(
                  'topbar.menu.selected-comics.read.mark-read'
                ),
                icon: 'pi pi-bookmark-fill',
                disabled: this.selectedCount === 0,
                command: () => {
                  this.store.dispatch(
                    ReadComicListActions.markSelectedComics({ readState: true })
                  );
                }
              },
              {
                id: 'topbar-mark-comics-unread',
                label: this.translateService.instant(
                  'topbar.menu.selected-comics.read.mark-unread'
                ),
                icon: 'pi pi-bookmark',
                disabled: this.selectedCount === 0,
                command: () => {
                  this.store.dispatch(
                    ReadComicListActions.markSelectedComics({
                      readState: false
                    })
                  );
                }
              }
            ]
          },
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.delete.item'
            ),
            icon: 'pi pi-trash',
            items: [
              {
                id: 'topbar-mark-for-removal',
                label: this.translateService.instant(
                  'topbar.menu.selected-comics.delete.mark'
                ),
                icon: 'pi pi-times-circle',
                disabled: this.selectedCount === 0
              },
              {
                id: 'topbar-unmark-for-removal',
                label: this.translateService.instant(
                  'topbar.menu.selected-comics.delete.unmark'
                ),
                icon: 'pi pi-ban',
                disabled: this.selectedCount === 0
              }
            ]
          },
          {
            visible: this.isAdmin,
            separator: true
          },
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.scrape'
            ),
            icon: 'pi pi-cloud',
            disabled: !this.isAdmin,
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.batch-scrape'
            ),
            icon: 'pi pi-database',
            disabled: !this.isAdmin,
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.organize'
            ),
            icon: 'pi pi-folder-plus',
            disabled: !this.isAdmin,
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'topbar.menu.selected-comics.rescan'
            ),
            icon: 'pi pi-barcode',
            disabled: !this.isAdmin,
            visible: this.isAdmin
          },
          {
            separator: true
          },
          {
            id: 'topbar-clear-selections',
            label: this.translateService.instant(
              'topbar.menu.selected-comics.deselect-all'
            ),
            icon: 'pi pi-filter-slash',
            disabled: this.selectedCount === 0,
            command: () => {
              this.store.dispatch(SelectedComicListActions.clearSelections());
            }
          }
        ]
      },
      {
        label: this.translateService.instant('topbar.menu.admin.item'),
        icon: 'pi pi-key',
        visible: this.isAdmin,
        items: [
          {
            label: this.translateService.instant('topbar.menu.admin.import'),
            icon: 'pi pi-file-import',
            routerLink: '/library/import'
          },
          {
            label: this.translateService.instant(
              'topbar.menu.admin.settings.item'
            ),
            icon: 'pi pi-cog',
            items: [
              {
                id: 'topbar-library-settings-page',
                label: this.translateService.instant(
                  'topbar.menu.admin.settings.library'
                ),
                icon: 'pi pi-book',
                routerLink: '/admin/settings/library'
              },
              {
                id: 'topbar-metadata-settings-page',
                label: this.translateService.instant(
                  'topbar.menu.admin.settings.metadata'
                ),
                icon: 'pi pi-cloud',
                routerLink: '/admin/settings/metadata'
              }
            ]
          }
        ]
      }
    ]);
  }
}
