import {Component, EventEmitter, Input, Output} from "@angular/core";
import {WindowService} from "../../../../styling_service/window";
import {BodyColumn} from "../../module/table_body/domain_value/body_column";
import {HeaderColumn} from "../../module/table_header/domain_value/header_column";
import {table_init_filter} from "../../utility/table_init_filter";

@Component({
    selector: "Table",
    templateUrl: "./table.html",
    styleUrls: ["./table.scss"]
})
export class TableComponent {

    static readonly PAGE_SIZE: number = 10;

    @Output() filterOrPageChanged: EventEmitter<object> = new EventEmitter<object>();

    @Input() responsiveHeadColumns: number[] = [0, 2];
    @Input() responsiveModeWidthInPx: number = 500;
    @Input() enableHeader: boolean = true;
    @Input() enableFooter: boolean = true;
    @Input() clientSide: boolean = true;
    @Input() headColumns: HeaderColumn[] = [];

    @Input()
    set bodyRows(rows: BodyColumn[][]) {
        this.bodyRowsData = rows;
        this.currentFilter = table_init_filter(this.headColumns);
        this.setCurrentPageRows();
    }

    get bodyRows(): BodyColumn[][] {
        return this.bodyRowsData;
    }

    bodyRowsData: BodyColumn[][] = [];
    currentPageRows: BodyColumn[][] = [];
    isResponsiveMode: boolean = false;
    numItems: number = 0;

    private currentPageData: number = 0;
    private currentFilter: any = {};

    constructor(
        private windowService: WindowService
    ) {
        this.windowService.screenWidth$.subscribe((width) => this.isResponsiveMode = width <= this.responsiveModeWidthInPx);
    }

    set currentPage(page: number) {
        this.currentPageData = page - 1;
        if (this.clientSide)
            this.setCurrentPageRows();
        else if (this.currentFilter["page"] !== this.currentPageData) {
            this.currentFilter["page"] = this.currentPageData;
            this.filterOrPageChanged.emit(this.currentFilter);
        }
    }

    get currentPage(): number {
        return this.currentPageData;
    }

    handleFilterChanged(filter: string): void {
        const result = JSON.parse(filter);
        this.currentFilter = result;
        this.currentFilter["page"] = this.currentPage;
        if (this.clientSide)
            this.setCurrentPageRows();
        else
            this.filterOrPageChanged.emit(this.currentFilter);
    }

    private setCurrentPageRows(): void {
        const rows = this.applyFilter();
        this.numItems = rows.length;
        this.currentPageRows = rows
            .slice(this.currentPage * TableComponent.PAGE_SIZE, (this.currentPage + 1) * TableComponent.PAGE_SIZE >= this.bodyRowsData.length ?
                this.bodyRowsData.length : (this.currentPage + 1) * TableComponent.PAGE_SIZE);
    }

    private applyFilter(): BodyColumn[][] {
        if (!this.clientSide)
            return this.bodyRowsData;

        return this.bodyRowsData
            .filter(row => row.every((column, index) => {
                let filter = this.currentFilter[this.headColumns[index].filter_name].filter;
                return !filter || filter.toString() === column.content || (
                    column.type === 0 && column.content.includes(filter)
                ) || (
                    column.type === 3 && this.headColumns[index].type_range[filter - 1] === column.content
                );
            }))
            .sort((leftRow, rightRow) => {
                for (let index = 0; index < leftRow.length; ++index) {
                    let filterSorting = this.currentFilter[this.headColumns[index].filter_name].sorting;
                    if (filterSorting === null)
                        continue;

                    const leftColumn: BodyColumn = leftRow[index];
                    const rightColumn: BodyColumn = rightRow[index];
                    const sorting: number = filterSorting === false ? 1 : -1;

                    if (leftColumn.type === 0 || leftColumn.type === 3) {
                        const result = leftColumn.content.localeCompare(rightColumn.content);
                        if (result === 0)
                            continue;
                        return result * sorting;
                    } else {
                        const leftNum = Number(leftColumn.content);
                        const rightNum = Number(rightColumn.content);
                        if (leftNum === rightNum)
                            continue;
                        return (leftNum > rightNum ? 1 : -1) * sorting;
                    }
                }
                return 0;
            });

    }
}
