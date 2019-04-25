import { NgModule } from '@angular/core';
import { HideHeaderDirective } from './hide-header/hide-header';
import { CoolHeaderDirective } from './cool-header/cool-header';
@NgModule({
	declarations: [HideHeaderDirective,
    CoolHeaderDirective],
	imports: [],
	exports: [HideHeaderDirective,
    CoolHeaderDirective]
})
export class DirectivesModule {}
