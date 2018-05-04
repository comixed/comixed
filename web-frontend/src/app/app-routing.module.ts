import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {MainPageComponent} from './main-page/main-page.component';
import {DuplicatePageListComponent} from './comic/duplicate-page-list/duplicate-page-list.component';
import {ComicListComponent} from './comic/comic-list/comic-list.component';
import {ImportComicsComponent} from './comic/import-comics/import-comics.component';
import {ComicDetailsComponent} from './comic/comic-details/comic-details.component';

const routes: Routes = [
  {path: 'home', component: MainPageComponent},
  {path: 'duplicates', component: DuplicatePageListComponent},
  {path: 'comics', component: ComicListComponent},
  {path: 'comics/:id', component: ComicDetailsComponent},
  {path: 'import', component: ImportComicsComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: '**', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
