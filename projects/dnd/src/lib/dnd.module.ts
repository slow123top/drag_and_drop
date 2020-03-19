import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndComponent } from './dnd.component';
import { DndCellComponent } from './dnd-cell/dnd-cell.component';

@NgModule({
  declarations: [DndComponent, DndCellComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [DndCellComponent],
  exports: [DndComponent, DndCellComponent]
})
export class DndModule { }
