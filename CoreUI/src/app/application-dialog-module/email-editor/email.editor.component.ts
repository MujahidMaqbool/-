import { Component, OnDestroy, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";

@Component({
    selector: "email-editor",
    templateUrl: "./email.editor.component.html"
})

export class EmailEditorComponent implements OnInit, OnDestroy {

    // #region Local Members

    @Input() value: string;
    @Input() tabIndexNumber: string;

    @Output()
    onEmailBodyChange = new EventEmitter<string>();

    toolBarItems: any = [
      "undo", "redo",
        {
            formatName: "size",
            formatValues: ["8px", "10px", "12px", "14px", "18px", "24px", "36px"]
        },
        {
            formatName: "font",
            formatValues: ["Arial", "Courier New", "Georgia", "Impact", "Lucida Console", "Tahoma", "Times New Roman", "Verdana"]
        },
        "bold", "italic", "strike", "underline", "alignLeft", "alignCenter", "alignRight", "alignJustify",  "orderedList", "bulletList",  "clear", "blockquote"
    ];

    // Removed Link and Image with consent of Iftekhar 06-Sep-2019
    // "link", "image", "separator",
    // #endregion

    constructor() {

    }

    ngOnInit() {
        this.value = this.value ? this.value : "";
    }

    ngOnDestroy() {

    }

    // #region Events

    onEmailValueChange(_val: string){
        this.onEmailBodyChange.emit(_val);
    }

    // #endregion

    // #region Methods

    // #endregion
}
