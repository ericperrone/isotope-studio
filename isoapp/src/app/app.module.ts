import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ListFileComponent } from './data-processing/list-file/list-file.component';
import { HeaderComponent } from './main/header/header.component';
import { FileProcessComponent } from './data-processing/file-process/file-process.component';
import { ContentManagerComponent } from './data-processing/content-manager/content-manager.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { MainDataProcessingComponent } from './data-processing/main-data-processing/main-data-processing.component';
import { SampleDefinitionComponent } from './data-processing/sample-definition/sample-definition.component';
import { ContentManagerStep2Component } from './data-processing/content-manager-step2/content-manager-step2.component';
import { SaveDataComponent } from './data-processing/save-data/save-data.component';
import { AlertComponent } from './shared/modals/alert/alert.component';
import { FileCsvProcessComponent } from './data-processing/file-csv-process/file-csv-process.component';
import { ConfirmComponent } from './shared/modals/confirm/confirm.component';
import { SelectBoxComponent } from './shared/modals/select-box/select-box.component';
import { FileUploaderComponent } from './shared/modals/file-uploader/file-uploader.component';
import { SelectCsvSeparatorComponent } from './shared/modals/select-csv-separator/select-csv-separator.component';
import { MainDbQueryingComponent } from './db-querying/main-db-querying/main-db-querying.component';
import { CardRefComponent } from './db-querying/cards/card-ref/card-ref.component';
import { CardAuthorsComponent } from './db-querying/cards/card-authors/card-authors.component';
import { CardGeoComponent } from './db-querying/cards/card-geo/card-geo.component';
import { CardRefDialogComponent } from './db-querying/card-dialogs/card-ref-dialog/card-ref-dialog.component';
import { CardKeywordsComponent } from './db-querying/cards/card-keywords/card-keywords.component';
import { CardKeywordsDialogComponent } from './db-querying/card-dialogs/card-keywords-dialog/card-keywords-dialog.component';
import { CardAuthorsDialogComponent } from './db-querying/card-dialogs/card-authors-dialog/card-authors-dialog.component';
import { GeoComponent } from './shared/components/geo/geo.component';
import { GeoMousePositionComponent } from './shared/components/geo-mouse-position/geo-mouse-position.component';
import { DecimalPipe } from '@angular/common';
import { GeoScaleLineComponent } from './shared/components/geo-scale-line/geo-scale-line.component';
import { GridComponent } from './shared/components/grid/grid.component';
import { ModelsMenuComponent } from './geo-modelling/models-menu/models-menu.component';
import { MixingComponent } from './geo-modelling/mixing/mixing.component';
import { EndMemberComponent } from './geo-modelling/end-member/end-member.component';
import { PlotComponent } from './shared/modals/plot/plot.component';
import { GeorocComponent } from './data-processing/georoc/georoc.component';
import { ProgressComponent } from './shared/modals/progress/progress.component';
import { LoginComponent } from './admin/login/login.component';
import { AdminComponent } from './admin/admin/admin.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { NewAdministratorComponent } from './admin/new-administrator/new-administrator.component';
import { GeorocByAuthorsComponent } from './data-processing/georoc/georoc-by-authors/georoc-by-authors.component';
import { GeorocByLocationsComponent } from './data-processing/georoc/georoc-by-locations/georoc-by-locations.component';
import { GeorocByPolygonComponent } from './data-processing/georoc/georoc-by-polygon/georoc-by-polygon.component';
import { DataPlottingSeriesComponent } from './shared/modals/data-plotting-series/data-plotting-series.component';
import { PlottingComponent } from './geo-modelling/plotting/plotting.component';
import { SpiderComponent } from './geo-modelling/spider/spider.component';
import { ReservoirComponent } from './shared/components/reservoir/reservoir.component';
import { TestComponent } from './test/test.component';
import { QueryConnectorComponent } from './db-querying/common/query-connector/query-connector.component';
import { TernaryComponent } from './geo-modelling/ternary/ternary.component';
import { CardYearComponent } from './db-querying/cards/card-year/card-year.component';
import { CardYearDialogComponent } from './db-querying/card-dialogs/card-year-dialog/card-year-dialog.component';
import { SpiderNormalizationComponent } from './shared/modals/spider-normalization/spider-normalization.component';
import { DbFiltersComponent } from './db-querying/db-filters/db-filters.component';
import { CardMatrixComponent } from './db-querying/cards/card-matrix/card-matrix.component';
import { CardMatrixDialogComponent } from './db-querying/card-dialogs/card-matrix-dialog/card-matrix-dialog.component';
import { ConversionDialogComponent } from './shared/components/conversion-dialog/conversion-dialog.component';
import { RefDialogComponent } from './db-querying/ref-dialog/ref-dialog.component';
import { EndMembersModalComponent } from './geo-modelling/end-members-modal/end-members-modal.component';
import { MixingChartComponent } from './geo-modelling/mixing-chart/mixing-chart.component';
import { GridItemContextmenuComponent } from './shared/modals/grid-item-contextmenu/grid-item-contextmenu.component';
import { DatasetBySampleComponent } from './shared/modals/dataset-by-sample/dataset-by-sample.component';
import { DatasetModalComponent } from './data-processing/dataset-modal/dataset-modal.component';
import { MergeColumnsComponent } from './shared/components/merge-columns/merge-columns.component';
import { ThesauriComponent } from './shared/modals/thesauri/thesauri.component';
import { ThesaurusComponent } from './shared/modals/thesaurus/thesaurus.component';
import { TernaryModalComponent } from './geo-modelling/ternary/ternary-modal/ternary-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ListFileComponent,
    HeaderComponent,
    FileProcessComponent,
    ContentManagerComponent,
    SpinnerComponent,
    MainDataProcessingComponent,
    SampleDefinitionComponent,
    ContentManagerStep2Component,
    SaveDataComponent,
    AlertComponent,
    FileCsvProcessComponent,
    ConfirmComponent,
    SelectBoxComponent,
    FileUploaderComponent,
    SelectCsvSeparatorComponent,
    MainDbQueryingComponent,
    CardRefComponent,
    CardAuthorsComponent,
    CardGeoComponent,
    CardRefDialogComponent,
    CardKeywordsComponent,
    CardKeywordsDialogComponent,
    CardAuthorsDialogComponent,
    GeoComponent,
    GeoMousePositionComponent,
    GeoScaleLineComponent,
    GridComponent,
    ModelsMenuComponent,
    MixingComponent,
    EndMemberComponent,
    PlotComponent,
    GeorocComponent,
    ProgressComponent,
    LoginComponent,
    AdminComponent,
    ChangePasswordComponent,
    NewAdministratorComponent,
    GeorocByAuthorsComponent,
    GeorocByLocationsComponent,
    GeorocByPolygonComponent,
    DataPlottingSeriesComponent,
    PlottingComponent,
    SpiderComponent,
    ReservoirComponent,
    TestComponent,
    QueryConnectorComponent,
    TernaryComponent,
    CardYearComponent,
    CardYearDialogComponent,
    SpiderNormalizationComponent,
    DbFiltersComponent,
    CardMatrixComponent,
    CardMatrixDialogComponent,
    ConversionDialogComponent,
    RefDialogComponent,
    EndMembersModalComponent,
    MixingChartComponent,
    GridItemContextmenuComponent,
    DatasetBySampleComponent,
    DatasetModalComponent,
    MergeColumnsComponent,
    ThesauriComponent,
    ThesaurusComponent,
    TernaryModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    NgbNavModule,
    NgbTypeaheadModule,
    NgbAlertModule,
    FormsModule, 
    ReactiveFormsModule,
    CanvasJSAngularChartsModule
  ],
  providers: [CookieService, DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
