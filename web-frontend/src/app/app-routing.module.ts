import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ComicListComponent} from './comic/comic-list/comic-list.component';

const routes: Routes = [
  {path: 'comic', component: ComicListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
