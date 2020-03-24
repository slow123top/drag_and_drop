import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndComponent } from './dnd.component';
import { DndGridComponent } from './dnd-grid/dnd-grid.component';

@NgModule({
  declarations: [DndComponent, DndGridComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [DndGridComponent],
  exports: [DndComponent, DndGridComponent]
})
export class DndModule { }
