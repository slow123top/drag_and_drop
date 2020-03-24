import { Injectable, NgZone } from '@angular/core';
import { DndGridComponent } from './dnd-grid.component';

@Injectable({
    providedIn: 'root'
})
export class DndGridService {
    constructor(
        private ngZOne: NgZone
    ) {

    }

    dragStart(e: any) {

    }


    dragOver(e: any) {

    }

    dragEnd(e: any) {

    }
}
