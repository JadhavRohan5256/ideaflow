import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppService {
    newIdea = new Subject();
    allIdeas!: string[]
    addNewIdea(value: boolean) {
        if(value) {
            this.newIdea.next(value)
        }
    }

    saveIdeas(ideas: string[]) {
        ideas = ideas.filter((item) => item !== "");
        localStorage.setItem('allIdeas', JSON.stringify(ideas))
    }
    
    getIdeas(): string[] {
        let storage = localStorage.getItem('allIdeas')
        if(storage) {
            let parseStorage = JSON.parse(storage);
            if(parseStorage) {
                return parseStorage;
            }
        }

        return [];
    }
}
