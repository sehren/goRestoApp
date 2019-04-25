import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InsidePage } from './inside';

@NgModule({
  declarations: [
    InsidePage,
  ],
  imports: [
    IonicPageModule.forChild(InsidePage),
  ],
})
export class InsidePageModule {}
