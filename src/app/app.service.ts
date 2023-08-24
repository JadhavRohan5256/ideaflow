import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppService {
    newIdea = new Subject();

    addNewIdea(value: boolean) {
        if(value) {
            this.newIdea.next(value)
        }
    }
}