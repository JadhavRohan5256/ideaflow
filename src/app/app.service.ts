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

    saveIdeas(ideas: {'idea_name': string, 'all_ref': string[], 'idea_HTML': string}[]) {
        ideas = ideas.filter((obj) => obj.idea_name !== "");
        localStorage.setItem('all_notes', JSON.stringify(ideas))
    }
    
    getIdeas(): {'idea_name': string, 'all_ref': string[], 'idea_HTML': string}[] {
        let storage = localStorage.getItem('all_notes')
        if(storage) {
            let parseStorage = JSON.parse(storage);
            if(parseStorage) {
                return parseStorage;
            }
        }

        return [{idea_name: '', all_ref:[], idea_HTML: ''}];
    }
}
