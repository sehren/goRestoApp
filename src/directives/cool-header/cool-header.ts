import { Directive } from '@angular/core';

/**
 * Generated class for the CoolHeaderDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[cool-header]' // Attribute selector
})
export class CoolHeaderDirective {

  constructor() {
    console.log('Hello CoolHeaderDirective Directive');
  }

}
