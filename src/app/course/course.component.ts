import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {Course} from "../model/course";
import {CoursesService} from "../services/courses.service";
import {debounceTime, distinctUntilChanged, startWith, tap, timeout} from 'rxjs/operators';
import {merge} from "rxjs/observable/merge";
import {fromEvent} from 'rxjs/observable/fromEvent';
import { LessonsDataSource } from '../services/lessons.datasource';
import { debounce } from 'rxjs/internal/operators/debounce';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    course:Course;

    /* Dados que serão exibidos na tela */
    // dataSource = new MatTableDataSource([]);
    dataSource: LessonsDataSource;

    /* Ordem de exibição das colunas */
    displayedColumns= ['seqNo', 'description', 'duration'];

    /* Selecionando a propriedade paginação do html */
    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    /* Selecionando a propriedade ordenação da table */
    @ViewChild(MatSort)
    sort: MatSort;

    /* Selecionando o input de filtro */
    @ViewChild('input') input: ElementRef;

    constructor(private route: ActivatedRoute,
                private coursesService: CoursesService) {

    }

    ngOnInit() {

        this.course = this.route.snapshot.data["course"];
        this.dataSource = new LessonsDataSource(this.coursesService);
        this.dataSource.loadLessons(this.course.id, '', 'asc', 0, 3)
    }
    
    /* Após inicialização */
    ngAfterViewInit() {
        /* setando página na zero */
        this.sort.sortChange.subscribe( ()  => this.paginator.pageIndex = 0);
        
        /* sobrescrevendo o keyup do input de filtro */
        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(150), /* impedir que mais de uma requisição vá ao servidor */
                distinctUntilChanged(), /* impedir que mais de uma requisição vá ao servidor quando deletamos e reincerimos */
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.loadLessonsPage();

                })
            )
            .subscribe();    

        /* Junção do sort com escolha da página para ir ao servidor */
        merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadLessonsPage())
        )
        .subscribe();
    }

    /* Método responsável por selecionar todas as propriedades e ir ao servidor */
    loadLessonsPage() {
        this.dataSource.loadLessons(this.course.id, this.input.nativeElement.value, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
    }

    /* Método de filtro da table */
    // searchLessons(search = '') {
       //  this.dataSource.filter = search.toLocaleLowerCase().trim();
    // }


}
