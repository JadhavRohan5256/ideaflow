import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { AppService } from "../app.service";
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    faArrowRightLong = faArrowRightLong;

    CurrentIdeas = new FormGroup({})
    ideaMenuOpen: {'flag': boolean, 'control': string} = {
        'flag': false,
        'control': ''
    }

    allIdeas = [['idea2', 'idea1', 'idea0'], ['idea5', 'idea4', 'idea3', 'idea2']]
    constructor(private appService: AppService, private formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        this.CurrentIdeas = this.formBuilder.group({});

        this.appService.newIdea.subscribe((value) => {
            if (value) {
                console.log(value)
                const ideaName = `idea_${Object.keys(this.CurrentIdeas.controls).length}`;
                this.CurrentIdeas.addControl(ideaName, new FormControl(''))
                console.log(this.CurrentIdeas.value)
            }
        })
    }

    changeDetection(event: any,controlName: string) {
        const eventRef = event.target as HTMLTextAreaElement;
        let selectionStart = eventRef.selectionStart;
        let controlValue = this.CurrentIdeas.get(controlName)?.value;
        let modifiedValue = '';
        if(controlValue.endsWith('<>')) {
            this.ideaMenuOpen = {
                flag: true,
                control: controlName
            }
        }
        else {
            this.ideaMenuOpen = {
                flag : false,
                control: ''
            }
        }
    }

    addAnotherIdea(controlName: string, index: number) {
        let controlValue = this.CurrentIdeas.get(controlName)?.value;
        let modifiedValue = '';
        if(controlValue.endsWith('<>')) {
           modifiedValue = controlValue.slice(0, -2);
           modifiedValue += `<span class="hightlight"><> ${this.convertAllIdeas(this.allIdeas[index])}</span>`
           console.log(modifiedValue)
        }

        console.log(modifiedValue)
        this.CurrentIdeas.patchValue({
            controlName: modifiedValue
        })
        console.log(this.CurrentIdeas.value)
    }

    private convertAllIdeas(value: string[]): string {
        let str = `<span class="highlight"><></span>`
        value.forEach((val, i)=> {
            str += `
            <span class="highlight">${val}</span>
            `
            if(i < value.length) {
                str += `<fa-icon class="arrow-right" [icon]="faArrowRightLong"></fa-icon>`
            }
        })

        return str;
    }
}