import { Component } from '@angular/core';
import { DndModule } from 'dnd';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'farris-dnd';

  cellInfo = [
    { cols: 1, rows: 1, x: 0, y: 2, identify: 'aa', bgColor: 'red' },
    { cols: 1, rows: 1, x: 1, y: 2, identify: 'bb', bgColor: 'green' },
    { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
  ];

  trackById(index, item) {
    return item.identify;
  }

  drop(e) {
    console.log(e);
  }
}
