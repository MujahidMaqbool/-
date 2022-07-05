import { Component, ViewChild, EventEmitter, Output, AfterViewInit, Input, OnChanges } from "@angular/core";
import { Configurations } from "@app/helper/config/app.config";
import { MatPaginator } from "@angular/material/paginator";


@Component({
    selector: 'app-pagination',
    templateUrl: './app.pagination.component.html'
})
export class AppPaginationComponent implements AfterViewInit, OnChanges {

    // #region Local members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @Output() paginationEvent = new EventEmitter<boolean>();
    @Input() isWaitlistStatus: boolean = false;
    @Input() selectedRecordCount: number = 0;
    @Input() isShowSelectedRecord: boolean = false;

    /* Pagination  */
    totalRecords: number = 0;
    pageSize = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    previousPageSize = 0;
    pageIndex = 0;
    // isSearchByPageIndex: boolean = false;

    constructor(
    ) { }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.isWaitlistStatus) {
            this.pageSizeOptions = Configurations.WaitlistPageSizeOptions;
        } else {
            this.pageSizeOptions = Configurations.PageSizeOptions;
        }
    }

    ngAfterViewInit() {
        //this.paginationEvent.emit(true);
        this.previousPageSize = this.pageSize;
    }
    changePageSize(e: any) {
        if (e.pageIndex >= this.pageNumber) {
            this.pageNumber = ++e.pageIndex;
        }
        else {
            if (e.pageIndex >= 1) {
                this.pageNumber = --this.pageNumber;
            }
            else {
                this.pageNumber = 1
            }
        }
        if (this.previousPageSize !== e.pageSize) {
            this.pageNumber = 1;
            // this.paginator.pageSize = e.pageSize;
            this.pageSize = e.pageSize;
            this.paginator.pageIndex = 0;
        }

        this.previousPageSize = e.pageSize;
        this.paginationEvent.emit(true);
    }


    resetPagination() {
        this.pageSize = Configurations.DefaultPageSize;
        this.previousPageSize = Configurations.DefaultPageSize;
        this.paginator.pageIndex = 0;
        this.pageNumber = 1;
    }



}
